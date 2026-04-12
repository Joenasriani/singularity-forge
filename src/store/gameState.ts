import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const STORAGE_KEY = 'sf-game-state-v1'

// ── Productivity types ───────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'doing' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  createdAt: number
  completedAt?: number
  tags?: string[]
  linkedScene?: string
}

export interface Note {
  id: string
  text: string
  createdAt: number
  updatedAt: number
  isGlobal: boolean
}

export interface PomodoroState {
  phase: 'idle' | 'focus' | 'break'
  startedAt: number | null  // epoch ms when current run started
  pausedElapsed: number     // seconds already elapsed before last pause
  focusDuration: number     // seconds (default 1500 = 25 min)
  breakDuration: number     // seconds (default 300 = 5 min)
}

export interface AppStats {
  sessionsStarted: number
  totalFocusMinutes: number
  tasksCompleted: number
  scrapEarned: number
}

// Reward constants
export const TASK_COMPLETE_SCRAP = 2
export const TASK_COMPLETE_ENERGY = 3

function loadPersistedState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GameState>
    // Validate essential fields exist before trusting persisted data
    if (typeof parsed.scene !== 'string') return null
    // Migrate: fill in any missing new fields with defaults
    return { ...initialState, ...parsed }
  } catch {
    return null
  }
}

function persistState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage might be blocked (private browsing, quota)
  }
}

export type Scene = 'nexus' | 'drop' | 'silo'
export type DropChoice = 'sprint' | 'crawl' | null

export interface AxiomMessage {
  id: string
  text: string
  timestamp: number
}

export interface GameState {
  // ── Core game fields ──
  scene: Scene
  energy: number
  heat: number
  armor: number
  scrap: number
  dropChoice: DropChoice
  axiomMessages: AxiomMessage[]
  chronicleEvents: string[]
  siloHatchOpen: boolean
  siloScrapCollected: boolean
  objective: string
  // ── Productivity fields ──
  tasks: Task[]
  notes: Note[]
  pomodoro: PomodoroState
  stats: AppStats
  reducedMotion: boolean
}

type Action =
  | { type: 'SET_SCENE'; scene: Scene }
  | { type: 'ADD_AXIOM'; text: string }
  | { type: 'ADD_CHRONICLE'; text: string }
  | { type: 'APPLY_DROP_CHOICE'; choice: 'sprint' | 'crawl' }
  | { type: 'SET_SILO_HATCH_OPEN'; open: boolean }
  | { type: 'SET_SILO_SCRAP_COLLECTED'; collected: boolean }
  | { type: 'ADJUST_ENERGY'; delta: number }
  | { type: 'ADJUST_HEAT'; delta: number }
  | { type: 'ADJUST_SCRAP'; delta: number }
  | { type: 'SET_OBJECTIVE'; text: string }
  | { type: 'LOAD_STATE'; state: GameState }
  // Task actions
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<Task> }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'COMPLETE_TASK'; id: string }
  // Note actions
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; id: string; text: string }
  | { type: 'DELETE_NOTE'; id: string }
  // Pomodoro actions
  | { type: 'POMODORO_START' }
  | { type: 'POMODORO_PAUSE' }
  | { type: 'POMODORO_RESUME' }
  | { type: 'POMODORO_COMPLETE' }
  | { type: 'POMODORO_RESET' }
  | { type: 'POMODORO_CONFIG'; focusDuration: number; breakDuration: number }
  // Stats actions
  | { type: 'INCREMENT_STAT'; key: keyof AppStats; amount?: number }
  // Accessibility
  | { type: 'SET_REDUCED_MOTION'; value: boolean }

const defaultPomodoro: PomodoroState = {
  phase: 'idle',
  startedAt: null,
  pausedElapsed: 0,
  focusDuration: 1500,
  breakDuration: 300,
}

const defaultStats: AppStats = {
  sessionsStarted: 0,
  totalFocusMinutes: 0,
  tasksCompleted: 0,
  scrapEarned: 0,
}

const initialState: GameState = {
  scene: 'nexus',
  energy: 60,
  heat: 30,
  armor: 85,
  scrap: 0,
  dropChoice: null,
  axiomMessages: [],
  chronicleEvents: [],
  siloHatchOpen: false,
  siloScrapCollected: false,
  objective: 'Find your path.',
  tasks: [],
  notes: [],
  pomodoro: defaultPomodoro,
  stats: defaultStats,
  reducedMotion: false,
}

function clamp(val: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val))
}

