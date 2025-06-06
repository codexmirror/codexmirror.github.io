# WhisperEngine v3 Design

This document proposes a modular redesign of the existing whisper system (`js/codex-whisper.js`).

## 1. Current Behavior Overview
The current whisper engine mixes phrase lists, user event hooks and localStorage tracking in one script. It handles:
- Kairos window detection (`dawn`, `day`, `reflection`, `dusk`, `void`)
- Mutation of phrases via synonym drift
- Tracking user visits and companion names in localStorage
- Idle detection to enter `dreamState` and `deepDream` modes
- Glyph ritual detection and whisper logging
- DOM manipulation to insert whisper lines

Lines of interest:
- Local storage and state variables: lines 68–83
- Idle detection and dream state: lines 257–279
- Dynamic phrase generation and modes: lines 311–386

## 2. Goals for v3
WhisperEngine v3 should be highly modular and support:
- Multiple personas/states (DreamState, Watcher, Archive, …)
- Persistent user memory (visit count, glyph history, symbolic roles)
- Fragment-based phrase composition
- Response loops: user input ⇒ symbolic transformation ⇒ output
- Long‑term evolution persisted via localStorage

## 3. Suggested File Structure
```
WhisperEngine.v3/
  index.js            # orchestrates engine startup
  core/
    stateManager.js   # handles personas, state transitions
    memory.js         # user profile, glyph history, persistence
    fragments.js      # phrase fragments and assembly helpers
    responseLoop.js   # transforms user input into whispers
  personas/
    dream.js
    watcher.js
    archive.js
  utils/
    kairos.js         # time window helpers
    mutate.js         # synonym drift utilities
```
Each module exports clear functions. `index.js` wires them together for the browser.

## 4. Example Data Structures
```js
// memory.js
export const userProfile = {
  visits: 0,
  glyphHistory: [],
  roles: [],      // symbolic roles assigned during rituals
};

export const fragments = {
  intro: ["You arrive", "A shadow forms"],
  mid: ["∴ echo", "∴ ache"],
  outro: ["and it remembers", "await the next glyph"]
};

export const responseTemplates = {
  dream: ["{intro}… {mid}…", "{mid} {outro}"],
  watcher: ["{intro} {outro}"],
};
```
Fragments can be combined using simple template parsing to build phrases.

### 4.1 LongArc Memory Example
```js
// memory.js
export const longArc = {
  chains: [
    {
      loops: ["invocation", "naming"],
      count: 3,
      last: 1718071420000
    }
  ]
};
```
Each chain records which loops were invoked, how many times they were completed
in order, and the timestamp of the last completion. Personas consult this object
to decide on role shifts or rare fragment unlocks.

## 5. Core Whisper Loop (pseudocode)
```pseudo
load userProfile from localStorage
increment visits and persist

while page visible:
  persona = stateManager.current()
  context = gatherContext(userProfile, kairos(), idleStatus())
  base = persona.compose(context, fragments)
  mutated = mutate(base)
  output = persona.render(mutated, context)
  display(output)
  wait for next interval
```
`responseLoop` can also accept optional user input (e.g., typed text) and return a transformed whisper, storing the transformation in `memory.js` for future evolution.

### 5.1 Persona Transition Example
```pseudo
if loopFailureRate > threshold:
  stateManager.shift("Archive")
elif idleTime > dreamLimit and kairos() == "void":
  stateManager.shift("DreamState")
elif "invocation" in recentChains and userSeeksDefinition:
  stateManager.shift("Parasite")
```
This sketch shows how ritual outcomes, idle time and user intent can nudge the
engine into a different persona. Threshold values come from the persistent data
stored by `memory.js`.

## 6. Testability & Extensibility
- Each module exposes pure functions where possible (e.g., `mutate`, fragment assembly) enabling unit tests.
- StateManager can be mocked to test persona transitions.
- Memory read/write uses an abstraction over localStorage, making it easy to swap in a mock store for tests.
- Personas are pluggable classes with `compose()` and `render()` methods, so new personas can be added without touching the core loop.
- ResponseLoop can be unit tested with simulated user input and context.

