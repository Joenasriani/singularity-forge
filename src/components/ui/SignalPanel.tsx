import { useGameState } from '../../store/gameState'

function formatRelative(timestamp: number): string {
  const elapsed = Math.floor((Date.now() - timestamp) / 1000)
  if (elapsed < 60) return `${elapsed}s ago`
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return `${m}:${String(s).padStart(2, '0')} ago`
}

export default function SignalPanel() {
  const { state } = useGameState()
  const recent = [...state.axiomMessages].slice(-4).reverse()

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
        <span style={{ opacity: 0.7 }}>⚡</span>
        <span>AXIOM SIGNAL</span>
      </div>
      {recent.length === 0 && (
        <div style={{ color: 'rgba(0,245,212,0.25)', fontSize: '10px', fontStyle: 'italic', lineHeight: 1.5 }}>
          — awaiting transmission —
        </div>
      )}
      {recent.map((msg, i) => (
        <div
          key={msg.id}
          style={{
            marginBottom: '10px',
            animation: i === 0 ? 'axiom-appear 0.5s ease both' : 'none',
          }}
        >
          <div style={{
            color: i === 0 ? 'var(--teal-bright)' : 'rgba(0,245,212,0.55)',
            fontSize: i === 0 ? '11px' : '10px',
            lineHeight: '1.5',
            fontStyle: 'italic',
            textShadow: i === 0 ? '0 0 8px rgba(0,245,212,0.3)' : 'none',
            borderLeft: i === 0 ? '2px solid var(--teal)' : '2px solid rgba(0,245,212,0.15)',
            paddingLeft: '8px',
          }}>
            {msg.text}
          </div>
          <div style={{ color: 'rgba(0,245,212,0.25)', fontSize: '8px', marginTop: '3px', paddingLeft: '10px' }}>
            {formatRelative(msg.timestamp)}
          </div>
        </div>
      ))}
    </div>
  )
}
