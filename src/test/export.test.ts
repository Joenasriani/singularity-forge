/**
 * Tests for the Markdown export utility.
 */
import { describe, it, expect } from 'vitest'
import { buildMarkdown } from '../utils/exportMarkdown'
import type { GameState } from '../store/gameState'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    scene: 'silo',
    energy: 75,
    heat: 20,
    armor: 85,
    scrap: 10,
    dropChoice: 'sprint',
    axiomMessages: [],
    chronicleEvents: [],
    siloHatchOpen: false,
    siloScrapCollected: false,
    objective: 'Survive.',
    tasks: [],
    notes: [],
    pomodoro: { phase: 'idle', startedAt: null, pausedElapsed: 0, focusDuration: 1500, breakDuration: 300 },
    stats: { sessionsStarted: 3, totalFocusMinutes: 75, tasksCompleted: 5, scrapEarned: 12 },
    reducedMotion: false,
    ...overrides,
  }
}

describe('buildMarkdown', () => {
  it('returns a string', () => {
    const md = buildMarkdown(makeState())
    expect(typeof md).toBe('string')
  })

  it('includes a header', () => {
    const md = buildMarkdown(makeState())
    expect(md).toContain('# Singularity Forge')
  })

  it('includes stats section', () => {
    const md = buildMarkdown(makeState())
    expect(md).toContain('## Stats')
    expect(md).toContain('3') // sessionsStarted
    expect(md).toContain('75') // totalFocusMinutes
  })

  it('includes tasks when present', () => {
    const state = makeState({
      tasks: [
        {
          id: 'task-1',
          title: 'Fix the hatch',
          status: 'done',
          createdAt: Date.now(),
          completedAt: Date.now(),
          tags: ['silo'],
        },
        {
          id: 'task-2',
          title: 'Collect salvage',
          status: 'todo',
          createdAt: Date.now(),
        },
      ],
    })
    const md = buildMarkdown(state)
    expect(md).toContain('## Tasks')
    expect(md).toContain('Fix the hatch')
    expect(md).toContain('[x]') // done task
    expect(md).toContain('[ ]') // todo task
    expect(md).toContain('silo') // tag
  })

  it('does not include Tasks section when no tasks', () => {
    const md = buildMarkdown(makeState({ tasks: [] }))
    expect(md).not.toContain('## Tasks')
  })

  it('includes global notes', () => {
    const state = makeState({
      notes: [
        {
          id: 'n1',
          text: 'Remember to check the silo',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isGlobal: true,
        },
      ],
    })
    const md = buildMarkdown(state)
    expect(md).toContain('## Global Notes')
    expect(md).toContain('Remember to check the silo')
  })

  it('includes run notes', () => {
    const state = makeState({
      notes: [
        {
          id: 'n2',
          text: 'Hatch requires key',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isGlobal: false,
        },
      ],
    })
    const md = buildMarkdown(state)
    expect(md).toContain('## Run Notes')
    expect(md).toContain('Hatch requires key')
  })

  it('includes chronicle events', () => {
    const state = makeState({
      chronicleEvents: ['[FOCUS] Session started', '[TASK] ✓ Fix the hatch'],
    })
    const md = buildMarkdown(state)
    expect(md).toContain('## Chronicle')
    expect(md).toContain('[FOCUS] Session started')
    expect(md).toContain('[TASK] ✓ Fix the hatch')
  })

  it('does not include Chronicle section when empty', () => {
    const md = buildMarkdown(makeState({ chronicleEvents: [] }))
    expect(md).not.toContain('## Chronicle')
  })
})
