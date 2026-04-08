# Singularity Forge

> *Become someone who builds intelligent machines.*

A browser-based robotics and AI competency platform — Phase 1 vertical slice.

---

## Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Available Commands

| Command | Purpose |
|---|---|
| `npm install` | Install all dependencies |
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | TypeScript check + production build → `dist/` |
| `npm run preview` | Serve the production build locally at `http://localhost:4173` |
| `npm run lint` | ESLint (flat config, TypeScript + React rules) |

## Build Verification

```bash
npm run build   # compiles TypeScript and bundles to dist/
npm run preview # serve dist/ at http://localhost:4173
```

Both commands are confirmed working. The build outputs a static site — no server required.

---

## Deploying to Vercel (Static Frontend)

This project is a static Vite app — no backend required.

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
# Accept defaults; Vite preset detected automatically.
```

### Option B — Vercel Dashboard

1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Vite. Settings will be:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

No environment variables needed. No backend infrastructure.

---

## What's Working (Phase 1)

- **Nexus scene** — void with 4 structures; The Arm is interactive with entrance animation and hover callout
- **The Drop** — urgency onboarding: alarms, scanlines, countdown timer, meaningful choice with auto-select fallback
- **The Silo** — WASD-navigable industrial space; Hatch, Salvage, and Weave nodes with clear interactive states
- **Axiom** — reactive rules-driven mentor (no LLM, pure state logic); message variety, fade-in animation
- **Diegetic UI shell** — Status / Axiom Signal / Compass / Chronicle panels always visible
- **Scene transitions** — CSS fade+scale between Nexus → Drop → Silo

## Coming Soon (intentionally deferred)

- The Eye, The Swarm, The Mind paths
- The Weave, The Edge zones
- Real physics simulation (Rust/WASM + WebGPU)
- AI mentor backend (LLM-powered Axiom)
- Credentials / blockchain-anchored portfolio
- Multiplayer / guild systems
