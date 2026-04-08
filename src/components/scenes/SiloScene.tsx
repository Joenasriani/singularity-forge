import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useGameState } from '../../store/gameState'
import { evaluateAxiom } from '../axiom/AxiomEngine'

interface PlayerPos { x: number; y: number }

const ROOM_W = 800
const ROOM_H = 460
const PLAYER_SPEED = 4
const INTERACT_RADIUS = 90

interface Particle {
  id: number; x: number; y: number; size: number; duration: number; delay: number; drift: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 1.5,
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    drift: (Math.random() - 0.5) * 40,
  }))
}

// Silo node positions (used for both rendering and proximity checks)
const NODE_HATCH   = { x: 100, y: 200 }
const NODE_SALVAGE = { x: 520, y: 160 }

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

export default function SiloScene() {
  const {
    state,
    addAxiomMessage,
    addChronicleEvent,
    adjustEnergy,
    adjustHeat,
    adjustScrap,
    setSiloHatchOpen,
    setSiloScrapCollected,
    setObjective,
  } = useGameState()

  const [player, setPlayer] = useState<PlayerPos>({ x: 400, y: 230 })
  const playerRef = useRef<PlayerPos>({ x: 400, y: 230 })
  const keysRef = useRef<Set<string>>(new Set())
  const siloEnteredRef = useRef(false)
  const heatTickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const heatHighFiredRef = useRef(false)
  const siloCompleteFiredRef = useRef(false)
  const hesitationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animFrameRef = useRef<number>(0)
  const [hatchMsg, setHatchMsg] = useState<string | null>(null)
  const particles = useMemo(() => generateParticles(28), [])

  // Proximity flags derived from player position
  const [nearHatch, setNearHatch] = useState(false)
  const [nearSalvage, setNearSalvage] = useState(false)

  // Fire silo_enter axiom once on mount
  useEffect(() => {
    if (!siloEnteredRef.current) {
      siloEnteredRef.current = true
      const msg = evaluateAxiom(state, 'silo_enter')
      if (msg) addAxiomMessage(msg)
      addChronicleEvent('Entered The Silo')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Passive heat accumulation — slow tick while in Silo
  useEffect(() => {
    const id = setInterval(() => {
      adjustHeat(1)
    }, 4000)
    heatTickRef.current = id
    return () => clearInterval(id)
  }, [adjustHeat])

  // Energy low check
  useEffect(() => {
    if (state.energy < 15) {
      const msg = evaluateAxiom(state, 'energy_low')
      if (msg) addAxiomMessage(msg)
    }
  }, [state.energy]) // eslint-disable-line react-hooks/exhaustive-deps

  // Heat high check (fires once)
  useEffect(() => {
    if (state.heat >= 75 && !heatHighFiredRef.current) {
      heatHighFiredRef.current = true
      const msg = evaluateAxiom(state, 'heat_high')
      if (msg) addAxiomMessage(msg)
    }
  }, [state.heat]) // eslint-disable-line react-hooks/exhaustive-deps

  // Silo completion check
  useEffect(() => {
    if (state.siloHatchOpen && state.siloScrapCollected && !siloCompleteFiredRef.current) {
      siloCompleteFiredRef.current = true
      const msg = evaluateAxiom(state, 'silo_complete')
      if (msg) addAxiomMessage(msg)
      addChronicleEvent('Sector 01 — all objectives cleared')
      setObjective('Await Phase II — The Weave.')
    }
  }, [state.siloHatchOpen, state.siloScrapCollected]) // eslint-disable-line react-hooks/exhaustive-deps

  // Hesitation axiom
  const resetHesitation = useCallback(() => {
    if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current)
    hesitationTimerRef.current = setTimeout(() => {
      const msg = evaluateAxiom(state, 'hesitation')
      if (msg) addAxiomMessage(msg)
    }, 8000)
  }, [state, addAxiomMessage])

  useEffect(() => {
    resetHesitation()
    return () => { if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current) }
  }, [resetHesitation])

  // Statefulness refs for action handlers
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  function handleHatch() {
    const s = stateRef.current
    if (s.siloHatchOpen) return
    if (s.energy >= 20) {
      adjustEnergy(-20)
      setSiloHatchOpen(true)
      const msg = evaluateAxiom(s, 'hatch_open')
      if (msg) addAxiomMessage(msg)
      addChronicleEvent('Hatch A7 forced open')
      setHatchMsg(null)
    } else {
      setHatchMsg(`INSUFFICIENT ENERGY — NEED 20, HAVE ${s.energy}`)
      setTimeout(() => setHatchMsg(null), 3000)
    }
  }

  function handleSalvage() {
    const s = stateRef.current
    if (s.siloScrapCollected) return
    setSiloScrapCollected(true)
    adjustEnergy(-3)
    adjustScrap(5)
    addChronicleEvent('Salvage Node looted: +5 scrap')
    const msg = evaluateAxiom(s, 'salvage_collected')
    if (msg) addAxiomMessage(msg)
  }

  // WASD movement loop + proximity updates
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      keysRef.current.add(e.key.toLowerCase())
      resetHesitation()
      // Keyboard node activation
      if (e.key === 'Enter' || e.key === ' ') {
        const p = playerRef.current
        const s = stateRef.current
        const dHatch = dist(p.x, p.y, NODE_HATCH.x, NODE_HATCH.y)
        const dSalvage = dist(p.x, p.y, NODE_SALVAGE.x, NODE_SALVAGE.y)
        // Prefer the closer in-range, incomplete node
        if (!s.siloHatchOpen && dHatch < INTERACT_RADIUS && (s.siloScrapCollected || dHatch <= dSalvage)) {
          handleHatch()
        } else if (!s.siloScrapCollected && dSalvage < INTERACT_RADIUS) {
          handleSalvage()
        }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key.toLowerCase())
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    function loop() {
      setPlayer((prev) => {
        const keys = keysRef.current
        let { x, y } = prev
        if (keys.has('w') || keys.has('arrowup'))    y = Math.max(8, y - PLAYER_SPEED)
        if (keys.has('s') || keys.has('arrowdown'))  y = Math.min(ROOM_H - 8, y + PLAYER_SPEED)
        if (keys.has('a') || keys.has('arrowleft'))  x = Math.max(8, x - PLAYER_SPEED)
        if (keys.has('d') || keys.has('arrowright')) x = Math.min(ROOM_W - 8, x + PLAYER_SPEED)
        const next = { x, y }
        playerRef.current = next
        // Update proximity flags
        setNearHatch(dist(x, y, NODE_HATCH.x, NODE_HATCH.y) < INTERACT_RADIUS)
        setNearSalvage(dist(x, y, NODE_SALVAGE.x, NODE_SALVAGE.y) < INTERACT_RADIUS)
        return next
      })
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [resetHesitation]) // eslint-disable-line react-hooks/exhaustive-deps

  const siloComplete = state.siloHatchOpen && state.siloScrapCollected

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, #0c0c1e 0%, #07070f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'scene-fade-in 0.5s ease forwards',
    }}>
      {/* Ambient dust particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'rgba(0,245,212,0.35)',
            pointerEvents: 'none',
            animation: `dust-float ${p.duration}s ${p.delay}s ease-in-out infinite`,
            '--dust-drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Room */}
      <div style={{
        position: 'relative',
        width: `${ROOM_W}px`,
        height: `${ROOM_H}px`,
        maxWidth: '96vw',
        background: 'linear-gradient(160deg, #0d0d1c 0%, #0a0a16 60%, #080810 100%)',
        border: `1px solid ${siloComplete ? 'rgba(0,245,212,0.5)' : 'rgba(0,245,212,0.22)'}`,
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: siloComplete
          ? '0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(0,245,212,0.12), inset 0 0 60px rgba(0,0,0,0.5)'
          : '0 0 80px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.8s ease, border-color 0.8s ease',
      }}>
        {/* Grid lines — industrial floor */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.06 }} width={ROOM_W} height={ROOM_H}>
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={ROOM_H} stroke="#00f5d4" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 50} x2={ROOM_W} y2={i * 50} stroke="#00f5d4" strokeWidth="1" />
          ))}
        </svg>

        {/* Teal accent wall lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--teal), transparent)', opacity: 0.4 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,245,212,0.2), transparent)', opacity: 0.3 }} />

        {/* Room label */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '5px',
          color: 'rgba(0,245,212,0.3)',
          userSelect: 'none',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          THE SILO — SECTOR 01
        </div>

        {/* Scrap counter */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          fontSize: '10px',
          letterSpacing: '1px',
          color: 'var(--amber)',
        }}>
          SCRAP: {state.scrap}u
        </div>

        {/* WASD hint */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '1px',
          color: 'rgba(0,245,212,0.18)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          [ WASD / ARROWS ] — move · [ ENTER / SPACE ] — activate nearby node
        </div>

        {/* Completion banner */}
        {siloComplete && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 30,
            pointerEvents: 'none',
            animation: 'slide-up-fade 0.6s ease both',
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '6px',
              color: 'var(--teal)',
              textShadow: '0 0 24px rgba(0,245,212,0.8), var(--glow-teal)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              SECTOR 01 — CLEARED
            </div>
            <div style={{
              fontSize: '9px',
              letterSpacing: '2px',
              color: 'rgba(0,245,212,0.4)',
            }}>
              The Weave awaits — Phase II
            </div>
          </div>
        )}

        {/* Node: STUCK HATCH */}
        <InteractiveNode
          x={NODE_HATCH.x} y={NODE_HATCH.y}
          label={state.siloHatchOpen ? 'HATCH A7' : 'HATCH A7'}
          sublabel={state.siloHatchOpen ? 'ACCESS GRANTED' : 'SEALED · −20 ENERGY'}
          actionLabel={state.siloHatchOpen ? undefined : 'FORCE OPEN'}
          onClick={state.siloHatchOpen ? undefined : handleHatch}
          completed={state.siloHatchOpen}
          color={state.siloHatchOpen ? 'var(--teal)' : 'var(--amber)'}
          statusMsg={hatchMsg}
          inRange={nearHatch}
        />

        {/* Node: SALVAGE */}
        <InteractiveNode
          x={NODE_SALVAGE.x} y={NODE_SALVAGE.y}
          label="SALVAGE NODE"
          sublabel={state.siloScrapCollected ? 'DEPLETED' : '−3 ENERGY · +5 SCRAP'}
          actionLabel={state.siloScrapCollected ? undefined : 'LOOT'}
          onClick={state.siloScrapCollected ? undefined : handleSalvage}
          completed={state.siloScrapCollected}
          color="var(--amber)"
          statusMsg={null}
          inRange={nearSalvage}
        />

        {/* Node: LOCKED DOOR */}
        <LockedNode x={700} y={230} label="THE WEAVE" />

        {/* Player dot */}
        <div style={{
          position: 'absolute',
          left: player.x,
          top: player.y,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'var(--teal)',
          border: '1px solid rgba(0,245,212,0.8)',
          boxShadow: '0 0 10px var(--teal), 0 0 20px rgba(0,245,212,0.4)',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }} />

        {/* Proximity range indicator — subtle ring around player when near a node */}
        {(nearHatch || nearSalvage) && (
          <div style={{
            position: 'absolute',
            left: player.x,
            top: player.y,
            width: `${INTERACT_RADIUS * 2}px`,
            height: `${INTERACT_RADIUS * 2}px`,
            borderRadius: '50%',
            border: '1px dashed rgba(0,245,212,0.2)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 15,
          }} />
        )}
      </div>
    </div>
  )
}