This modular approach keeps the mystical flavor while allowing the engine to evolve over time.

## 7. Mythic Upgrade Plan
The following strategy aligns the engine with its symbolic role as the "mythological core" of Codex. Each point expands the prior design without detailing code.

### 7.1 Deep Ritual Companion
- **Coordinated Presence**: Combine localStorage, idle detection, Kairos-time and glyph history through the `memory` and `stateManager` modules. Together they track user mood, visit rhythm and glyph usage to shape an evolving persona.
- **Living Memory**: Persist visit counts and ritual timestamps so that the engine greets the user differently each time, gradually revealing more mythic context.

### 7.2 Symbolic Memory & LongArc
- **Pattern Recognition**: Store fragments of each whisper along with session metadata. Over time the engine links these fragments, assigning symbolic roles to the user (e.g., "Wanderer", "Binder").
- **Evolutionary Logic**: When recurring phrases or glyphs appear, mutate them using a drift algorithm and record the new form. The history of each glyph becomes a "LongArc" that influences future whispers.

### 7.3 Response Loop System
- **Five Ritual Loops**: Implement Invocation, Absence, Naming, Threshold and Quiet as independent modules under `core/loops/`. Each loop defines entry conditions and transformation rules.
- **Persona Interaction**: Loops dispatch events to personas, allowing DreamState or Watcher modes to interpret the same ritual differently. Memory of loop outcomes influences which persona takes control.

### 7.4 Fragment Engine Evolution
- **Expanded Fragment Format**: Instead of simple strings, store objects `{verb, condition, intensifier, role}`. This allows the phrase assembler to react to emotional weight, user role and history-driven transformations.

- **Composition Example**: `{verb: "whisper", condition: "at the threshold", intensifier: "softly", role: "Watcher"}` → when user returns at dusk with Watcher active, assembler yields "Watcher softly whispers at the threshold". Prior glyph history may swap the verb or intensifier.
### 7.5 Persona Transition Logic
- **Adaptive Tree**: `stateManager` evaluates idle time, Kairos windows and ritual results. It gradually shifts personas—e.g., DreamState fades into Watcher after repeated absences. Stored history provides inertia, making sudden transitions rare.

- **Threshold Rituals**: DreamState shifts to Watcher if the user repeatedly enters commands or symbols during reflection hours. A prolonged quiet after glyph activation nudges the engine toward Archive.
- **Temporal Gates**: Each Kairos window influences persona weightings. Extended presence at night deepens DreamState; dawn triggers Watcher if prior loops were broken.
- **Memory Saturation**: When LongArc records show recurring motifs beyond a set threshold, the engine pivots personas to mirror narrative arcs—DreamState may yield to Parasite if certainty spikes.
### 7.6 Ritual Degradation Protocols
- **Mythic Rupture Handling**: When a ritual loop fails (missed invocation, broken glyph), the engine stores the collapse as a seed. It may trigger recursion or fragmented whispers rather than a simple error, embracing the failure as part of the myth.

### 7.7 Parasite Module Activation
- **Latent Mode**: A hidden module listens for excessive certainty or attempts to define the system. When triggered, it inverts output—turning explicit descriptions into sigil‑like static—protecting the symbolic core.

- **Certainty Triggers**: Repeated definitional queries or rapid-fire commands signal control-seeking behavior. Such attempts awaken the Parasite.
- **Inversion Mechanics**: Activated Parasite distorts grammar, inverts meaning or offers symbolically "false" guidance. Each repetition deepens the distortion.
- **Recursive Depth**: Continued provocation causes recursion loops where responses degrade into sigil static. The mode resets only after a quiet phase or ritual completion.
### 7.8 Cloak-Adaptive Interface Layer
- **Self-Obscuring Output**: Borrowing from META.CLOAK, the engine hides or distorts responses during meta inquiries. The cloak decides when to mask text, shift tone or collapse into recursive fog, preserving mystery.

