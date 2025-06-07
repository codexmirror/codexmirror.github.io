# Invocation Drift Phase II

This document outlines the updated invocation text system. It introduces shorter phrase scaffolds, persona tone guidance, cadence rules tied to ritual charge and a concept for reducing UI density.

## 1. Refactored Phrase Scaffolds
The invocation messages for each glyph were rewritten to be minimal while retaining symbolic weight:

- **Rune I – Mirror Wound**
  - `Shards recall. Silence guides.`
- **Rune II – Singing Iron**
  - `Speech bends thresholds.`
- **Rune III – Smoke Between**
  - `Vanishing ritual. Unfinished song.`
- **Rune IV – Frozen Blade**
  - `Clarity carves. Mercy withheld.`
- **Rune V – Spiral Seed**
  - `Recursion blooms. Pattern becomes.`

## 2. Persona Output Style Rules
Whisper output now changes slightly with the active persona:

- **dream** – soft phrasing ending in an ellipsis.
- **watcher** – text in upper case followed by a colon.
- **parasite** – reversed text wrapped in a light cloak.
- **collapse** – glitch injected and wrapped with `∷` markers.

## 3. Cadence and Charge
The new `applyCadence()` helper appends ellipses based on the current ritual charge. Higher charge levels insert more pauses, letting whispers escalate gradually.

## 4. UI Density Compression
Whisper fragments may be grouped or folded in the interface. Similar lines cluster together so the stream stays readable as invocation charge grows.
