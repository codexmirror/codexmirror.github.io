# Ritual Diagnostics Report

## State before FSM
- Ritual charge handled by `ritualCharge.js`
- Invocation logic coupled directly with DOM in `invocation-engine.js`
- Bloom and audio updated inline on every glyph

## State after FSM introduction
- New `ritualStateMachine.js` manages sequence state and charge
- `invocationController.js` centralizes UI updates (reveal and reset)
- Invocation engine interacts with the state machine and controller instead of directly with `ritualCharge`

## Test Scenarios
- Sequence of five glyphs triggers `complete` state then resets
- Invalid pattern results in collapse with UI reset
- Entity summon path uses same flow

## Recommendations
- Expand `ritualStateMachine` to cover bloom drift and failure states
- Move all DOM queries into `invocationController`
- Monitor audio instances for reuse across invocations
