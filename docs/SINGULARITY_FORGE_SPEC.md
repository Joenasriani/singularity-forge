# SINGULARITY FORGE: COMPLETE BUILD SPECIFICATION

> **Version:** 1.0  
> **Date:** 2026-04-08  
> **Status:** Vertical Slice Ready (Forge Mode)

## 1. VISION & CORE PROMISE

**Singularity Forge** is a browser-based competency factory where users learn to build intelligent machines by actually building them through real-time simulation and later deployment to physical hardware.

**Core Promise:** 72 hours from first interaction to verified, deployable skill.

**Tagline:** *Become someone who builds intelligent machines.*

## 2. THE PROBLEM WE SOLVE

| Current Education | Singularity Forge |
|-------------------|-------------------|
| Passive (video → quiz → forget) | Active (crisis → survive → master) |
| Theoretical | Seamless sim-to-real |
| Slow (months/years) | Compressed competency proof |
| Certificates | Proof-of-work portfolio |

## 3. TARGET USERS

| Segment | Motivation | Entry Point |
|---------|-----------|-------------|
| Career Switchers | Enter robotics/AI | The Arm or The Eye |
| Engineers Leveling Up | Systems fluency | Advanced Weave |
| Obsessed Hobbyists | Tools, community, hardware access | Free tier, guilds |
| Enterprise Teams | Verified talent pipeline | B2B commissioning |

## 4. ARCHITECTURE: THE LATTICE

### 4.1 Four-Mode Ecosystem

| Mode | For | Experience | Status |
|------|-----|------------|--------|
| **Forge** | Self-directed learners | Open world, emergent, intrinsic | **Building Now** |
| **Spark** | Motivation-seekers | Narrative quests, rewards | Phase 2 |
| **Nexus** | Busy professionals | 2-4 hour focused sprints | Phase 2 |
| **Academy** | Certification-required users | Cohort-based, mentor-led | Phase 3 |

All modes share one competency graph, one AI mentor engine, and one portfolio system.

### 4.2 Unified Engine

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Simulation | Rust/WASM + WebGPU + custom physics | Browser-native runtime |
| Generative 3D | Procedural worlds + diffusion pipeline | Unlimited environments |
| AI Mentor | Constrained LLM, Socratic, persona-adaptive | Axiom |
| Competency Graph | Skill nodes, unlockable, transferable | Persistent progress |
| Portfolio | Proof-of-work, blockchain-anchored | Verified credentials |

## 5. VERTICAL SLICE: FORGE MODE (Phase 1)

### 5.1 Entry Ritual: The Nexus

Users enter an infinite void with distant orbiting structures representing learning paths:
- **The Arm** → manipulation
- **The Eye** → perception
- **The Swarm** → multi-agent coordination
- **The Mind** → cognition

Initial MVP focus is **The Arm** only.

### 5.2 First 60 Seconds: The Drop

A zero-tutorial crisis onboarding flow:
- damaged robot point of view
- limited control
- environmental danger
- first meaningful decision
- survival or failure
- salvage discovery
- agency established

### 5.3 World Architecture

| Zone | Function |
|------|----------|
| **The Silo** | Tutorial-by-survival |
| **The Weave** | Multi-agent emergence |
| **The Edge** | Sim-to-real transfer |

Initial MVP builds only **The Silo** prototype for **The Arm**.

### 5.4 Mentor: Axiom

A rival AI mentor with sparse, reactive interventions.

Behavior examples:
- struggling → environmental hints
- success → challenge escalation
- stuck → direct confrontation
- mastery → rivalry activation

### 5.5 Core Loop

CRISIS → survive → DISCOVERY → explore → UPGRADE → modify → NEW CAPABILITY → test → CHOICE → deeper crisis

### 5.6 Visual System

Bioluminescent industrial aesthetic:
- rusted metal
- concrete
- dust
- teal bioluminescence
- amber energy sources
- red danger states
- diegetic interface only

### 5.7 Persistent UI: The Command Core

