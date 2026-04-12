/**
 * Tests for the Pomodoro timer state logic.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { GameStateProvider, useGameState } from '../store/gameState'

function wrap(action: (ctx: ReturnType<typeof useGameState>) => void) {
  let ctxRef: ReturnType<typeof useGameState>
  function Capture() {
    ctxRef = useGameState()
    return null
  }
  function Btn() {
    const ctx = useGameState()
    return <button data-testid="act" onClick={() => action(ctx)} />
  }
  render(
    <GameStateProvider>
      <Capture />
      <Btn />
    </GameStateProvider>
  )
  return {
    click: () => act(() => { screen.getByTestId('act').click() }),
    ctx: () => ctxRef,
  }
}

describe('Pomodoro — POMODORO_START', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('sets phase to focus', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    expect(ctx().state.pomodoro.phase).toBe('focus')
  })

  it('sets startedAt to now', async () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    expect(ctx().state.pomodoro.startedAt).toBe(now)
  })

  it('resets pausedElapsed to 0', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    expect(ctx().state.pomodoro.pausedElapsed).toBe(0)
  })

  it('increments sessionsStarted', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    expect(ctx().state.stats.sessionsStarted).toBe(1)
  })

  it('adds chronicle event', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    expect(ctx().state.chronicleEvents.some((e) => e.includes('[FOCUS]'))).toBe(true)
  })
})

describe('Pomodoro — POMODORO_PAUSE / RESUME', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('pause clears startedAt and saves elapsed', async () => {
    const startTime = 1000000
    vi.setSystemTime(startTime)
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    vi.setSystemTime(startTime + 60000) // 60 seconds later
    act(() => ctx().pomodoroPause())
    expect(ctx().state.pomodoro.startedAt).toBeNull()
    expect(ctx().state.pomodoro.pausedElapsed).toBeCloseTo(60, 0)
  })

  it('resume sets startedAt', async () => {
    const startTime = 1000000
    vi.setSystemTime(startTime)
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    act(() => ctx().pomodoroPause())
    const resumeTime = startTime + 120000
    vi.setSystemTime(resumeTime)
    act(() => ctx().pomodoroResume())
    expect(ctx().state.pomodoro.startedAt).toBe(resumeTime)
  })

  it('pause is no-op when not running (startedAt null)', async () => {
    const { ctx } = wrap(() => {})
    const before = ctx().state.pomodoro
    act(() => ctx().pomodoroPause())
    expect(ctx().state.pomodoro).toEqual(before)
  })
})

describe('Pomodoro — POMODORO_COMPLETE', () => {
  it('transitions focus → break', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    act(() => ctx().pomodoroComplete())
    expect(ctx().state.pomodoro.phase).toBe('break')
  })

  it('transitions break → idle', async () => {
    const { ctx } = wrap(() => {})
    act(() => {
      ctx().pomodoroStart()
      ctx().pomodoroComplete() // focus → break
      ctx().pomodoroComplete() // break → idle
    })
    expect(ctx().state.pomodoro.phase).toBe('idle')
  })

  it('awards energy on focus complete', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    const energyBefore = ctx().state.energy
    act(() => ctx().pomodoroComplete())
    expect(ctx().state.energy).toBeGreaterThanOrEqual(energyBefore)
  })

  it('records focus minutes in stats', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    act(() => ctx().pomodoroComplete())
    expect(ctx().state.stats.totalFocusMinutes).toBeGreaterThan(0)
  })

  it('logs chronicle event on focus complete', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    act(() => ctx().pomodoroComplete())
    expect(ctx().state.chronicleEvents.some((e) => e.includes('Session complete'))).toBe(true)
  })
})

describe('Pomodoro — POMODORO_RESET', () => {
  it('resets to idle', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroStart())
    act(() => ctx().pomodoroReset())
    expect(ctx().state.pomodoro.phase).toBe('idle')
    expect(ctx().state.pomodoro.startedAt).toBeNull()
    expect(ctx().state.pomodoro.pausedElapsed).toBe(0)
  })
})

describe('Pomodoro — POMODORO_CONFIG', () => {
  it('updates focus and break durations', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().pomodoroConfig(30 * 60, 10 * 60))
    expect(ctx().state.pomodoro.focusDuration).toBe(1800)
    expect(ctx().state.pomodoro.breakDuration).toBe(600)
  })
})
