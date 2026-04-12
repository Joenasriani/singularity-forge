/**
 * Tests for task CRUD, status transitions, and completion rewards.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { GameStateProvider, useGameState, TASK_COMPLETE_SCRAP, TASK_COMPLETE_ENERGY, type Task } from '../store/gameState'

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

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-task-1',
    title: 'Fix the hatch',
    status: 'todo',
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('Tasks — ADD_TASK', () => {
  it('adds a task', async () => {
    const task = makeTask()
    const { click, ctx } = wrap((c) => c.addTask(task))
    await click()
    expect(ctx().state.tasks).toHaveLength(1)
    expect(ctx().state.tasks[0].title).toBe('Fix the hatch')
  })

  it('preserves other tasks', async () => {
    const { ctx } = wrap(() => {})
    act(() => {
      ctx().addTask(makeTask({ id: 'a', title: 'A' }))
      ctx().addTask(makeTask({ id: 'b', title: 'B' }))
    })
    expect(ctx().state.tasks).toHaveLength(2)
  })
})

describe('Tasks — UPDATE_TASK', () => {
  it('updates task title', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().updateTask('test-task-1', { title: 'Updated title' }))
    expect(ctx().state.tasks[0].title).toBe('Updated title')
  })

  it('updates task status', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().updateTask('test-task-1', { status: 'doing' }))
    expect(ctx().state.tasks[0].status).toBe('doing')
  })

  it('ignores unknown id', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().updateTask('nonexistent', { title: 'X' }))
    expect(ctx().state.tasks[0].title).toBe('Fix the hatch')
  })
})

describe('Tasks — DELETE_TASK', () => {
  it('removes the task', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().deleteTask('test-task-1'))
    expect(ctx().state.tasks).toHaveLength(0)
  })

  it('only removes the specified task', async () => {
    const { ctx } = wrap(() => {})
    act(() => {
      ctx().addTask(makeTask({ id: 'a', title: 'A' }))
      ctx().addTask(makeTask({ id: 'b', title: 'B' }))
    })
    act(() => ctx().deleteTask('a'))
    expect(ctx().state.tasks).toHaveLength(1)
    expect(ctx().state.tasks[0].id).toBe('b')
  })
})

describe('Tasks — COMPLETE_TASK', () => {
  it('marks task as done', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().completeTask('test-task-1'))
    expect(ctx().state.tasks[0].status).toBe('done')
    expect(ctx().state.tasks[0].completedAt).toBeDefined()
  })

  it(`rewards ${TASK_COMPLETE_SCRAP} scrap and ${TASK_COMPLETE_ENERGY} energy`, async () => {
    const { ctx } = wrap(() => {})
    const beforeScrap = ctx().state.scrap
    const beforeEnergy = ctx().state.energy
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().completeTask('test-task-1'))
    expect(ctx().state.scrap).toBe(beforeScrap + TASK_COMPLETE_SCRAP)
    expect(ctx().state.energy).toBe(Math.min(100, beforeEnergy + TASK_COMPLETE_ENERGY))
  })

  it('logs to chronicle', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().completeTask('test-task-1'))
    const evt = ctx().state.chronicleEvents.find((e) => e.includes('[TASK]'))
    expect(evt).toBeDefined()
    expect(evt).toContain('Fix the hatch')
  })

  it('increments stats.tasksCompleted', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask()))
    act(() => ctx().completeTask('test-task-1'))
    expect(ctx().state.stats.tasksCompleted).toBe(1)
  })

  it('is idempotent: completing a done task does nothing', async () => {
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(makeTask({ status: 'done' })))
    const scrapBefore = ctx().state.scrap
    act(() => ctx().completeTask('test-task-1'))
    expect(ctx().state.scrap).toBe(scrapBefore)
  })
})

describe('Tasks — tags and metadata', () => {
  it('preserves tags', async () => {
    const task = makeTask({ tags: ['urgent', 'silo'] })
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(task))
    expect(ctx().state.tasks[0].tags).toEqual(['urgent', 'silo'])
  })

  it('preserves linkedScene', async () => {
    const task = makeTask({ linkedScene: 'nexus' })
    const { ctx } = wrap(() => {})
    act(() => ctx().addTask(task))
    expect(ctx().state.tasks[0].linkedScene).toBe('nexus')
  })
})
