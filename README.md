# Singularity Forge

> *Become someone who builds intelligent machines.*

A browser-based robotics and AI competency platform — Phase I vertical slice prototype.

---

## Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## All Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on all source files |
| `npm test` | Run Vitest unit tests (27 tests) |
| `npm run test:watch` | Run Vitest in watch mode |

## What's Working (Phase 1)

- **Nexus** — infinite void, animated stars, 4 orbiting structures with sublabels. Only **The Arm** is selectable; others show `Coming Soon` on hover. Title and subtitle animate in on load.
- **The Drop** — urgency onboarding: CRT scanlines, alarm border flash, sequential boot messages, 45 s countdown (amber → red at ≤10 s), sprint vs. crawlspace choice. Auto-resolves to crawl at `t=0`.
- **The Silo** — explorable 2D industrial room. WASD / arrow movement, three interactive nodes (hatch, salvage, locked Weave door). Node state persists in game context. Hover reveals action prompts; keyboard (Enter/Space) activates nearby nodes. Touch D-pad for mobile.
- **Axiom Mentor v1** — pure rules engine, no LLM. Deterministic triggers with message pools for variety, wired to game-state events (drop choice, silo entry, low energy, hesitation). Messages surface in AXIOM SIGNAL panel with slide-in animation.
- **Diegetic UI Shell** — four persistent corner panels: Status (gauges), Signal (Axiom feed), Compass (needle + objective), Chronicle (event log). Collapses to a compact bar on narrow/mobile viewports with a HUD toggle.
- **Scene transitions** — CSS `scene-wrapper` fade+scale on every scene key change (Nexus → Drop → Silo).
- **Persistence** — game state is automatically saved to `localStorage` and restored on reload. Use the **↺ RESET** button (bottom-center) to clear progress.

## Intentionally deferred (not in Phase 1 scope)

- The Eye, The Swarm, The Mind paths
- The Weave, The Edge zones
- Real physics simulation (Rust/WASM + WebGPU)
- AI mentor backend (LLM-powered Axiom)
- Credentials / blockchain-anchored portfolio
- Multiplayer / guild systems

---

## Deployment

### Static preview (Vercel — recommended)

This project is a **100% static Vite frontend** with no backend, no server-side rendering, and no environment variables required for the prototype.

**Vercel project settings:**

| Setting | Value |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `.` (repository root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | `18.x` or `20.x` |

No environment variables are needed for Phase 1.

### Manual static hosting

```bash
npm run build      # produces dist/
npm run preview    # verify locally at http://localhost:4173
```

Upload the `dist/` folder to any static host (Netlify, GitHub Pages, Cloudflare Pages, S3, etc.).

---

## Architecture Notes

```
src/
  store/gameState.ts          # Single React context + useReducer + localStorage persistence
  components/
    scenes/
      NexusScene.tsx          # Path selection screen
      DropScene.tsx           # Crisis onboarding micro-loop
      SiloScene.tsx           # Explorable room with interactive nodes + touch D-pad
    axiom/
      AxiomEngine.ts          # Rules-based mentor (no LLM)
      AxiomDisplay.tsx        # (reserved)
    ui/
      DiegeticShell.tsx       # Corner-panel HUD wrapper (responsive)
      StatusPanel.tsx         # Armor / Heat / Energy gauges
      SignalPanel.tsx         # Axiom message feed
      CompassPanel.tsx        # ASCII compass + objective
      ChroniclePanel.tsx      # Event log
  test/
    setup.ts                  # Vitest + @testing-library/jest-dom setup
    gameState.test.tsx        # 19 tests covering all state actions
    axiomEngine.test.ts       # 8 tests covering AxiomEngine
  App.tsx                     # SceneRouter with fade transitions + Reset button
  App.css                     # Global styles + keyframe animations
```

Stack: **Vite 6 + React 18 + TypeScript 5 + Vitest 3**. No external UI library. No backend.