function makeAxiomMessage(text: string): AxiomMessage {
  return { id: `ax-${Date.now()}-${Math.random()}`, text, timestamp: Date.now() }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCENE':
      return { ...state, scene: action.scene }

    case 'ADD_AXIOM':
      return {
        ...state,
        axiomMessages: [...state.axiomMessages, makeAxiomMessage(action.text)].slice(-20),
      }

    case 'ADD_CHRONICLE':
      return {
        ...state,
        chronicleEvents: [...state.chronicleEvents, action.text].slice(-50),
      }

    case 'APPLY_DROP_CHOICE':
      if (action.choice === 'sprint') {
        return { ...state, dropChoice: 'sprint', energy: clamp(state.energy - 15), scrap: state.scrap + 3 }
      }
      return { ...state, dropChoice: 'crawl', energy: clamp(state.energy + 5) }

    case 'SET_SILO_HATCH_OPEN':
      return { ...state, siloHatchOpen: action.open }

    case 'SET_SILO_SCRAP_COLLECTED':
      return { ...state, siloScrapCollected: action.collected }

    case 'ADJUST_ENERGY':
      return { ...state, energy: clamp(state.energy + action.delta) }

    case 'ADJUST_HEAT':
      return { ...state, heat: clamp(state.heat + action.delta) }

    case 'ADJUST_SCRAP':
      return { ...state, scrap: Math.max(0, state.scrap + action.delta) }

    case 'SET_OBJECTIVE':
      return { ...state, objective: action.text }

    case 'LOAD_STATE':
      return { ...action.state }

    // ── Task actions ─────────────────────────────────────────────────────────

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => t.id === action.id ? { ...t, ...action.patch } : t),
      }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }

    case 'COMPLETE_TASK': {
      const now = Date.now()
      const task = state.tasks.find((t) => t.id === action.id)
      if (!task || task.status === 'done') return state
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: 'done', completedAt: now } : t
        ),
        scrap: state.scrap + TASK_COMPLETE_SCRAP,
        energy: clamp(state.energy + TASK_COMPLETE_ENERGY),
        chronicleEvents: [
          ...state.chronicleEvents,
          `[TASK] ✓ ${task.title} — +${TASK_COMPLETE_SCRAP} scrap, +${TASK_COMPLETE_ENERGY} energy`,
        ].slice(-50),
        stats: {
          ...state.stats,
          tasksCompleted: state.stats.tasksCompleted + 1,
          scrapEarned: state.stats.scrapEarned + TASK_COMPLETE_SCRAP,
        },
      }
    }

    // ── Note actions ─────────────────────────────────────────────────────────

    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.note] }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, text: action.text, updatedAt: Date.now() } : n
        ),
      }

    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) }

    // ── Pomodoro actions ──────────────────────────────────────────────────────

    case 'POMODORO_START':
      return {
        ...state,
        pomodoro: { ...state.pomodoro, phase: 'focus', startedAt: Date.now(), pausedElapsed: 0 },
        stats: { ...state.stats, sessionsStarted: state.stats.sessionsStarted + 1 },
        chronicleEvents: [...state.chronicleEvents, '[FOCUS] Session started'].slice(-50),
      }

    case 'POMODORO_PAUSE': {
      if (state.pomodoro.startedAt === null) return state
      const elapsed = (Date.now() - state.pomodoro.startedAt) / 1000
      return {
        ...state,
        pomodoro: {
          ...state.pomodoro,
          pausedElapsed: state.pomodoro.pausedElapsed + elapsed,
          startedAt: null,
        },
      }
    }

    case 'POMODORO_RESUME':
      if (state.pomodoro.phase === 'idle') return state
      return { ...state, pomodoro: { ...state.pomodoro, startedAt: Date.now() } }

    case 'POMODORO_COMPLETE': {
      const wasFocus = state.pomodoro.phase === 'focus'
      const focusMinutes = wasFocus
        ? Math.round(state.pomodoro.focusDuration / 60)
        : 0
      const newEnergy = wasFocus ? clamp(state.energy + 5) : state.energy
      return {
        ...state,
        energy: newEnergy,
        pomodoro: wasFocus
          ? { ...state.pomodoro, phase: 'break', startedAt: Date.now(), pausedElapsed: 0 }
          : { ...state.pomodoro, phase: 'idle', startedAt: null, pausedElapsed: 0 },
        stats: {
          ...state.stats,
          totalFocusMinutes: state.stats.totalFocusMinutes + focusMinutes,
        },
        chronicleEvents: [
          ...state.chronicleEvents,
          wasFocus
            ? `[FOCUS] Session complete — +${focusMinutes}m focus, +5 energy`
            : '[FOCUS] Break complete',
        ].slice(-50),
      }
    }

    case 'POMODORO_RESET':
      return {
        ...state,
        pomodoro: { ...state.pomodoro, phase: 'idle', startedAt: null, pausedElapsed: 0 },
      }

    case 'POMODORO_CONFIG':
      return {
        ...state,
        pomodoro: {
          ...state.pomodoro,
          focusDuration: action.focusDuration,
          breakDuration: action.breakDuration,
        },
      }

    // ── Stats ─────────────────────────────────────────────────────────────────

    case 'INCREMENT_STAT':
      return {
        ...state,
        stats: {
          ...state.stats,
          [action.key]: state.stats[action.key] + (action.amount ?? 1),
        },
      }

    // ── Accessibility ─────────────────────────────────────────────────────────

    case 'SET_REDUCED_MOTION':
      return { ...state, reducedMotion: action.value }

    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  setScene: (scene: Scene) => void
  addAxiomMessage: (text: string) => void
  addChronicleEvent: (text: string) => void
  applyDropChoice: (choice: 'sprint' | 'crawl') => void
  setSiloHatchOpen: (open: boolean) => void
  setSiloScrapCollected: (collected: boolean) => void
  adjustEnergy: (delta: number) => void
  adjustHeat: (delta: number) => void
  adjustScrap: (delta: number) => void
  setObjective: (text: string) => void
  loadState: (state: GameState) => void
  // Task actions
  addTask: (task: Task) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  // Note actions
  addNote: (note: Note) => void
  updateNote: (id: string, text: string) => void
  deleteNote: (id: string) => void
  // Pomodoro actions
  pomodoroStart: () => void
  pomodoroPause: () => void
  pomodoroResume: () => void
  pomodoroComplete: () => void
  pomodoroReset: () => void
  pomodoroConfig: (focusDuration: number, breakDuration: number) => void
  // Stats
  incrementStat: (key: keyof AppStats, amount?: number) => void
  // Accessibility
  setReducedMotion: (value: boolean) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => loadPersistedState() ?? initialState)

  // Persist on every state change
  useEffect(() => {
    persistState(state)
  }, [state])

  const actions = useMemo(() => ({
    setScene: (scene: Scene) => dispatch({ type: 'SET_SCENE', scene }),
    addAxiomMessage: (text: string) => dispatch({ type: 'ADD_AXIOM', text }),
    addChronicleEvent: (text: string) => dispatch({ type: 'ADD_CHRONICLE', text }),
    applyDropChoice: (choice: 'sprint' | 'crawl') => dispatch({ type: 'APPLY_DROP_CHOICE', choice }),
    setSiloHatchOpen: (open: boolean) => dispatch({ type: 'SET_SILO_HATCH_OPEN', open }),
    setSiloScrapCollected: (collected: boolean) => dispatch({ type: 'SET_SILO_SCRAP_COLLECTED', collected }),
    adjustEnergy: (delta: number) => dispatch({ type: 'ADJUST_ENERGY', delta }),
    adjustHeat: (delta: number) => dispatch({ type: 'ADJUST_HEAT', delta }),
    adjustScrap: (delta: number) => dispatch({ type: 'ADJUST_SCRAP', delta }),
    setObjective: (text: string) => dispatch({ type: 'SET_OBJECTIVE', text }),
    loadState: (state: GameState) => dispatch({ type: 'LOAD_STATE', state }),
    // Task actions
    addTask: (task: Task) => dispatch({ type: 'ADD_TASK', task }),
    updateTask: (id: string, patch: Partial<Task>) => dispatch({ type: 'UPDATE_TASK', id, patch }),
    deleteTask: (id: string) => dispatch({ type: 'DELETE_TASK', id }),
    completeTask: (id: string) => dispatch({ type: 'COMPLETE_TASK', id }),
    // Note actions
    addNote: (note: Note) => dispatch({ type: 'ADD_NOTE', note }),
    updateNote: (id: string, text: string) => dispatch({ type: 'UPDATE_NOTE', id, text }),
    deleteNote: (id: string) => dispatch({ type: 'DELETE_NOTE', id }),
    // Pomodoro actions
    pomodoroStart: () => dispatch({ type: 'POMODORO_START' }),
    pomodoroPause: () => dispatch({ type: 'POMODORO_PAUSE' }),
    pomodoroResume: () => dispatch({ type: 'POMODORO_RESUME' }),
    pomodoroComplete: () => dispatch({ type: 'POMODORO_COMPLETE' }),
    pomodoroReset: () => dispatch({ type: 'POMODORO_RESET' }),
    pomodoroConfig: (focusDuration: number, breakDuration: number) =>
      dispatch({ type: 'POMODORO_CONFIG', focusDuration, breakDuration }),
    // Stats
    incrementStat: (key: keyof AppStats, amount?: number) =>
      dispatch({ type: 'INCREMENT_STAT', key, amount }),
    // Accessibility
    setReducedMotion: (value: boolean) => dispatch({ type: 'SET_REDUCED_MOTION', value }),
  }), [])

  const value = useMemo<GameContextValue>(() => ({
    state,
    ...actions,
  }), [state, actions])

  return React.createElement(GameContext.Provider, { value }, children)
}

export function useGameState(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider')
  return ctx
}