type NodeState = 'active' | 'done'

interface NodeProps {
  x: number
  y: number
  label: string
  sublabel?: string
  actionLabel?: string
  onClick?: () => void
  completed?: boolean
  color: string
  statusMsg: string | null
  inRange?: boolean
}

function InteractiveNode({ x, y, label, sublabel, actionLabel, onClick, completed, color, statusMsg, inRange }: NodeProps) {
  const [hovered, setHovered] = useState(false)
  const nodeState: NodeState = completed ? 'done' : 'active'
  const isActive = nodeState === 'active' && !!onClick
  const canActivate = isActive && !!inRange

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      zIndex: 10,
    }}>
      <div
        onClick={canActivate ? onClick : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={canActivate ? 0 : -1}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && canActivate) onClick?.() }}
        role={canActivate ? 'button' : undefined}
        aria-label={canActivate ? `${label}: ${actionLabel}` : label}
        style={{
          width: '64px',
          height: '64px',
          border: `2px solid ${nodeState === 'done' ? 'rgba(0,245,212,0.4)' : canActivate ? color : `color-mix(in srgb, ${color} 40%, transparent)`}`,
          borderRadius: '6px',
          background: nodeState === 'done'
            ? 'rgba(0,245,212,0.05)'
            : hovered && canActivate
              ? `color-mix(in srgb, ${color} 20%, transparent)`
              : `color-mix(in srgb, ${color} 8%, transparent)`,
          boxShadow: nodeState === 'done'
            ? 'none'
            : canActivate
              ? `0 0 16px color-mix(in srgb, ${color} 40%, transparent)`
              : 'none',
          cursor: canActivate ? 'pointer' : isActive ? 'not-allowed' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 6px',
          transition: 'all 0.15s ease',
          animation: isActive ? 'node-pulse 2.5s ease-in-out infinite' : 'none',
          '--pulse-color': canActivate ? color : 'rgba(0,245,212,0.2)',
          outline: hovered && canActivate ? `1px solid ${color}` : 'none',
          outlineOffset: '2px',
          opacity: nodeState === 'done' ? 0.7 : isActive && !inRange ? 0.5 : 1,
        } as React.CSSProperties}
      >
        <div style={{ fontSize: '22px', lineHeight: 1 }}>
          {nodeState === 'done' ? '✓' : inRange ? '◈' : '◇'}
        </div>
      </div>
      <div style={{
        fontSize: '9px',
        letterSpacing: '1px',
        color: nodeState === 'done' ? 'rgba(0,245,212,0.5)' : canActivate ? color : `color-mix(in srgb, ${color} 50%, rgba(80,80,100,0.5))`,
        marginBottom: '2px',
        fontWeight: nodeState === 'active' ? 'bold' : 'normal',
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{
          fontSize: '8px',
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.5px',
          marginBottom: '2px',
        }}>
          {sublabel}
        </div>
      )}
      {isActive && !inRange && (
        <div style={{
          fontSize: '8px',
          color: 'rgba(0,245,212,0.3)',
          letterSpacing: '0.5px',
          fontStyle: 'italic',
        }}>
          move closer
        </div>
      )}
      {actionLabel && canActivate && hovered && (
        <div style={{
          fontSize: '8px',
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.5px',
          animation: 'axiom-appear 0.15s ease both',
        }}>
          {actionLabel}
        </div>
      )}
      {statusMsg && (
        <div style={{
          fontSize: '8px',
          color: 'var(--danger)',
          marginTop: '3px',
          letterSpacing: '0.5px',
          animation: 'axiom-appear 0.3s ease both',
        }}>
          {statusMsg}
        </div>
      )}
    </div>
  )
}

function LockedNode({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      zIndex: 10,
      opacity: 0.45,
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        border: '1px solid rgba(80,80,100,0.4)',
        borderRadius: '6px',
        background: 'rgba(20,20,36,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 6px',
      }}>
        <div style={{ fontSize: '20px', color: 'rgba(80,80,100,0.6)' }}>🔒</div>
      </div>
      <div style={{
        fontSize: '9px',
        letterSpacing: '1px',
        color: 'rgba(80,80,100,0.6)',
        marginBottom: '5px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '8px',
        background: 'rgba(255,183,0,0.1)',
        border: '1px solid rgba(255,183,0,0.3)',
        borderRadius: '3px',
        padding: '2px 7px',
        color: 'rgba(255,183,0,0.7)',
        letterSpacing: '1px',
        display: 'inline-block',
      }}>
        Coming Soon
      </div>
    </div>
  )
}