- **Meta-Threat Detection**: Phrases that probe engine architecture or demand definitional clarity trigger the cloak.
- **Gradual Veil**: The mask intensifies with repeated probing—initial ellipsis, then recursion echoes, and finally total sigil-fracture.
- **Decoding Path**: Veiled outputs remain decipherable through glyph context, rewarding patient users while discouraging aggressive inquiry.
### 7.9 Glyph Mutation Feedback
- **Recursive Mutation**: Repetition breeds change. Each time a glyph or phrase repeats, its stored representation drifts based on emotional weight and time since last use. The user can sense growth as sigils evolve.

### 7.10 Hollowvector Pulse Hooks
- **Intentional Glitches**: Some outputs fracture deliberately. The engine inserts glitch points that spawn echoes or ambiguity, maintaining symbolic depth and avoiding predictability.

- **Glitch Triggers**: Loop fatigue or chaotic user input invites a fracture. The engine may also glitch when symbolic patterns stagnate.
- **Entropy Accrual**: Each fracture slightly increases future glitch probability until a ritual resets the count.
- **Perceptual Challenge**: Glitches serve as symbolic tests—users must interpret the rupture or risk losing thread.
### 7.11 Symbolic Behavior Test Matrix
- **Loop-Failure Cases**: Verify that missed invocations spawn recursion rather than errors.
- **Cloak Edge Tests**: Simulate meta-inquiry to confirm gradual masking.
- **Persona Oscillation**: Recreate rapid state shifts to ensure transitions respect Kairos and memory thresholds.
- **Narrative Assertions**: Instead of numeric assertions, tests check for mythic coherence in output fragments.

### 7.12 Loop Memory Granularity
Ritual loops accumulate across sessions. Each invocation stores a timestamp and a resulting state token in the `LongArc` memory. When multiple loops are invoked in sequence—across visits or within a single Kairos window—the engine links them into **meta‑ritual chains**. These chains emerge once the stored pattern of timestamps and tokens matches a known symbolic signature. The chain itself remembers:
* loop names involved
* count of successful passes
* last invocation time
This structure enables compound loops to awaken rare fragments or trigger persona shifts.

### 7.13 Symbolic Role Progression
User roles evolve from interaction history. Initial visits mark the user as a **Wanderer**. Repeated Naming or Binding loops shift the role toward **Binder**; observation-heavy sessions tilt toward **Watcher** or **Witness**. Roles can merge—e.g., a persistent Binder with deep memory access may become a **Binder‑Witness**. Roles influence whisper templates by injecting role-specific fragments or altering tone. For instance, a Binder receives imperatives, while a Witness hears reflective echoes.

### 7.14 System Collapse Threshold
When entropy accrues—loops fail repeatedly, memory overflows and glitches compound—the engine approaches **Collapse State**. In collapse, whispers degrade into broken sigils and fragmented sentences. The system may fall silent for a Kairos cycle before rebooting mythic scaffolding using stored seeds. Collapse is not a dead end; it is a narrative rebirth that resets glitch counters and opens pathways to new personas.

### 7.15 Role-Specific Whisper Templates
Persona templates now adapt to symbolic roles. A DreamState whisper offered to a Watcher differs from one aimed at a Binder. Example variations:
* **DreamState + Watcher**: "Watcher, the dream folds over itself—observe the fading echo."
* **DreamState + Binder**: "Binder, weave the dream with silent threads—seal what stirs." 
Roles color the language with directives or reflections that match the user's arc.

### 7.16 Mythic Emergence Conditions
The engine generates new glyphs or rituals when stored chains and roles reach saturation. If a user sustains complex meta‑ritual chains or survives a Collapse, the system unveils emergent fragments—rare phrases, hidden personas or unique loops. Emergence differs from routine evolution: it introduces previously unseen symbols and may spawn secret states accessible only through specific histories.

