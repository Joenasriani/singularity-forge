import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameState } from '../../store/gameState'
import { evaluateAxiom } from '../axiom/AxiomEngine'

interface PlayerPos { x: number; y: number }

const ROOM_W = 800
const ROOM_H = 460
const PLAYER_SPEED = 4

export default function SiloScene() {
  const {
    state,
    addAxiomMessage,
    addChronicleEvent,
    adjustEnergy,
    setSiloHatchOpen,
    setSiloScrapCollected,
  } = useGameState()

  const [player, setPlayer] = useState<PlayerPos>({ x: 400, y: 230 })
  const keysRef = useRef<Set<string>>(new Set())
  const siloEnteredRef = useRef(false)
  const hesitationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animFrameRef = useRef<number>(0)
  const [hatchMsg, setHatchMsg] = useState<string | null>(null)

  // Fire silo_enter axiom once on mount
  useEffect(() => {
    if (!siloEnteredRef.current) {
      siloEnteredRef.current = true
      const msg = evaluateAxiom(state, 'silo_enter')
      if (msg) addAxiomMessage(msg)
      addChronicleEvent('Entered The Silo')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Energy low check
  useEffect(() => {
    if (state.energy < 15) {
      const msg = evaluateAxiom(state, 'energy_low')
      if (msg) addAxiomMessage(msg)
    }
  }, [state.energy]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // WASD movement loop
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      keysRef.current.add(e.key.toLowerCase())
      resetHesitation()
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
        return { x, y }
      })
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [resetHesitation])

  function handleHatch() {
    if (state.siloHatchOpen) return
    if (state.energy >= 20) {
      adjustEnergy(-20)
      setSiloHatchOpen(true)
      const msg = evaluateAxiom(state, 'hatch_open')
      if (msg) addAxiomMessage(msg)
      addChronicleEvent('Hatch A7 forced open')
      setHatchMsg('HATCH OPEN — ACCESS GRANTED')
    } else {
      setHatchMsg(`INSUFFICIENT ENERGY — NEED 20, HAVE ${state.energy}`)
      setTimeout(() => setHatchMsg(null), 3000)
    }
  }

  function handleSalvage() {
    if (state.siloScrapCollected) return
    setSiloScrapCollected(true)
    adjustEnergy(-3)
    addChronicleEvent('Salvage Node looted: +5 scrap')
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'scene-fade-in 0.5s ease forwards',
    }}>
      {/* Room */}
      <div style={{
        position: 'relative',
        width: `${ROOM_W}px`,
        height: `${ROOM_H}px`,
        maxWidth: '96vw',
        background: '#0c0c18',
        border: '1px solid rgba(0,245,212,0.18)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.6)',
      }}>
        {/* Grid lines — industrial floor */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.08 }} width={ROOM_W} height={ROOM_H}>
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={ROOM_H} stroke="#00f5d4" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 50} x2={ROOM_W} y2={i * 50} stroke="#00f5d4" strokeWidth="1" />
          ))}
        </svg>

        {/* Teal accent wall lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--teal), transparent)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(0,245,212,0.3), transparent)', opacity: 0.3 }} />

        {/* Room label */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          letterSpacing: '4px',
          color: 'rgba(0,245,212,0.35)',
          userSelect: 'none',
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
          SCRAP: {state.scrap}
        </div>

        {/* WASD hint */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '1px',
          color: 'rgba(0,245,212,0.2)',
          userSelect: 'none',
        }}>
          [ WASD / ARROWS ] — move
        </div>

        {/* Node: STUCK HATCH */}
        <InteractiveNode
          x={100} y={200}
          label={state.siloHatchOpen ? 'HATCH A7' : 'HATCH A7 — SEALED'}
          actionLabel={state.siloHatchOpen ? undefined : 'FORCE OPEN  [−20 ENERGY]'}
          onClick={state.siloHatchOpen ? undefined : handleHatch}
          state={state.siloHatchOpen ? 'done' : 'active'}
          color={state.siloHatchOpen ? 'var(--teal)' : 'var(--amber)'}
          statusMsg={state.siloHatchOpen ? 'ACCESS GRANTED' : hatchMsg}
        />

        {/* Node: SALVAGE */}
        <InteractiveNode
          x={520} y={160}
          label="SALVAGE NODE"
          actionLabel={state.siloScrapCollected ? undefined : 'LOOT  [−3 ENERGY · +5 SCRAP]'}
          onClick={state.siloScrapCollected ? undefined : handleSalvage}
          state={state.siloScrapCollected ? 'done' : 'active'}
          color="var(--amber)"
          statusMsg={state.siloScrapCollected ? 'DEPLETED' : null}
        />

        {/* Node: LOCKED DOOR */}
        <LockedNode x={700} y={230} label="THE WEAVE ACCESS" />

        {/* Player dot */}
        <div style={{
          position: 'absolute',
          left: player.x,
          top: player.y,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'var(--teal)',
          boxShadow: '0 0 10px var(--teal), 0 0 20px rgba(0,245,212,0.4)',
          transform: 'translate(-50%, -50%)',
          transition: 'none',
          zIndex: 20,
        }} />
      </div>
    </div>
  )
}

type NodeState = 'active' | 'done'

interface NodeProps {
  x: number
  y: number
  label: string
  actionLabel?: string
  onClick?: () => void
  state: NodeState
  color: string
  statusMsg: string | null
}

function InteractiveNode({ x, y, label, actionLabel, onClick, state: nodeState, color, statusMsg }: NodeProps) {
  const [hovered, setHovered] = useState(false)
  const isActive = nodeState === 'active' && !!onClick

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
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={isActive ? 0 : -1}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
        role={isActive ? 'button' : undefined}
        aria-label={isActive ? `${label}: ${actionLabel}` : label}
        style={{
          width: '64px',
          height: '64px',
          border: `2px solid ${nodeState === 'done' ? 'rgba(0,245,212,0.4)' : color}`,
          borderRadius: '6px',
          background: nodeState === 'done'
            ? 'rgba(0,245,212,0.05)'
            : hovered
              ? `color-mix(in srgb, ${color} 20%, transparent)`
              : `color-mix(in srgb, ${color} 8%, transparent)`,
          boxShadow: nodeState === 'done'
            ? 'none'
            : isActive
              ? `0 0 16px color-mix(in srgb, ${color} 40%, transparent)`
              : 'none',
          cursor: isActive ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 6px',
          transition: 'all 0.15s ease',
          animation: isActive ? 'node-pulse 2.5s ease-in-out infinite' : 'none',
          '--pulse-color': color,
          outline: hovered && isActive ? `1px solid ${color}` : 'none',
          outlineOffset: '2px',
        } as React.CSSProperties}
      >
        <div style={{ fontSize: '22px', lineHeight: 1 }}>
          {nodeState === 'done' ? '✓' : '◈'}
        </div>
      </div>
      <div style={{
        fontSize: '9px',
        letterSpacing: '1px',
        color: nodeState === 'done' ? 'rgba(0,245,212,0.5)' : color,
        marginBottom: '3px',
        fontWeight: nodeState === 'active' ? 'bold' : 'normal',
      }}>
        {label}
      </div>
      {actionLabel && nodeState === 'active' && (
        <div style={{
          fontSize: '8px',
          color: hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
          letterSpacing: '0.5px',
          transition: 'color 0.15s ease',
        }}>
          {actionLabel}
        </div>
      )}
      {statusMsg && (
        <div style={{
          fontSize: '8px',
          color: nodeState === 'done' ? 'rgba(0,245,212,0.6)' : 'var(--danger)',
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
