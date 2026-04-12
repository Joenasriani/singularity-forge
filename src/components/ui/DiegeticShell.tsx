import { useState, useEffect } from 'react'
import StatusPanel from './StatusPanel'
import SignalPanel from './SignalPanel'
import CompassPanel from './CompassPanel'
import ChroniclePanel from './ChroniclePanel'
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
  const { state } = useGameState()
  const width = useWindowWidth()
  const isNarrow = width <= 640

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
        </div>
      )}
    </div>
  )
}
