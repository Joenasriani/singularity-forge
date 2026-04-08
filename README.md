# Singularity Forge

> *Become someone who builds intelligent machines.*

A browser-based robotics and AI competency platform. Phase 1 vertical slice: **Forge Mode → The Arm**.

---

## Running Locally

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Building for Production

```bash
npm run build
# Output: dist/
```

## Preview the Production Build

```bash
npm run build && npm run preview
# Opens at http://localhost:4173
```

## Lint

```bash
npm run lint
```

---

## Deployment (Static — No Backend)

This project is a fully static frontend. No server or API required.

### Vercel (recommended)

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy — done.

### Any static host (Netlify, GitHub Pages, etc.)

Build output is in `dist/`. Upload that folder or point your CI to it.

---

## What's Working (Phase 1)

- **Nexus scene** — infinite void with 4 orbiting structures; The Arm is the active path
- **The Drop** — urgency onboarding: alarms, scanlines, countdown, two meaningful choices with stat impact
- **The Silo** — explorable industrial space with interactive nodes, clear active/completed/locked states
- **Axiom** — reactive rules-driven mentor system (pure state logic, no LLM, no backend)
- **Diegetic UI shell** — Status / Axiom / Compass / Chronicle panels always visible

## Coming Soon (intentionally deferred)

- The Eye, The Swarm, The Mind paths
- The Weave zone (gate visible in Silo, locked)
- Real physics simulation (Rust/WASM + WebGPU)
- LLM-powered Axiom upgrade
- Credentials / blockchain-anchored portfolio
- Multiplayer / guild systems
