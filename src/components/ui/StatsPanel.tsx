import { useGameState } from '../../store/gameState'

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      style={{
        padding: '8px',
        background: 'rgba(0,245,212,0.04)',
        border: '1px solid rgba(0,245,212,0.1)',
        borderRadius: '3px',
        marginBottom: '6px',
      }}
    >
      <div style={{ fontSize: '9px', letterSpacing: '1px', color: 'rgba(0,245,212,0.4)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', color, textShadow: `0 0 8px ${color}`, letterSpacing: '2px' }}>
        {value}
      </div>
    </div>
  )
}

export default function StatsPanel() {
  const { state } = useGameState()
  const { stats } = state

  const doneTasks = state.tasks.filter((t) => t.status === 'done').length
  const totalTasks = state.tasks.length
  const doingTasks = state.tasks.filter((t) => t.status === 'doing').length

  const recentChronicle = [...state.chronicleEvents].slice(-5).reverse()

  return (
    <div
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid rgba(0,245,212,0.2)',
        borderRadius: '4px',
        padding: '12px',
        width: '240px',
        backdropFilter: 'blur(4px)',
        maxHeight: '420px',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '2px',
          color: 'var(--teal-bright)',
          marginBottom: '10px',
          borderBottom: '1px solid rgba(0,245,212,0.2)',
          paddingBottom: '6px',
        }}
      >
        ◈ STATS DASHBOARD
      </div>

      {/* Stat cards */}
      <StatCard label="FOCUS SESSIONS" value={stats.sessionsStarted} color="var(--teal)" />
      <StatCard label="TOTAL FOCUS TIME" value={`${stats.totalFocusMinutes}m`} color="var(--teal-bright)" />
      <StatCard label="TASKS COMPLETED" value={stats.tasksCompleted} color="var(--amber)" />
      <StatCard label="SCRAP EARNED" value={`${stats.scrapEarned}u`} color="var(--amber)" />

      {/* Current session */}
      <div
        style={{
          marginTop: '4px',
          marginBottom: '8px',
          padding: '8px',
          background: 'rgba(0,245,212,0.04)',
          border: '1px solid rgba(0,245,212,0.1)',
          borderRadius: '3px',
        }}
      >
        <div style={{ fontSize: '9px', letterSpacing: '1px', color: 'rgba(0,245,212,0.4)', marginBottom: '6px' }}>
          CURRENT SESSION
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: 'rgba(0,245,212,0.6)' }}>Tasks: <span style={{ color: 'var(--teal)' }}>{doneTasks}/{totalTasks}</span></span>
          <span style={{ color: 'var(--amber)' }}>{doingTasks} active</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
          <span style={{ color: 'rgba(0,245,212,0.6)' }}>Energy: <span style={{ color: 'var(--teal)' }}>{state.energy}%</span></span>
          <span style={{ color: 'rgba(0,245,212,0.6)' }}>Scrap: <span style={{ color: 'var(--amber)' }}>{state.scrap}u</span></span>
        </div>
      </div>

      {/* Recent activity */}
      {recentChronicle.length > 0 && (
        <>
          <div style={{ fontSize: '9px', letterSpacing: '1px', color: 'rgba(0,245,212,0.4)', marginBottom: '6px' }}>
            RECENT ACTIVITY
          </div>
          {recentChronicle.map((evt, i) => (
            <div
              key={i}
              style={{
                fontSize: '9px',
                color: i === 0 ? 'rgba(0,245,212,0.7)' : 'rgba(0,245,212,0.35)',
                paddingLeft: '8px',
                borderLeft: `2px solid ${i === 0 ? 'var(--teal)' : 'rgba(0,245,212,0.1)'}`,
                marginBottom: '4px',
                lineHeight: '1.4',
              }}
            >
              {evt}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
