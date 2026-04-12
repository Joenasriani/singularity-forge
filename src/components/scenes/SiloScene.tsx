import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameState } from '../../store/gameState'
import { evaluateAxiom } from '../axiom/AxiomEngine'

interface PlayerPos { x: number; y: number }

const ROOM_W = 800
const ROOM_H = 460
const PLAYER_SPEED = 4
const INTERACT_RADIUS = 70

// Node positions for proximity-based keyboard activation
const NODE_HATCH = { x: 100, y: 200 }
const NODE_SALVAGE = { x: 520, y: 160 }

function dist(a: PlayerPos, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export default function SiloScene() {
  const {
    state,
    addAxiomMessage,
    addChronicleEvent,
    adjustEnergy,
    adjustScrap,
    setSiloHatchOpen,
    setSiloScrapCollected,
  } = useGameState()

  const [player, setPlayer] = useState<PlayerPos>({ x: 400, y: 230 })
  const keysRef = useRef<Set<string>>(new Set())
  const siloEnteredRef = useRef(false)
  const hesitationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animFrameRef = useRef<number>(0)
  const [hatchMsg, setHatchMsg] = useState<string | null>(null)

  // Derived proximity flags
  const nearHatch = dist(player, NODE_HATCH) <= INTERACT_RADIUS
  const nearSalvage = dist(player, NODE_SALVAGE) <= INTERACT_RADIUS

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

  // WASD movement loop + keyboard activation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase()
      keysRef.current.add(key)
      resetHesitation()
      // Activate nearby node with Enter or Space
      if (key === 'enter' || key === ' ') {
        e.preventDefault()
        // We can't read React state in this closure, so we dispatch a custom event
        // instead, handled by the node via its own keydown listener
        window.dispatchEvent(new CustomEvent('silo-activate'))
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

  // Global silo-activate: trigger nearby node action
  function activateNearby() {
    if (nearHatch && !state.siloHatchOpen) handleHatch()
    else if (nearSalvage && !state.siloScrapCollected) handleSalvage()
  }

  useEffect(() => {
    window.addEventListener('silo-activate', activateNearby)
    return () => window.removeEventListener('silo-activate', activateNearby)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearHatch, nearSalvage, state.siloHatchOpen, state.siloScrapCollected, state.energy])

  function handleHatch() {
    if (state.siloHatchOpen) return
    if (state.energy >= 20) {
      adjustEnergy(-20)
      setSiloHatchOpen(true)
      const msg = evaluateAxiom(state, 'hatch_open')
      if (msg) addAxiomMessage(msg)
      addChronicleEvent('Hatch A7 forced open')
      setHatchMsg(null)
    } else {
      setHatchMsg(`INSUFFICIENT ENERGY — NEED 20, HAVE ${state.energy}`)
      setTimeout(() => setHatchMsg(null), 3000)
    }
  }

  function handleSalvage() {
    if (state.siloScrapCollected) return
    setSiloScrapCollected(true)
    adjustEnergy(-3)
    adjustScrap(5)
    addChronicleEvent('Salvage Node looted: +5 scrap')
  }

  // Touch D-pad: inject virtual key presses
  function dpadPress(dir: string) {
    keysRef.current.add(dir)
    resetHesitation()
  }
  function dpadRelease(dir: string) {
    keysRef.current.delete(dir)
  }

  // Proximity hint label for nearest active node
  const nearbyHint = !state.siloHatchOpen && nearHatch
    ? 'HATCH A7 — ENTER/SPACE to activate'
    : !state.siloScrapCollected && nearSalvage
      ? 'SALVAGE NODE — ENTER/SPACE to activate'
      : null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, #0c0c1e 0%, #07070f 100%)',
      display: 'flex',
      flexDirection: 'column',
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
        background: 'linear-gradient(160deg, #0d0d1c 0%, #0a0a16 60%, #080810 100%)',
        border: '1px solid rgba(0,245,212,0.22)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.5)',
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

        {/* WASD hint / proximity prompt */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '1px',
          color: nearbyHint ? 'var(--teal)' : 'rgba(0,245,212,0.18)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          textShadow: nearbyHint ? 'var(--glow-teal)' : 'none',
          transition: 'color 0.3s',
        }}>
          {nearbyHint ?? '[ WASD / ARROWS ] — move · [ ENTER / SPACE ] — activate'}
        </div>

        {/* Node: STUCK HATCH */}
        <InteractiveNode
          x={100} y={200}
          label={state.siloHatchOpen ? 'HATCH A7' : 'HATCH A7'}
          sublabel={state.siloHatchOpen ? 'ACCESS GRANTED' : 'SEALED · −20 ENERGY'}
          actionLabel={state.siloHatchOpen ? undefined : 'FORCE OPEN'}
          onClick={state.siloHatchOpen ? undefined : handleHatch}
          completed={state.siloHatchOpen}
          color={state.siloHatchOpen ? 'var(--teal)' : 'var(--amber)'}
          statusMsg={hatchMsg}
        />

        {/* Node: SALVAGE */}
        <InteractiveNode
          x={520} y={160}
          label="SALVAGE NODE"
          sublabel={state.siloScrapCollected ? 'DEPLETED' : '−3 ENERGY · +5 SCRAP'}
          actionLabel={state.siloScrapCollected ? undefined : 'LOOT'}
          onClick={state.siloScrapCollected ? undefined : handleSalvage}
          completed={state.siloScrapCollected}
          color="var(--amber)"
          statusMsg={null}
        />

        {/* Node: LOCKED DOOR */}
        <LockedNode x={700} y={230} label="THE WEAVE" />

        {/* Player dot */}
        <div style={{
          position: 'absolute',
          left: player.x,
          top: player.y,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--teal)',
          border: '1px solid rgba(0,245,212,0.6)',
          boxShadow: '0 0 8px var(--teal), 0 0 16px rgba(0,245,212,0.3)',
          transform: 'translate(-50%, -50%)',
          transition: 'none',
          zIndex: 20,
        }} />
      </div>

      {/* Touch D-pad for mobile */}
      <TouchDpad
        onPress={dpadPress}
        onRelease={dpadRelease}
        onActivate={activateNearby}
      />
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
}