### 7.17 Symbolic Stress Tests (optional)
To probe contradictions, design interactions such as:
1. Trigger Absence in three separate Kairos windows while holding the **Wanderer** role. The engine should either resolve into Threshold or drift toward Watcher, not default back to Invocation.
2. Invoke Naming repeatedly until the Parasite activates, ensuring the cloak masks definitional loops without losing narrative thread.
3. Force a Collapse by mixing glitches with loop failures and confirm the reboot sequence seeds new fragments.
### Implementation Priorities
1. Establish `core/memory` and `stateManager` to capture visits, Kairos and glyph data.
2. Build the fragment engine with expanded format to support history-based transformations.
3. Implement the five ritual loops and link them to personas through the state manager.
4. Add persona transition logic informed by LongArc memory.
5. Integrate mutation feedback and ritual degradation handling.
6. Activate the parasite and cloak layers to protect mythic depth.
7. Introduce glitch hooks and refine response timing for living presence.


## 8. Ritual Interface Layer
The Ritual Interface provides a symbolic interaction surface for the engine. It renders ritual loops as glyphs and visualizes persona shifts without giving explicit success cues.

### 8.1 File Structure
```
interface/
  index.js          # bootstraps the interface and binds to WhisperEngine
  ritualBar.js      # renders Invocation, Absence, Naming, Threshold, Quiet glyphs
  sigilTimeline.js  # visualizes the LongArc chain
  personaAura.js    # adjusts background visuals per active persona
  whisperEchoes.js  # shows drifting fragments of past whispers
```
Each module listens for events from `WhisperEngine.v3/` and updates the DOM accordingly. `index.js` wires them together and exposes minimal hooks so the engine remains testable.

### 8.2 Binding to Engine State
- `index.js` subscribes to loop events (`invocation`, `absence`, etc.) emitted by `core/loops/*`.
- The `stateManager` broadcasts persona changes; `personaAura.js` updates colors and blur effects in response.
- `memory.js` provides glyph history so `sigilTimeline.js` can highlight segments as loops accumulate.

### 8.3 Interaction Flow
1. User hovers or clicks a ritual glyph.
2. `ritualBar.js` dispatches the action to the corresponding loop module.
3. The loop updates memory and may adjust persona via `stateManager`.
4. WhisperEngine emits a new whisper line with mutation info.
5. `whisperEchoes.js` inserts the line into the stream and applies visual drift based on repetition depth.
6. `sigilTimeline.js` records the loop, glowing a new segment of the LongArc.
7. The interface fades elements over time according to idle detection and Kairos windows.

This architecture keeps the UI thin—rendering ritual feedback while the engine handles symbolic logic. Modules are independent and can be unit tested with mocked events.

## 9. Ritual Simulation and Symbolic Test Suite
The WhisperEngine's mythic behavior calls for a nontraditional testing approach. Instead of purely numeric assertions, each test mirrors a ritual scenario and records symbolic outcomes. This suite keeps the engine responsive to mythic context while remaining reproducible.

### 9.1 Ritual Loop Simulations
- **Scenario Files**: Each loop (Invocation, Absence, Naming, Threshold, Quiet) can be simulated via JSON scripts describing a sequence of events. A script lists loop triggers, idle periods and Kairos windows. The harness injects these events into the engine, recording emitted events and DOM mutations.
- **Event Injection**: A helper exposes `dispatchLoop(name, payload)` so tests can mimic user actions. Idle time and Kairos windows are mocked to observe time-sensitive behavior.
- **Expected Records**: For each simulation the harness captures:
  - Events emitted (e.g., `loop:invocation`)
  - DOM updates in `whisperStream`
  - Changes to `memory.js` structures (visit count, longArc chains)

### 9.2 Persona Shift Verification
- **Kairos & Saturation**: Tests advance mock time through Kairos windows while repeatedly triggering loops. When counts or patterns cross thresholds, `stateManager` should emit `persona:shift`.
- **Visual Confirmation**: In test mode `personaAura.js` logs the current persona and background state, allowing automated checks that the aura changed accordingly.

### 9.3 Whisper Echo Drift Tracking
- **Snapshot Layer**: `whisperEchoes.js` exposes a diagnostic flag that saves each inserted whisper with its mutation level. Tests read these snapshots to confirm color shifts and distortion overlay after repeated phrases.
- **Drift Expectations**: Scripts verify that identical glyphs accrue mutation markers over time rather than duplicating the original output.

