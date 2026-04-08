import { useGameState } from '../../store/gameState'

interface GaugeProps {
  label: string
  value: number
  color: string
  dangerColor?: string
  dangerThreshold?: number
  highColor?: string
  highThreshold?: number
}

function Gauge({ label, value, color, dangerColor, dangerThreshold, highColor, highThreshold }: GaugeProps) {
  let barColor = color
  if (dangerColor && dangerThreshold !== undefined && value <= dangerThreshold) {
    barColor = dangerColor
  } else if (highColor && highThreshold !== undefined && value >= highThreshold) {
    barColor = highColor
  }

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '10px', letterSpacing: '1px' }}>
        <span style={{ color: 'rgba(0,245,212,0.7)' }}>{label}</span>
        <span style={{ color: barColor }}>{value}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '6px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: barColor,
          boxShadow: `0 0 8px ${barColor}`,
          transition: 'width 0.4s ease',
          borderRadius: '2px',
        }} />
      </div>
    </div>
  )
}

export default function StatusPanel() {
  const { state } = useGameState()

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
        ◈ STATUS
      </div>
      <Gauge
        label="ARMOR"
        value={state.armor}
        color="var(--teal)"
        dangerColor="var(--danger)"
        dangerThreshold={20}
      />
      <Gauge
        label="HEAT"
        value={state.heat}
        color="var(--amber)"
        highColor="var(--danger)"
        highThreshold={80}
      />
      <Gauge
        label="ENERGY"
        value={state.energy}
        color="var(--teal)"
        dangerColor="var(--danger)"
        dangerThreshold={15}
      />
      <div style={{
        marginTop: '8px',
        fontSize: '10px',
        color: 'rgba(0,245,212,0.6)',
        borderTop: '1px solid rgba(0,245,212,0.15)',
        paddingTop: '6px',
      }}>
        SCRAP: <span style={{ color: 'var(--amber)' }}>{state.scrap} units</span>
      </div>
    </div>
  )
}