function InteractiveNode({ x, y, label, sublabel, actionLabel, onClick, completed, color, statusMsg }: NodeProps) {
  const [hovered, setHovered] = useState(false)
  const nodeState: NodeState = completed ? 'done' : 'active'
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
      {actionLabel && nodeState === 'active' && hovered && (
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

interface TouchDpadProps {
  onPress: (dir: string) => void
  onRelease: (dir: string) => void
  onActivate: () => void
}

function TouchDpad({ onPress, onRelease, onActivate }: TouchDpadProps) {
  const buttonStyle = (_label: string): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    background: 'rgba(0,245,212,0.08)',
    border: '1px solid rgba(0,245,212,0.25)',
    borderRadius: '6px',
    color: 'var(--teal)',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    cursor: 'pointer',
  })

  function makeHandlers(dir: string) {
    return {
      onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); onPress(dir) },
      onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); onRelease(dir) },
      onMouseDown: () => onPress(dir),
      onMouseUp: () => onRelease(dir),
      onMouseLeave: () => onRelease(dir),
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '16px',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        // Show on touch devices; hide on hover-capable devices (i.e., desktop)
        // We use a CSS media query approach via a wrapper class
      }}
      className="touch-dpad"
    >
      <div {...makeHandlers('arrowup')} style={buttonStyle('↑')}>↑</div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <div {...makeHandlers('arrowleft')} style={buttonStyle('←')}>←</div>
        <div
          onTouchStart={(e) => { e.preventDefault(); onActivate() }}
          onClick={onActivate}
          style={{ ...buttonStyle('◈'), fontSize: '14px', background: 'rgba(0,245,212,0.12)' }}
        >
          ◈
        </div>
        <div {...makeHandlers('arrowright')} style={buttonStyle('→')}>→</div>
      </div>
      <div {...makeHandlers('arrowdown')} style={buttonStyle('↓')}>↓</div>
    </div>
  )
}
