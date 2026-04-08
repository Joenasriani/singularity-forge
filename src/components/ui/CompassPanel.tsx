import { useGameState } from '../../store/gameState'

const NEEDLE_CHARS = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']

export default function CompassPanel() {
  const { state } = useGameState()
  const tickIndex = Math.floor(Date.now() / 800) % NEEDLE_CHARS.length

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
        ◎ COMPASS
      </div>
      <div style={{
        fontFamily: 'monospace',
        fontSize: '11px',
        lineHeight: '1.6',
        color: 'rgba(0,245,212,0.6)',
        textAlign: 'center',
      }}>
        <div style={{ letterSpacing: '6px' }}>N</div>
        <div>
          <span style={{ letterSpacing: '3px' }}>W </span>
          <span style={{
            color: 'var(--teal-bright)',
            textShadow: 'var(--glow-teal)',
            fontSize: '16px',
          }}>
            {NEEDLE_CHARS[tickIndex]}
          </span>
          <span style={{ letterSpacing: '3px' }}> E</span>
        </div>
        <div style={{ letterSpacing: '6px' }}>S</div>
      </div>
      <div style={{
        marginTop: '10px',
        fontSize: '10px',
        color: 'rgba(0,245,212,0.5)',
        borderTop: '1px solid rgba(0,245,212,0.15)',
        paddingTop: '6px',
      }}>
        <span style={{ color: 'rgba(0,245,212,0.4)', letterSpacing: '1px' }}>OBJ › </span>
        <span style={{ color: 'var(--teal)', textShadow: 'var(--glow-teal)' }}>{state.objective}</span>
      </div>
    </div>
  )
}
