import { useState, useEffect } from 'react'
import StatusPanel from './StatusPanel'
import SignalPanel from './SignalPanel'
import CompassPanel from './CompassPanel'
import ChroniclePanel from './ChroniclePanel'
import TaskPanel from './TaskPanel'
import FocusTimerPanel from './FocusTimerPanel'
import NotesPanel from './NotesPanel'
import StatsPanel from './StatsPanel'
import CommandPalette from './CommandPalette'
import KeyboardHelp from './KeyboardHelp'
import { useGameState } from '../../store/gameState'

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

export default function DiegeticShell({ children }: { children: React.ReactNode }) {
  const [hudVisible, setHudVisible] = useState(true)
  const [showTasks, setShowTasks] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const { state, setReducedMotion } = useGameState()
  const width = useWindowWidth()
  const isNarrow = width <= 640

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      // Ctrl/Cmd+K — command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
        return
      }

      if (isInput) return

      if (e.key === '?') { setHelpOpen((v) => !v); return }
      if (e.key === 'Escape') {
        if (paletteOpen) { setPaletteOpen(false); return }
        if (helpOpen) { setHelpOpen(false); return }
        return
      }
      if (e.key === 't' || e.key === 'T') { setShowTasks((v) => !v); return }
      if (e.key === 'f' || e.key === 'F') { setShowTimer((v) => !v); return }
      if (e.key === 'n' || e.key === 'N') { setShowNotes((v) => !v); return }
      if (e.key === 's' || e.key === 'S') { setShowStats((v) => !v); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [paletteOpen, helpOpen])

  // Sync reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches && !state.reducedMotion) setReducedMotion(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Productivity toolbar commands
  const toolbarCommands = [
    {
      id: 'toggle-tasks',
      label: showTasks ? '✕ Close Tasks' : '▣ Tasks',
      action: () => setShowTasks((v) => !v),
      active: showTasks,
      shortcut: 'T',
    },
    {
      id: 'toggle-timer',
      label: showTimer ? '✕ Close Timer' : '⏱ Focus',
      action: () => setShowTimer((v) => !v),
      active: showTimer,
      shortcut: 'F',
    },
    {
      id: 'toggle-notes',
      label: showNotes ? '✕ Close Notes' : '✎ Notes',
      action: () => setShowNotes((v) => !v),
      active: showNotes,
      shortcut: 'N',
    },
    {
      id: 'toggle-stats',
      label: showStats ? '✕ Close Stats' : '◈ Stats',
      action: () => setShowStats((v) => !v),
      active: showStats,
      shortcut: 'S',
    },
  ]

  const toolBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(0,245,212,0.12)' : 'rgba(10,15,20,0.85)',
    border: `1px solid ${active ? 'rgba(0,245,212,0.4)' : 'rgba(0,245,212,0.18)'}`,
    borderRadius: '4px',
    color: active ? 'var(--teal-bright)' : 'rgba(0,245,212,0.6)',
    fontSize: '9px',
    letterSpacing: '1px',
    padding: '3px 8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    pointerEvents: 'auto',
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Scene content */}
      {children}

      {/* HUD toggle button — only on narrow viewports */}
      {isNarrow && (
        <button
          onClick={() => setHudVisible((v) => !v)}
          aria-label={hudVisible ? 'Hide HUD' : 'Show HUD'}
          style={{
            position: 'fixed',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'rgba(10,15,20,0.85)',
            border: '1px solid rgba(0,245,212,0.25)',
            borderRadius: '4px',
            color: 'var(--teal)',
            fontSize: '9px',
            letterSpacing: '2px',
            padding: '3px 10px',
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          {hudVisible ? 'HUD ▲' : 'HUD ▼'}
        </button>
      )}

      {/* Productivity toolbar — top center */}
      {hudVisible && (
        <div
          style={{
            position: 'fixed',
            top: isNarrow ? '32px' : '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 150,
            display: 'flex',
            gap: '4px',
            pointerEvents: 'none',
          }}
        >
          {toolbarCommands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              aria-label={cmd.label}
              aria-pressed={cmd.active}
              style={toolBtnStyle(cmd.active)}
            >
              {cmd.label}
            </button>
          ))}
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette (Ctrl+K)"
            title="Ctrl+K"
            style={toolBtnStyle(false)}
          >
            ⌘K
          </button>
          <button
            onClick={() => setHelpOpen(true)}
            aria-label="Keyboard shortcuts"
            style={toolBtnStyle(false)}
          >
            ?
          </button>
        </div>
      )}

      {/* HUD overlay — panels in corners, pointer-events disabled on container */}
      {hudVisible && (
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          {/* Top-left: Status */}
          <div style={{ position: 'absolute', top: '16px', left: '8px', pointerEvents: 'auto', maxWidth: 'calc(50vw - 12px)' }}>
            <StatusPanel />
          </div>

          {/* Top-right: Signal */}
          <div style={{ position: 'absolute', top: '16px', right: '8px', pointerEvents: 'auto', maxWidth: 'calc(50vw - 12px)' }}>
            <SignalPanel />
          </div>

          {/* Bottom panels hidden on narrow screens to avoid overlap with touch D-pad */}
          {!isNarrow && (
            <>
              {/* Bottom-left: Compass */}
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', pointerEvents: 'auto' }}>
                <CompassPanel />
              </div>

              {/* Bottom-right: Chronicle */}
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', pointerEvents: 'auto' }}>
                <ChroniclePanel />
              </div>
            </>
          )}

          {/* Mobile: compact status bar at bottom */}
          {isNarrow && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(10,15,20,0.92)',
              borderTop: '1px solid rgba(0,245,212,0.15)',
              padding: '5px 12px',
              fontSize: '10px',
              letterSpacing: '1px',
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}>
              <span style={{ color: 'rgba(0,245,212,0.5)' }}>
                OBJ › <span style={{ color: 'var(--teal)' }}>{state.objective}</span>
              </span>
              <span style={{ color: 'var(--amber)' }}>
                ⚡{state.energy}% ◈{state.scrap}u
              </span>
            </div>
          )}

          {/* Productivity panels — center column */}
          {(showTasks || showTimer || showNotes || showStats) && (
            <div
              style={{
                position: 'absolute',
                top: isNarrow ? '60px' : '48px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: 'calc(100vw - 32px)',
                pointerEvents: 'auto',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
              }}
            >
              {showTimer && <FocusTimerPanel />}
              {showTasks && <TaskPanel />}
              {showNotes && <NotesPanel />}
              {showStats && <StatsPanel />}
            </div>
          )}
        </div>
      )}

      {/* Overlays */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        extraCommands={toolbarCommands.map((c) => ({
          id: c.id,
          label: c.label,
          shortcut: c.shortcut,
          action: () => { c.action(); setPaletteOpen(false) },
        }))}
      />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