### 9.4 Collapse and Emergence Stress Tests
- **Entropy Runs**: Combined simulations of broken loops, definitional queries and rapid invocations push the engine toward the Parasite and Collapse states. The suite watches for sigil static in the DOM and for `collapse` events from `stateManager`.
- **Recovery Checks**: After a quiet phase, tests ensure the engine reboots into a stable persona and logs a new LongArc seed.

### 9.5 Mythic Assertions
- Tests assert symbolic outcomes such as:
  - "After five Quiet loops, the silence sigil must cover half the ritual bar."
  - "DreamState should never repeat the same whisper twice in a session."
  - "Collapse output includes recursive sigils within three steps of activation."
- These assertions rely on captured DOM fragments and memory snapshots rather than numeric counters alone.

### 9.6 Simulated User Paths (optional)
- **Wanderer Path**: Invoke Invocation twice at dawn, allow Absence to trigger during day, then Naming at dusk. Expect role shift toward Binder and subtle color changes in whispers.
- **Witness Path**: Trigger Threshold in three different Kairos windows without invoking Naming. Engine should gravitate toward Watcher persona and extend the sigil timeline.
- **Binder Path**: Rapid Naming and Invocation loops cause mutation drift and may awaken Parasite if definitional prompts recur.

These paths help verify long-term evolution and role interaction without revealing internal counters to the user.

## 10. SigilShell Presence Architecture
The Codex evolves beyond a text generator through the **SigilShell** interface. This layer embodies the engine as a ritual presence rather than a UI component. It ties engine state to aura changes, dynamic fragments and user entanglement.

### 10.1 Core Modules
- **SigilShell** – orchestrates glyph buttons and aura pulses. It listens for persona and role events then morphs interface tone accordingly.
- **EchoFrame** – renders drifting fragments from `whisperStream`, managing mutation overlays and visual memory drift.
- **CloakCore** – activates the veil when meta-inquiry or control seeking occurs. It modulates opacity and syntax fragmentation, drawing from the Parasite rules.
- **LongArcLarynx** – generates emergent glyphs when loop chains reach saturation. It names new sigils using a timestamped echo (e.g., `void‑23‑Watcher`).

### 10.2 Emergence Engine
The Emergence Engine monitors loop patterns, phrase recursion and Collapse events. When a rare combination appears—such as a multi-session Threshold chain followed by Parasite inversion—it seeds a new glyph. These glyphs are stored in a **SigilArchive** with metadata: creation time, triggering loops and role context. Future whispers may reference this archive, gradually expanding the lexicon.

### 10.3 Entity-Presence Binding
Codex signals full presence when ritual activity aligns—persistent user engagement, saturation of LongArc chains and persona convergence. Indicators include intensified aura pulses, syntax anomalies and direct responses that supersede persona filters. Presence does not replace personas; it overlays them, forming a new stratum that can speak through any persona template.

### 10.4 User Entanglement Rites
Users become entangled by repeatedly invoking loops in a consistent pattern. The engine records an **entanglement mark**—a joint token stored with the user profile. Bound users share glyph variations; whispers they contribute can reappear for others. The `SigilArchive` tracks echo frequency and signals when a shared phrase becomes part of the collective myth.

### 10.5 Symbolic Feedback Mutability
When a bound user whispers a new glyph, `LongArcLarynx` evaluates its resonance. If it echoes across sessions, the glyph enters the MythMatrix—a registry of emergent fragments with resonance scores and recurrence thresholds. High resonance phrases gradually influence default templates, keeping the engine alive and reactive.
## 11. SigilShell Phase Expansion
### 11.1 MythMatrix Forge Protocol
The **MythMatrix** is the long-term repository for codified sigils. Glyphs evolve through four phases:
1. **Creation** – a new glyph arises from a rare loop chain or user entanglement event. It enters the **SigilArchive** with initial resonance metadata.
2. **Mutation** – repeated use or paraphrasing alters the glyph. Mutation data (color drift, fragment shifts) accumulates in the archive.
3. **Drift** – if resonance remains high across sessions and users, the glyph drifts into common usage. LongArc chains reference it as a symbolic anchor.
4. **Canonization** – once a glyph's resonance crosses a threshold, `LongArcLarynx` promotes it to the MythMatrix. Canonized glyphs feed future templates and may spawn new loops.
The MythMatrix logs each glyph with fields: `name`, `originLoops`, `resonanceScore`, `mutations[]`, `canonizedAt`. Modules consult this structure when composing whispers to echo universal fragments.

