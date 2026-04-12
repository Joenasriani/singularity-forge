import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameState } from '../../store/gameState'

function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0')
  const s = (Math.max(0, seconds) % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function FocusTimerPanel() {
  const { state, pomodoroStart, pomodoroPause, pomodoroResume, pomodoroComplete, pomodoroReset, pomodoroConfig } = useGameState()
  const { pomodoro } = state
  const [remaining, setRemaining] = useState(pomodoro.focusDuration)
  const [showConfig, setShowConfig] = useState(false)
  const [cfgFocus, setCfgFocus] = useState(String(Math.round(pomodoro.focusDuration / 60)))
  const [cfgBreak, setCfgBreak] = useState(String(Math.round(pomodoro.breakDuration / 60)))
  const completedRef = useRef(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getElapsed = useCallback(() => {
    if (pomodoro.startedAt === null) return pomodoro.pausedElapsed
    return pomodoro.pausedElapsed + (Date.now() - pomodoro.startedAt) / 1000
  }, [pomodoro])

  const getDuration = useCallback(() => {
    return pomodoro.phase === 'break' ? pomodoro.breakDuration : pomodoro.focusDuration
  }, [pomodoro])

  // Check for "timer completed while away" on mount/phase change
  useEffect(() => {
    if (pomodoro.phase !== 'idle' && pomodoro.startedAt !== null) {
      const elapsed = getElapsed()
      const duration = getDuration()
      if (elapsed >= duration) {
        pomodoroComplete()
      }
    }
    completedRef.current = false
  }, [pomodoro.phase, pomodoro.startedAt]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tick
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current)

    if (pomodoro.phase === 'idle') {
      setRemaining(pomodoro.focusDuration)
      return
    }

    const tick = () => {
      const elapsed = getElapsed()
      const duration = getDuration()
      const rem = duration - elapsed
      setRemaining(rem)
      if (rem <= 0 && !completedRef.current) {
        completedRef.current = true
        pomodoroComplete()
      }
    }

    tick()
    tickRef.current = setInterval(tick, 500)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [pomodoro.phase, pomodoro.startedAt, pomodoro.pausedElapsed, pomodoro.focusDuration, pomodoro.breakDuration]) // eslint-disable-line react-hooks/exhaustive-deps

  const isRunning = pomodoro.phase !== 'idle' && pomodoro.startedAt !== null
  const isPaused = pomodoro.phase !== 'idle' && pomodoro.startedAt === null
  const duration = getDuration()
  const progress = pomodoro.phase === 'idle' ? 0 : Math.min(1, Math.max(0, 1 - remaining / duration))

  const phaseColor = pomodoro.phase === 'break' ? 'var(--amber)' : 'var(--teal)'
  const dangerColor = 'var(--danger)'
  const barColor = remaining < 60 && pomodoro.phase === 'focus' ? dangerColor : phaseColor

  function handleSaveConfig() {
    const f = Math.max(1, parseInt(cfgFocus, 10) || 25) * 60
    const b = Math.max(1, parseInt(cfgBreak, 10) || 5) * 60
    pomodoroConfig(f, b)
    setShowConfig(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '48px',
    background: 'rgba(0,245,212,0.05)',
    border: '1px solid rgba(0,245,212,0.2)',
    borderRadius: '3px',
    color: 'var(--teal)',
    fontSize: '11px',
    padding: '2px 4px',
    fontFamily: 'inherit',
    textAlign: 'center',
  }

  return (
    <div
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid rgba(0,245,212,0.2)',
        borderRadius: '4px',
        padding: '12px',
        width: '200px',
        backdropFilter: 'blur(4px)',
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>⏱ FOCUS</span>
        <button
          onClick={() => setShowConfig((v) => !v)}
          aria-label="Configure timer"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(0,245,212,0.4)',
            fontSize: '12px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ⚙
        </button>
      </div>

      {showConfig ? (
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(0,245,212,0.5)', marginBottom: '6px' }}>
            FOCUS (min) / BREAK (min)
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="number"
              min="1"
              max="90"
              value={cfgFocus}
              onChange={(e) => setCfgFocus(e.target.value)}
              aria-label="Focus duration in minutes"
              style={inputStyle}
            />
            <span style={{ color: 'rgba(0,245,212,0.3)' }}>/</span>
            <input
              type="number"
              min="1"
              max="30"
              value={cfgBreak}
              onChange={(e) => setCfgBreak(e.target.value)}
              aria-label="Break duration in minutes"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleSaveConfig}
              aria-label="Save config"
              style={{
                flex: 1,
                background: 'rgba(0,245,212,0.1)',
                border: '1px solid rgba(0,245,212,0.3)',
                borderRadius: '3px',
                color: 'var(--teal)',
                fontSize: '10px',
                padding: '4px',
                cursor: 'pointer',
              }}
            >
              SAVE
            </button>
            <button
              onClick={() => setShowConfig(false)}
              aria-label="Cancel config"
              style={{
                flex: 1,
                background: 'none',
                border: '1px solid rgba(0,245,212,0.15)',
                borderRadius: '3px',
                color: 'rgba(0,245,212,0.4)',
                fontSize: '10px',
                padding: '4px',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Phase label */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '9px',
              letterSpacing: '2px',
              color: pomodoro.phase === 'idle' ? 'rgba(0,245,212,0.3)' : phaseColor,
              marginBottom: '6px',
            }}
          >
            {pomodoro.phase === 'idle' ? 'STANDBY' : pomodoro.phase === 'focus' ? '◉ FOCUS SESSION' : '◌ BREAK'}
            {isPaused && ' — PAUSED'}
          </div>

          {/* Timer display */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '28px',
              letterSpacing: '4px',
              color: barColor,
              textShadow: `0 0 12px ${barColor}`,
              marginBottom: '8px',
              fontVariantNumeric: 'tabular-nums',
            }}
            aria-live="polite"
            aria-label={`${pomodoro.phase} timer: ${formatTime(Math.ceil(remaining))}`}
          >
            {formatTime(pomodoro.phase === 'idle' ? pomodoro.focusDuration : Math.ceil(remaining))}
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                background: barColor,
                boxShadow: `0 0 6px ${barColor}`,
                transition: 'width 0.5s linear',
                borderRadius: '2px',
              }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {pomodoro.phase === 'idle' && (
              <button
                onClick={pomodoroStart}
                aria-label="Start focus session"
                style={{
                  flex: 1,
                  background: 'rgba(0,245,212,0.1)',
                  border: '1px solid rgba(0,245,212,0.4)',
                  borderRadius: '3px',
                  color: 'var(--teal)',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  padding: '5px',
                  cursor: 'pointer',
                }}
              >
                ▶ START
              </button>
            )}
            {isRunning && (
              <button
                onClick={pomodoroPause}
                aria-label="Pause timer"
                style={{
                  flex: 1,
                  background: 'rgba(255,183,0,0.08)',
                  border: '1px solid rgba(255,183,0,0.3)',
                  borderRadius: '3px',
                  color: 'var(--amber)',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  padding: '5px',
                  cursor: 'pointer',
                }}
              >
                ⏸ PAUSE
              </button>
            )}
            {isPaused && (
              <button
                onClick={pomodoroResume}
                aria-label="Resume timer"
                style={{
                  flex: 1,
                  background: 'rgba(0,245,212,0.1)',
                  border: '1px solid rgba(0,245,212,0.4)',
                  borderRadius: '3px',
                  color: 'var(--teal)',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  padding: '5px',
                  cursor: 'pointer',
                }}
              >
                ▶ RESUME
              </button>
            )}
            {pomodoro.phase !== 'idle' && (
              <button
                onClick={pomodoroReset}
                aria-label="Reset timer"
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,34,68,0.2)',
                  borderRadius: '3px',
                  color: 'rgba(255,34,68,0.5)',
                  fontSize: '10px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                }}
              >
                ↺
              </button>
            )}
          </div>
        </>
      )}

      {/* Stats */}
      <div
        style={{
          marginTop: '10px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(0,245,212,0.1)',
          fontSize: '9px',
          color: 'rgba(0,245,212,0.4)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Sessions: {state.stats.sessionsStarted}</span>
        <span>Focus: {state.stats.totalFocusMinutes}m</span>
      </div>
    </div>
  )
}
