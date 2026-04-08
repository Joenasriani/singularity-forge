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
  const lastKeyTimeRef = useRef<number>(Date.now())
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
    lastKeyTimeRef.current = Date.now()
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
        background: '#0d0d18',
        border: '1px solid rgba(0,245,212,0.2)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0,0,0,0.8)',
      }}>
        {/* Grid lines — industrial floor */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.12 }} width={ROOM_W} height={ROOM_H}>
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={ROOM_H} stroke="#00f5d4" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 50} x2={ROOM_W} y2={i * 50} stroke="#00f5d4" strokeWidth="1" />
          ))}
        </svg>

        {/* Teal accent wall lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--teal)', opacity: 0.4 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--teal)', opacity: 0.2 }} />

        {/* Room label */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          letterSpacing: '3px',
          color: 'rgba(0,245,212,0.4)',
        }}>
          THE SILO — SECTOR 01
        </div>

        {/* Scrap counter */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '16px',
          fontSize: '11px',
          letterSpacing: '1px',
          color: 'var(--amber)',
        }}>
          SCRAP: {state.scrap} units
        </div>

        {/* WASD hint */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '1px',
          color: 'rgba(0,245,212,0.25)',
        }}>
          WASD / ARROWS to move
        </div>

        {/* Node: STUCK HATCH */}
        <InteractiveNode
          x={100} y={200}
          label={state.siloHatchOpen ? 'HATCH OPEN — ACCESS GRANTED' : 'HATCH A7 — SEALED'}
          actionLabel={state.siloHatchOpen ? undefined : 'FORCE OPEN [20 ENERGY]'}
          onClick={state.siloHatchOpen ? undefined : handleHatch}
          active={!state.siloHatchOpen}
          color={state.siloHatchOpen ? 'var(--teal-bright)' : 'var(--amber)'}
          statusMsg={hatchMsg}
        />

        {/* Node: SALVAGE */}
        <InteractiveNode
          x={520} y={160}
          label="SALVAGE NODE"
          actionLabel={state.siloScrapCollected ? undefined : 'LOOT [−3 ENERGY, +5 SCRAP]'}
          onClick={state.siloScrapCollected ? undefined : handleSalvage}
          active={!state.siloScrapCollected}
          color="var(--amber)"
          statusMsg={state.siloScrapCollected ? 'SALVAGED' : null}
        />

        {/* Node: LOCKED DOOR */}
        <LockedNode x={700} y={230} label="THE WEAVE ACCESS" />

        {/* Player dot */}
        <div style={{
          position: 'absolute',
          left: player.x,
          top: player.y,
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'var(--teal)',
          boxShadow: 'var(--glow-teal)',
          transform: 'translate(-50%, -50%)',
          transition: 'none',
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
  actionLabel?: string
  onClick?: () => void
  active: boolean
  color: string
  statusMsg: string | null
}

function InteractiveNode({ x, y, label, actionLabel, onClick, active, color, statusMsg }: NodeProps) {
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
        style={{
          width: '60px',
          height: '60px',
          border: `2px solid ${color}`,
          borderRadius: '6px',
          background: `${color}14`,
          boxShadow: active ? `0 0 12px ${color}60` : 'none',
          cursor: active && onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 6px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { if (active && onClick) e.currentTarget.style.background = `${color}2a` }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${color}14` }}
      >
        <div style={{ fontSize: '20px' }}>{active ? '◈' : '✓'}</div>
      </div>
      <div style={{ fontSize: '9px', letterSpacing: '1px', color, marginBottom: '3px' }}>{label}</div>
      {actionLabel && active && (
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>{actionLabel}</div>
      )}
      {statusMsg && (
        <div style={{ fontSize: '8px', color: 'var(--teal)', marginTop: '2px' }}>{statusMsg}</div>
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
      opacity: 0.5,
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '2px solid rgba(100,100,100,0.4)',
        borderRadius: '6px',
        background: 'rgba(40,40,60,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 6px',
      }}>
        <div style={{ fontSize: '20px', color: 'rgba(100,100,100,0.5)' }}>🔒</div>
      </div>
      <div style={{ fontSize: '9px', letterSpacing: '1px', color: 'rgba(100,100,100,0.5)', marginBottom: '3px' }}>{label}</div>
      <div style={{
        fontSize: '8px',
        background: 'rgba(255,183,0,0.15)',
        border: '1px solid rgba(255,183,0,0.4)',
        borderRadius: '3px',
        padding: '1px 6px',
        color: 'var(--amber)',
        letterSpacing: '1px',
        display: 'inline-block',
      }}>
        Coming Soon
      </div>
    </div>
  )
}
