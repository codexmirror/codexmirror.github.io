"""Settlement-Service für lokale Siedlungsflächen-Daten.

Dieses Modul stellt eine explizite Ladefunktion plus zwei Abfragen bereit:

- ``load_settlement_polygons(path)``: lädt und indexiert Siedlungsflächen.
- ``point_inside_settlement(lat, lon)``: prüft Punkt-in-Polygon.
- ``distance_to_settlement_edge(lat, lon)``: Distanz zum nächsten Rand in Metern.

Es gibt bewusst **keine** automatische Initialisierung beim Import.
"""

from __future__ import annotations

from dataclasses import dataclass
from numbers import Integral
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Union

import geopandas as gpd
from pyproj import CRS, Transformer
from shapely import make_valid
from shapely.geometry import LineString, MultiLineString, MultiPolygon, Point, Polygon
from shapely.geometry.base import BaseGeometry
from shapely.ops import transform
from shapely.strtree import STRtree

BoundaryGeometry = Union[LineString, MultiLineString]


@dataclass
class _SettlementState:
    loaded: bool
    polygons_wgs84: List[Polygon]
    polygons_metric: List[Polygon]
    boundaries_metric: List[BoundaryGeometry]
    tree_wgs84: Optional[STRtree]
    tree_boundaries_metric: Optional[STRtree]
    to_metric: Optional[Transformer]


_STATE = _SettlementState(
    loaded=False,
    polygons_wgs84=[],
    polygons_metric=[],
    boundaries_metric=[],
    tree_wgs84=None,
    tree_boundaries_metric=None,
    to_metric=None,
)