- **Compass**
- **Chronicle**
- **Signal**
- **Status**

These should feel immersive and diegetic, not like a generic dashboard.

## 6. FUTURE EXPANSION

Future additions include The Archives, The Threshold, Spark, Nexus, and Academy modes. These are not part of the first implementation slice.

## 7. TECHNICAL STACK

| Layer | Technology | Target |
|-------|-----------|--------|
| Runtime | Rust → WASM + WebGPU | Browser-native |
| Physics | Custom deterministic core + Rapier | Reproducible |
| Rendering | wgpu, custom PBR pipeline | 1080p60 minimum |
| Audio | Web Audio API | Spatial audio |
| Network | WebRTC + edge GPU clusters | Low-latency sync |
| Storage | IndexedDB + edge cache + blockchain anchor | Resume + proof |
| AI Mentor | Constrained LLM + RAG | Contextual mentoring |

### 7.1 Simulation Specifications

- 1000 Hz internal physics target
- URDF/SDF compatible robot models
- noisy realistic sensors
- realistic actuator constraints
- procedural environments
- ROS2-native cloud bridge in future

## 8. THE 72-HOUR PIPELINE

The long-term promise is a compressed path from onboarding to validated skill demonstration. For MVP, only the emotional and structural setup of this promise should be represented, not full production validation.

## 9. BUSINESS MODEL

### 9.1 B2C Tiers

| Tier | Access | Price |
|------|--------|-------|
| Initiate | Forge Silo only | Free |
| Architect | Full Forge | $39/month |
| Professional | Academy + visibility | $149/month |
| Legionnaire | All modes + governance | $499 one-time + $29/month |

### 9.2 B2B Offerings

- Talent pipeline
- Custom simulation
- Team competitions
- Certification API
- Academy sponsorship

## 10. SUCCESS METRICS

- time-to-first-deployment
- time-to-capability
- 30-day retention
- mode-switching rate
- sim-to-real transfer success
- B2B placement rate
- NPS
- competency velocity

## 11. GLOSSARY

- **Axiom**: rival AI mentor
- **The Arm / Eye / Swarm / Mind**: learning structures
- **The Chronicle**: proof-of-work repository
- **The Command Core**: persistent UI shell
- **The Drop**: crisis-based onboarding
- **The Edge**: sim-to-real transfer zone
- **The Fold**: mode switching layer
- **The Nexus**: entry void
- **The Silo / Weave**: progression zones
- **The Archives**: structured instruction zone
- **The Threshold**: beginner onboarding zone

## 12. IMPLEMENTATION PHASES

### Phase 1: Core (Months 1-4)
Goal: vertical slice proof

Focus:
- WebGPU renderer / practical browser rendering equivalent
- physics-driven interaction
- The Nexus
- The Drop (The Arm only)
- Axiom v1
- The Silo prototype
- clean extensible architecture

### Phase 2: Scale
Add Weave, Edge, and remaining learning paths.

### Phase 3: Connect
Add Archives, Threshold, Academy, B2B platform.

### Phase 4: Expand
Add Spark, Nexus full mode, community content, internationalization.

## 13. TEAM STRUCTURE

Recommended Phase 1 team:
- CEO/Founder
- CTO
- Simulation Engineer
- Experience Designer
- AI/UX Engineer
- Backend Engineer
- Visual Designer
- Level Designer
- Frontend Engineer

## 14. RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| WebGPU adoption too low | Fallback rendering path |
| Physics too complex | Start simpler, iterate |
| 72 hours too aggressive | Reframe promise if needed |
| Axiom hallucinates | Constrained prompts + grounding |
| Cloud robot costs | Queue system + simulation-first |
| Retention fails | Better loop design + progression |

## 15. DELIVERY RULE

This document is the source of truth for product intent, but the initial implementation must remain honest:
- no fake backend systems presented as real
- no fake robot deployment claims
- no fake certification issuance
- future systems may be marked `Coming Soon`
- MVP must prioritize a real playable vertical slice over broad scaffolding
