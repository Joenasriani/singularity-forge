import { useGameState } from '../../store/gameState'

function formatRelative(timestamp: number): string {
  const elapsed = Math.floor((Date.now() - timestamp) / 1000)
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
      width: '200px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        fontSize: '10px',
        letterSpacing: '2px',
        color: 'var(--teal-bright)',
        marginBottom: '10px',
        borderBottom: '1px solid rgba(0,245,212,0.2)',
        paddingBottom: '6px',
      }}>
        ⚡ SIGNAL
      </div>
      {recent.length === 0 && (
        <div style={{ color: 'rgba(0,245,212,0.3)', fontSize: '10px', fontStyle: 'italic' }}>
          — awaiting transmission —
        </div>
      )}
      {recent.map((msg) => (
        <div key={msg.id} style={{ marginBottom: '8px' }}>
          <div style={{
            color: 'var(--teal)',
            fontSize: '11px',
            lineHeight: '1.4',
            textShadow: 'var(--glow-teal)',
          }}>
            {msg.text}
          </div>
          <div style={{ color: 'rgba(0,245,212,0.35)', fontSize: '9px', marginTop: '2px' }}>
            {formatRelative(msg.timestamp)}
          </div>
        </div>
      ))}
    </div>
  )
}