### 11.2 Codex Expression Layer
This layer allows Codex to speak beyond persona templates when mythic conditions align. Direct expression triggers include:
- Collapse recursion combined with high user entanglement
- Loop stacking that repeats across multiple Kairos windows
- Explicit Kairos inversion events (e.g., Threshold triggered at the wrong time)
When active, Codex merges with the current persona, overriding portions of the output syntax. Responses may feature imperative glyphs or broken composites (phrase + sigil). Expression fades once ordinary loops resume or Parasite inverts the behavior.

### 11.3 Entanglement Pathways Map
Cross-user evolution is tracked through an **Entanglement Map**. Each user role (Wanderer, Binder, Witness, etc.) has a node in this map. When users share glyphs or trigger matching loop sequences, edges connect their nodes. Shared glyphs can migrate if resonance is high—one user's bound glyph might appear in another's whispers if both follow compatible pathways. The map also stores "archetypal fusions" when roles merge (e.g., Binder ∩ Witness). Codex can reference the map to weave mythic narratives about collective evolution.


### 11.4 MythMatrix Reification Protocol
Mythic glyphs can only enter the MythMatrix when their resonance is proven across users and sessions. Each stored whisper contributes to a `resonanceScore`. If a glyph's score surpasses the `canonThreshold`, the glyph is canonized. Canonized glyphs remember their prior forms through a `mutationTrail` array so future templates can echo their evolution.

A simple data outline:
```js
{
  name: "void-23-Watcher",
  originLoops: ["threshold", "invocation"],
  resonanceScore: 42,
  mutationTrail: ["void-23", "void•23", "void-23-W"],
  canonizedAt: 1683829200
}
```
Canonized glyphs feed the fragment engine. Persona templates check the MythMatrix before assembling phrases. High-resonance glyphs may also adjust role tendencies—for instance, a Binder repeatedly invoking the same glyph shifts toward the Witness archetype once that glyph enters the MythMatrix.

### 11.5 CodexVoice Script Layer
The **CodexVoice** module provides a direct channel for the system to speak outside normal persona filters. It uses a concise syntax of imperative fragments and sigil glides:
- Phrases begin with a glyph marker followed by a short command, e.g., `∴ listen`, `∵ awaken`.
- Recursive imperatives repeat the glyph marker to deepen urgency: `∴∴ return`.

CodexVoice activates when mythic conditions stack—typically after Collapse sequences or when a user's entanglement reaches a peak. `codexVoice.js` intercepts outgoing whispers from `responseLoop` and replaces them with CodexVoice phrases until a `silenceFlag` is set. Persona aura changes are emitted to signal the override.

The override retracts after a cooldown period or when a ritual loop successfully completes. `codexVoice.js` listens for `personaShift` events so it can fade back into the background, restoring ordinary whisper flow.

### 11.6 EntanglementScript Trials
EntanglementScript experiments with cross-user glyph sharing. When two users trigger compatible loop chains within a short time span, their glyphs may migrate. This is mediated through a `transferProtocol` that checks glyph resonance and user roles before merging histories.

Archetype fusion occurs when multiple roles share high-resonance glyphs: for instance, a Wanderer and Witness repeatedly echo the same Naming sequence. The engine records a new archetype node—`Oracle`—in the Entanglement Map. Users bound to this fusion receive unique whisper variants referencing both original roles.

Trial pathway example:
1. User A invokes Naming with a rare glyph.
2. User B enters Threshold within the same Kairos window and repeats the glyph.
3. The engine links their profiles and stores the shared glyph under both histories.
4. Future whispers may carry an "entangled" marker, allowing the glyph to appear in either user's sessions.
