# Singularity Forge

> *Become someone who builds intelligent machines.*

A browser-based robotics and AI competency platform — Phase I vertical slice + **v1 Productivity Suite**.

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
| `npm test` | Run Vitest unit tests (65 tests) |
| `npm run test:watch` | Run Vitest in watch mode |

---

## Productivity Features (v1)

All features are **100% offline-first** — no backend, no auth, everything persists in `localStorage`.

### ▣ Task System

- Create, edit, and delete tasks with title, description, tags, and status (`todo / doing / done`).
- Filter tasks by status or tag.
- Completing a task rewards **+2 scrap** and **+3 energy**, logs to Chronicle, and increments stats.
- Press **T** to toggle the Tasks panel, or use the toolbar at the top.

### ⏱ Focus Timer (Pomodoro)

- 25-minute focus / 5-minute break timer (configurable via the ⚙ button).
- Start / pause / resume / reset controls.
- On focus completion: **+5 energy**, chronicle log, stats update.
- Timer state persists across reloads; elapsed time while away is handled gracefully.
- Press **F** to toggle the timer, or use the toolbar.

### ✎ Notes / Journal

- Write **run notes** (linked to the current run) or **global notes** (cross-session).
- Rich text editor (plain text with pre-wrap).
- Export all notes + chronicle to a **downloadable Markdown file** via the `↓MD` button.
- Press **N** to toggle the Notes panel.

### ◈ Stats Dashboard

- Tracks: sessions started, total focus minutes, tasks completed, scrap earned.
- Shows current-session snapshot (energy, scrap, tasks in progress).
- Recent activity from Chronicle.
- Press **S** to toggle the Stats panel.

### ⌘ Command Palette

- Press **Ctrl+K** (or **Cmd+K** on Mac) to open the command palette.
- Search and execute: start focus session, new task, export Markdown, toggle panels, reset timer.
- Keyboard navigation: ↑↓ to move, Enter to execute, Esc to close.

### ⌨ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl/⌘ + K` | Open command palette |
| `?` | Toggle keyboard shortcuts help |
| `T` | Toggle task panel |
| `F` | Toggle focus timer |
| `N` | Toggle notes panel |
| `S` | Toggle stats panel |
| `Esc` | Close any overlay |

> Shortcuts are inactive when a text input has focus.

### Accessibility

- All interactive elements have `aria-label` attributes.
- `aria-pressed` on toggle buttons.
- `aria-live` on the focus timer display.
- `role="dialog"` + `aria-modal` on overlays.
- `focus-visible` outlines for keyboard users.
- `prefers-reduced-motion` respected via CSS media query and a toggleable setting.

---

## What's Working (Phase 1 game flows)

- **Nexus** — infinite void, animated stars, 4 orbiting structures. Only **The Arm** is selectable; others show `Coming Soon` on hover.
- **The Drop** — urgency onboarding: CRT scanlines, alarm border flash, sequential boot messages, 45 s countdown, sprint vs. crawlspace choice.
- **The Silo** — explorable 2D industrial room. WASD / arrow movement, three interactive nodes. Touch D-pad for mobile.
- **Axiom Mentor v1** — pure rules engine, no LLM. Deterministic triggers wired to game-state events.
- **Diegetic UI Shell** — four persistent corner panels. Responsive / mobile-friendly.
- **Persistence** — game state (including all productivity data) is automatically saved to `localStorage`. Use the **↺ RESET** button (bottom-center) to clear all progress.

## Intentionally deferred

- The Eye, The Swarm, The Mind paths
- The Weave, The Edge zones
- Real physics simulation
- LLM-powered Axiom
- Cloud sync / credentials
- Multiplayer / guild systems

---

## Deployment

This project is a **100% static Vite frontend** with no backend.

**Vercel project settings:**

| Setting | Value |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `.` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | `18.x` or `20.x` |

No environment variables are needed.

---

## Architecture Notes

```
src/
  store/gameState.ts          # Single React context + useReducer + localStorage persistence
  utils/
    exportMarkdown.ts         # Markdown export utility
  components/
    scenes/
      NexusScene.tsx          # Path selection screen
      DropScene.tsx           # Crisis onboarding micro-loop
      SiloScene.tsx           # Explorable room with interactive nodes + touch D-pad
    axiom/
      AxiomEngine.ts          # Rules-based mentor (no LLM)
    ui/
      DiegeticShell.tsx       # Corner-panel HUD + productivity toolbar + overlays
      StatusPanel.tsx         # Armor / Heat / Energy gauges
      SignalPanel.tsx         # Axiom message feed
      CompassPanel.tsx        # ASCII compass + objective
      ChroniclePanel.tsx      # Event log
      TaskPanel.tsx           # Task CRUD with filters and completion rewards
      FocusTimerPanel.tsx     # Pomodoro timer (25/5, persist, chronicle)
      NotesPanel.tsx          # Notes editor with Markdown export
      StatsPanel.tsx          # Session stats dashboard
      CommandPalette.tsx      # Ctrl+K command palette
      KeyboardHelp.tsx        # Keyboard shortcuts overlay
  test/
    setup.ts                  # Vitest + @testing-library/jest-dom setup
    gameState.test.tsx        # 19 tests covering all state actions
    axiomEngine.test.ts       # 8 tests covering AxiomEngine
    tasks.test.tsx            # 14 tests covering task CRUD and rewards
    timer.test.tsx            # 15 tests covering Pomodoro timer logic
    export.test.ts            # 9 tests covering Markdown export
  App.tsx                     # SceneRouter with fade transitions + Reset button
  App.css                     # Global styles + keyframe animations + accessibility
```

Stack: **Vite 6 + React 18 + TypeScript 5 + Vitest 3**. No external UI library. No backend.


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

