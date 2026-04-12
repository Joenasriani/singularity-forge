/**
 * Tests for the gameState reducer and context.
 * These cover the core data-layer logic for all state transitions.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { GameStateProvider, useGameState } from '../store/gameState'

// ─── Helpers ────────────────────────────────────────────────────────────────

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

describe('GameState — initial state', () => {
  it('starts on nexus scene', () => {
    const { ctx } = wrap(() => {})
    expect(ctx().state.scene).toBe('nexus')
  })

  it('starts with energy 60, heat 30, armor 85, scrap 0', () => {
    const { ctx } = wrap(() => {})
    expect(ctx().state.energy).toBe(60)
    expect(ctx().state.heat).toBe(30)
    expect(ctx().state.armor).toBe(85)
    expect(ctx().state.scrap).toBe(0)
  })
})

describe('GameState — setScene', () => {
  it('transitions to drop', async () => {
    const { click, ctx } = wrap((c) => c.setScene('drop'))
    await click()
    expect(ctx().state.scene).toBe('drop')
  })

  it('transitions to silo', async () => {
    const { click, ctx } = wrap((c) => c.setScene('silo'))
    await click()
    expect(ctx().state.scene).toBe('silo')
  })
})

describe('GameState — applyDropChoice', () => {
  it('sprint: deducts 15 energy, adds 3 scrap', async () => {
    const { click, ctx } = wrap((c) => c.applyDropChoice('sprint'))
    await click()
    expect(ctx().state.energy).toBe(45)
    expect(ctx().state.scrap).toBe(3)
    expect(ctx().state.dropChoice).toBe('sprint')
  })

  it('crawl: adds 5 energy', async () => {
    const { click, ctx } = wrap((c) => c.applyDropChoice('crawl'))
    await click()
    expect(ctx().state.energy).toBe(65)
    expect(ctx().state.dropChoice).toBe('crawl')
  })
})

describe('GameState — adjustEnergy', () => {
  it('clamps energy to 0 at minimum', async () => {
    const { click, ctx } = wrap((c) => c.adjustEnergy(-9999))
    await click()
    expect(ctx().state.energy).toBe(0)
  })

  it('clamps energy to 100 at maximum', async () => {
    const { click, ctx } = wrap((c) => c.adjustEnergy(9999))
    await click()
    expect(ctx().state.energy).toBe(100)
  })
})

describe('GameState — adjustScrap (salvage fix)', () => {
  it('adds scrap correctly', async () => {
    const { click, ctx } = wrap((c) => c.adjustScrap(5))
    await click()
    expect(ctx().state.scrap).toBe(5)
  })

  it('does not go below 0', async () => {
    const { click, ctx } = wrap((c) => c.adjustScrap(-9999))
    await click()
    expect(ctx().state.scrap).toBe(0)
  })
})

describe('GameState — silo nodes', () => {
  it('setSiloHatchOpen sets flag', async () => {
    const { click, ctx } = wrap((c) => c.setSiloHatchOpen(true))
    await click()
    expect(ctx().state.siloHatchOpen).toBe(true)
  })

  it('setSiloScrapCollected sets flag', async () => {
    const { click, ctx } = wrap((c) => c.setSiloScrapCollected(true))
    await click()
    expect(ctx().state.siloScrapCollected).toBe(true)
  })
})

describe('GameState — addAxiomMessage', () => {
  it('appends axiom messages', async () => {
    const { click, ctx } = wrap((c) => c.addAxiomMessage('hello'))
    await click()
    expect(ctx().state.axiomMessages).toHaveLength(1)
    expect(ctx().state.axiomMessages[0].text).toBe('hello')
  })

  it('caps at 20 messages', async () => {
    const { ctx } = wrap(() => {})
    act(() => {
      for (let i = 0; i < 25; i++) ctx().addAxiomMessage(`msg-${i}`)
    })
    expect(ctx().state.axiomMessages.length).toBeLessThanOrEqual(20)
  })
})

describe('GameState — addChronicleEvent', () => {
  it('appends chronicle events', async () => {
    const { click, ctx } = wrap((c) => c.addChronicleEvent('event1'))
    await click()
    expect(ctx().state.chronicleEvents).toHaveLength(1)
    expect(ctx().state.chronicleEvents[0]).toBe('event1')
  })
})

describe('GameState — setObjective', () => {
  it('updates objective text', async () => {
    const { click, ctx } = wrap((c) => c.setObjective('Survive.'))
    await click()
    expect(ctx().state.objective).toBe('Survive.')
  })
})

describe('GameState — loadState', () => {
  it('replaces entire state', async () => {
    const newState = {
      scene: 'silo' as const,
      energy: 42, heat: 10, armor: 50, scrap: 7,
      dropChoice: 'sprint' as const,
      axiomMessages: [], chronicleEvents: [],
      siloHatchOpen: true, siloScrapCollected: true,
      objective: 'Custom obj',
      tasks: [], notes: [],
      pomodoro: { phase: 'idle' as const, startedAt: null, pausedElapsed: 0, focusDuration: 1500, breakDuration: 300 },
      stats: { sessionsStarted: 0, totalFocusMinutes: 0, tasksCompleted: 0, scrapEarned: 0 },
      reducedMotion: false,
    }
    const { click, ctx } = wrap((c) => c.loadState(newState))
    await click()
    expect(ctx().state.scene).toBe('silo')
    expect(ctx().state.scrap).toBe(7)
    expect(ctx().state.siloHatchOpen).toBe(true)
  })
})

describe('GameState — adjustHeat', () => {
  it('increases heat', async () => {
    const { click, ctx } = wrap((c) => c.adjustHeat(20))
    await click()
    expect(ctx().state.heat).toBe(50)
  })
})

describe('useGameState — throws outside provider', () => {
  it('throws when used outside GameStateProvider', () => {
    function Bad() { useGameState(); return null }
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow('useGameState must be used within GameStateProvider')
    consoleSpy.mockRestore()
  })
})
