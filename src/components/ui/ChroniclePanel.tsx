import { useGameState } from '../../store/gameState'

export default function ChroniclePanel() {
  const { state } = useGameState()
  const recent = [...state.chronicleEvents].slice(-6).reverse()

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
        📋 CHRONICLE
      </div>
      {recent.length === 0 && (
        <div style={{ color: 'rgba(0,245,212,0.3)', fontSize: '10px', fontStyle: 'italic' }}>
          — no events recorded —
        </div>
      )}
      {recent.map((evt, i) => (
        <div
          key={i}
          style={{
            marginBottom: '5px',
            fontSize: '10px',
            lineHeight: '1.4',
            color: i === 0 ? 'var(--teal-bright)' : 'rgba(0,245,212,0.5)',
            textShadow: i === 0 ? 'var(--glow-teal)' : 'none',
            paddingLeft: '8px',
            borderLeft: i === 0 ? '2px solid var(--teal)' : '2px solid rgba(0,245,212,0.15)',
          }}
        >
          {evt}
        </div>
      ))}
    </div>
  )
}