def _get_metric_crs(polygons_wgs84: Sequence[Polygon]) -> CRS:
    """Wählt eine UTM-Zone auf Basis des Gesamtschwerpunkts der Settlement-Polygone."""
    merged_geometry: BaseGeometry = polygons_wgs84[0]
    for polygon in polygons_wgs84[1:]:
        merged_geometry = merged_geometry.union(polygon)

    centroid = merged_geometry.centroid
    centroid_lon = centroid.x
    centroid_lat = centroid.y

    utm_zone = int((centroid_lon + 180) // 6) + 1
    epsg_code = 32600 + utm_zone if centroid_lat >= 0 else 32700 + utm_zone
    return CRS.from_epsg(epsg_code)


def _iter_polygon_parts(geometry: BaseGeometry) -> Iterable[Polygon]:
    """Liefert Polygon-Teile einer Geometrie, leere/ungeeignete Teile werden ignoriert."""
    if geometry.is_empty:
        return

    if isinstance(geometry, Polygon):
        yield geometry
        return

    if isinstance(geometry, MultiPolygon):
        for part in geometry.geoms:
            if not part.is_empty:
                yield part
        return

    if hasattr(geometry, "geoms"):
        for sub_geometry in geometry.geoms:
            if sub_geometry.is_empty:
                continue
            if isinstance(sub_geometry, Polygon):
                yield sub_geometry
            elif isinstance(sub_geometry, MultiPolygon):
                for part in sub_geometry.geoms:
                    if not part.is_empty:
                        yield part


def _normalize_polygons(geometries: Iterable[Optional[BaseGeometry]]) -> List[Polygon]:
    """Bereinigt Geometrien und extrahiert ausschließlich nutzbare Polygone."""
    polygons: List[Polygon] = []

    for geometry in geometries:
        if geometry is None or geometry.is_empty:
            continue

        valid_geometry = make_valid(geometry)
        if valid_geometry.is_empty:
            continue

        for polygon in _iter_polygon_parts(valid_geometry):
            if not polygon.is_empty:
                polygons.append(polygon)

    return polygons


def _resolve_tree_query_results(
    query_result: Iterable[object],
    geometry_source: Sequence[BaseGeometry],
) -> List[BaseGeometry]:
    """Normalisiert STRtree-Rückgaben (Geometrien oder Indizes) auf Geometrien."""
    geometries: List[BaseGeometry] = []

    for item in query_result:
        if isinstance(item, BaseGeometry):
            geometries.append(item)
        elif isinstance(item, Integral):
            if 0 <= item < len(geometry_source):
                geometries.append(geometry_source[int(item)])

    return geometries


def _resolve_tree_single_result(
    result: object,
    geometry_source: Sequence[BaseGeometry],
) -> Optional[BaseGeometry]:
    """Normalisiert einen einzelnen STRtree-Treffer (Geometrie oder Index)."""
    if result is None:
        return None
    if isinstance(result, BaseGeometry):
        return result
    if isinstance(result, Integral) and 0 <= int(result) < len(geometry_source):
        return geometry_source[int(result)]
    return None


def load_settlement_polygons(path: str | Path) -> int:
    """Lädt Siedlungsflächen aus lokaler Datei und baut Spatial-Indices auf.

    Unterstützt Dateiformate, die von ``geopandas.read_file`` gelesen werden
    können (z. B. GeoPackage, GeoJSON).

    Returns:
        Anzahl der geladenen Polygon-Geometrien.

    Raises:
        FileNotFoundError: wenn der Pfad nicht existiert.
        ValueError: wenn keine nutzbaren Polygon-Geometrien vorliegen.
    """
    source = Path(path)
    if not source.exists():
        raise FileNotFoundError(f"Settlement-Datei nicht gefunden: {source}")

    gdf = gpd.read_file(source)
    if gdf.empty:
        raise ValueError("Settlement-Datei enthält keine Features.")

    if gdf.crs is None:
        gdf = gdf.set_crs(epsg=4326)
    elif gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    polygons_wgs84 = _normalize_polygons(list(gdf.geometry))
    if not polygons_wgs84:
        raise ValueError("Keine Polygon-Geometrien in Settlement-Datei gefunden.")

    metric_crs = _get_metric_crs(polygons_wgs84)
    to_metric = Transformer.from_crs("EPSG:4326", metric_crs, always_xy=True)

    polygons_metric = [transform(to_metric.transform, polygon) for polygon in polygons_wgs84]
    boundaries_metric = [polygon.boundary for polygon in polygons_metric]

    _STATE.loaded = True
    _STATE.polygons_wgs84 = polygons_wgs84
    _STATE.polygons_metric = polygons_metric
    _STATE.boundaries_metric = boundaries_metric
    _STATE.tree_wgs84 = STRtree(polygons_wgs84)
    _STATE.tree_boundaries_metric = STRtree(boundaries_metric)
    _STATE.to_metric = to_metric

    return len(polygons_wgs84)


def point_inside_settlement(lat: float, lon: float) -> Optional[bool]:
    """Prüft, ob ein Punkt in einer geladenen Settlement-Fläche liegt.

    Hinweis: Boundary-Punkte gelten hier bewusst als "inside" (``covers``).

    Returns:
        - True/False, wenn Settlement-Daten geladen wurden
        - None, wenn noch keine Settlement-Daten geladen wurden
    """
    if not _STATE.loaded or _STATE.tree_wgs84 is None:
        return None

    point = Point(lon, lat)
    raw_candidates = _STATE.tree_wgs84.query(point)
    candidates = _resolve_tree_query_results(raw_candidates, _STATE.polygons_wgs84)

    return any(polygon.covers(point) for polygon in candidates)


def distance_to_settlement_edge(lat: float, lon: float) -> Optional[float]:
    """Berechnet die Distanz zum nächsten Settlement-Rand in Metern.

    Returns:
        Distanz in Metern (float), wenn Daten geladen sind.
        None, wenn keine Settlement-Daten geladen wurden.
    """
    if (
        not _STATE.loaded
        or _STATE.tree_boundaries_metric is None
        or _STATE.to_metric is None
    ):
        return None

    point_metric = transform(_STATE.to_metric.transform, Point(lon, lat))

    try:
        nearest_raw = _STATE.tree_boundaries_metric.nearest(point_metric)
        nearest_boundary = _resolve_tree_single_result(
            nearest_raw,
            _STATE.boundaries_metric,
        )
        if nearest_boundary is None:
            return None
        return float(point_metric.distance(nearest_boundary))
    except AttributeError:
        # Fallback für ältere Shapely-Versionen ohne STRtree.nearest
        return float(min(point_metric.distance(boundary) for boundary in _STATE.boundaries_metric))
