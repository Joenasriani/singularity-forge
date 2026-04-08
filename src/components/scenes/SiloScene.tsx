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

  // Hesitation axiom — stable because addAxiomMessage is now memoized in GameStateProvider
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
      setHatchMsg(`INSUFFICIENT ENERGY (need 20, have ${state.energy})`)
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
    }}>
      {/* Room */}
      <div style={{
        position: 'relative',
        width: `${ROOM_W}px`,
        height: `${ROOM_H}px`,
        background: 'linear-gradient(160deg, #0d0d1c 0%, #0a0a14 100%)',
        border: '1px solid rgba(0,245,212,0.18)',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,245,212,0.06)',
      }}>
        {/* Grid lines — industrial floor */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.1 }} width={ROOM_W} height={ROOM_H}>
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={ROOM_H} stroke="#00f5d4" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 50} x2={ROOM_W} y2={i * 50} stroke="#00f5d4" strokeWidth="1" />
          ))}
        </svg>

        {/* Teal accent wall lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--teal), transparent)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'var(--teal)', opacity: 0.15 }} />

        {/* Room label */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          letterSpacing: '4px',
          color: 'rgba(0,245,212,0.35)',
          fontWeight: 'bold',
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
          SCRAP: {state.scrap}
        </div>

        {/* WASD hint */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '2px',
          color: 'rgba(0,245,212,0.18)',
        }}>
          WASD / ARROWS to move
        </div>

        {/* Node: STUCK HATCH */}
        <InteractiveNode
          x={100} y={200}
          label={state.siloHatchOpen ? 'HATCH OPEN' : 'HATCH A7'}
          sublabel={state.siloHatchOpen ? 'Access Granted' : 'Sealed — 20 energy to force'}
          actionLabel={state.siloHatchOpen ? undefined : 'FORCE OPEN'}
          onClick={state.siloHatchOpen ? undefined : handleHatch}
          active={!state.siloHatchOpen}
          completed={state.siloHatchOpen}
          color={state.siloHatchOpen ? 'var(--teal-bright)' : 'var(--amber)'}
          statusMsg={hatchMsg}
        />

        {/* Node: SALVAGE */}
        <InteractiveNode
          x={520} y={160}
          label="SALVAGE NODE"
          sublabel={state.siloScrapCollected ? 'Looted' : '−3 energy · +5 scrap'}
          actionLabel={state.siloScrapCollected ? undefined : 'LOOT'}
          onClick={state.siloScrapCollected ? undefined : handleSalvage}
          active={!state.siloScrapCollected}
          completed={state.siloScrapCollected}
          color="var(--amber)"
          statusMsg={state.siloScrapCollected ? 'SALVAGED' : null}
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
          boxShadow: '0 0 10px var(--teal), 0 0 3px rgba(0,245,212,0.6)',
          border: '1px solid rgba(0,245,212,0.6)',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }} />
      </div>
    </div>
  )
}

interface NodeProps {
  x: number
  y: number
  label: string
  sublabel?: string
  actionLabel?: string
  onClick?: () => void
  active: boolean
  completed?: boolean
  color: string
  statusMsg: string | null
}

function InteractiveNode({ x, y, label, sublabel, actionLabel, onClick, active, completed, color, statusMsg }: NodeProps) {
  const [hovered, setHovered] = useState(false)

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
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick() }}
        style={{
          width: '64px',
          height: '64px',
          border: `2px solid ${completed ? 'var(--teal)' : active ? color : 'rgba(80,80,100,0.3)'}`,
          borderRadius: '8px',
          background: completed
            ? 'rgba(0,245,212,0.08)'
            : active
              ? hovered ? `color-mix(in srgb, ${color} 20%, transparent)` : `color-mix(in srgb, ${color} 8%, transparent)`
              : 'rgba(40,40,60,0.2)',
          boxShadow: active && !completed
            ? hovered
              ? `0 0 20px ${color}60, inset 0 0 8px ${color}18`
              : `0 0 10px ${color}40`
            : completed
              ? '0 0 8px rgba(0,245,212,0.25)'
              : 'none',
          cursor: active && onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 8px',
          transition: 'all 0.2s ease',
          animation: active && !completed ? 'pulse-glow 2.5s ease-in-out infinite' : 'none',
        }}
      >
        <div style={{
          fontSize: '22px',
          lineHeight: 1,
          filter: completed ? 'grayscale(0)' : 'none',
        }}>
          {completed ? '✓' : active ? '◈' : '○'}
        </div>
      </div>

      {/* Label */}
      <div style={{
        fontSize: '9px',
        letterSpacing: '2px',
        color: completed ? 'var(--teal)' : active ? color : 'rgba(80,80,100,0.5)',
        textShadow: completed ? 'var(--glow-teal)' : active ? `0 0 8px ${color}80` : 'none',
        marginBottom: '3px',
        fontWeight: 'bold',
      }}>
        {label}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div style={{
          fontSize: '8px',
          letterSpacing: '0.5px',
          color: 'rgba(0,245,212,0.3)',
          marginBottom: '3px',
          maxWidth: '80px',
        }}>
          {sublabel}
        </div>
      )}

      {/* Action prompt — shows on hover */}
      {actionLabel && active && hovered && (
        <div style={{
          fontSize: '8px',
          letterSpacing: '1px',
          color: 'var(--teal-bright)',
          background: 'rgba(0,245,212,0.08)',
          border: '1px solid rgba(0,245,212,0.2)',
          borderRadius: '3px',
          padding: '2px 6px',
          display: 'inline-block',
          animation: 'pulse-glow 1.2s ease-in-out infinite',
        }}>
          {actionLabel}
        </div>
      )}

      {/* Status message */}
      {statusMsg && (
        <div style={{
          fontSize: '8px',
          color: statusMsg.startsWith('INSUFFICIENT') ? 'var(--danger)' : 'var(--teal)',
          marginTop: '3px',
          animation: 'axiom-appear 0.3s ease both',
          maxWidth: '90px',
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
      cursor: 'not-allowed',
      opacity: 0.45,
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        border: '2px solid rgba(80,80,110,0.3)',
        borderRadius: '8px',
        background: 'rgba(30,30,50,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 8px',
      }}>
        <div style={{ fontSize: '22px', color: 'rgba(80,80,100,0.5)' }}>🔒</div>
      </div>
      <div style={{
        fontSize: '9px',
        letterSpacing: '2px',
        color: 'rgba(80,80,100,0.5)',
        marginBottom: '5px',
        fontWeight: 'bold',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '8px',
        background: 'rgba(255,183,0,0.12)',
        border: '1px solid rgba(255,183,0,0.35)',
        borderRadius: '3px',
        padding: '2px 8px',
        color: 'var(--amber)',
        letterSpacing: '1.5px',
        display: 'inline-block',
      }}>
        Coming Soon
      </div>
    </div>
  )
}
