# Copilot instructions for Singularity Forge

This repository is building **Singularity Forge**, a browser-based robotics and AI competency platform defined in `docs/SINGULARITY_FORGE_SPEC.md`.

## Source of truth
- Always read and follow `docs/SINGULARITY_FORGE_SPEC.md` before making architectural or UX decisions.
- If implementation details conflict with the spec, preserve the spec's intent and note the conflict clearly.

## Product rules
- Build the MVP as **Phase 1 vertical slice only**.
- Focus on **Forge Mode** only.
- Focus on **The Arm** path only.
- Build a real vertical slice, not placeholders.
- Do not create fake backend flows, fake robot deployment, fake metrics, or fake credentials.
- If a capability is not implemented, mark it clearly in the UI as `Coming Soon` and keep it non-interactive.

## MVP scope for now
- The Nexus selection scene
- The Drop first-60-seconds experience
- A minimal Silo level
- Axiom mentor system, lightweight v1
- Diegetic UI shell
- Browser-based experience
- Clean architecture for future expansion

## Technical rules
- Use the existing stack in this repo unless there is a strong reason not to.
- Prefer modular architecture and small reusable components.
- Keep rendering and performance practical for browser delivery.
- Stub complex future systems behind clean interfaces.
- Avoid overengineering features not needed for the Phase 1 demo.

## UX rules
- Prioritize atmosphere, clarity, and responsiveness.
- No bloated HUD.
- No generic dashboard aesthetic.
- The world should feel immersive, industrial, and bioluminescent.
- Axiom should feel rigorous, sparse, and reactive.

## Delivery rules
- Before editing, produce a short implementation plan.
- Then execute in small verified steps.
- After changes, list exactly:
  1. what was built
  2. what is real and working
  3. what remains stubbed
  4. what to test next
