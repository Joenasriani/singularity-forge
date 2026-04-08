import { useState, useEffect } from 'react'
import { useGameState } from '../../store/gameState'

function formatRelative(timestamp: number): string {
  const elapsed = Math.floor((Date.now() - timestamp) / 1000)
  if (elapsed < 10) return 'just now'
  if (elapsed < 60) return `${elapsed}s ago`
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return `${m}m ${s}s ago`
}

export default function SignalPanel() {
  const { state } = useGameState()
  const [, setTick] = useState(0)
  const recent = [...state.axiomMessages].slice(-4).reverse()

  // Re-render every 10s so relative timestamps stay fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1px solid rgba(0,245,212,0.2)',
      borderRadius: '4px',
      padding: '12px',
      width: '210px',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        fontSize: '10px',
        letterSpacing: '2px',
        color: 'var(--teal-bright)',
        marginBottom: '10px',
        borderBottom: '1px solid rgba(0,245,212,0.15)',
        paddingBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>⚡</span>
        <span>AXIOM SIGNAL</span>
      </div>
      {recent.length === 0 && (
        <div style={{ color: 'rgba(0,245,212,0.25)', fontSize: '10px', fontStyle: 'italic', lineHeight: '1.5' }}>
          — awaiting signal —
        </div>
      )}
      {recent.map((msg, i) => (
        <div
          key={msg.id}
          style={{
            marginBottom: i < recent.length - 1 ? '10px' : 0,
            animation: i === 0 ? 'axiom-appear 0.4s ease both' : 'none',
            paddingLeft: i === 0 ? '7px' : '0',
            borderLeft: i === 0 ? '2px solid var(--teal)' : 'none',
          }}
        >
          <div style={{
            color: i === 0 ? 'var(--teal-bright)' : 'rgba(0,245,212,0.4)',
            fontSize: i === 0 ? '11px' : '10px',
            lineHeight: '1.55',
            fontStyle: 'italic',
            textShadow: i === 0 ? '0 0 8px rgba(0,245,212,0.4)' : 'none',
          }}>
            {msg.text}
          </div>
          <div style={{ color: 'rgba(0,245,212,0.22)', fontSize: '9px', marginTop: '3px', letterSpacing: '0.5px' }}>
            {formatRelative(msg.timestamp)}
          </div>
        </div>
      ))}
    </div>
  )
}
