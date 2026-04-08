import React, { createContext, useContext, useMemo, useReducer } from 'react'

export type Scene = 'nexus' | 'drop' | 'silo'
export type DropChoice = 'sprint' | 'crawl' | null

export interface AxiomMessage {
  id: string
  text: string
  timestamp: number
}

export interface GameState {
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
  | { type: 'SET_OBJECTIVE'; text: string }

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

    case 'SET_OBJECTIVE':
      return { ...state, objective: action.text }

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
  setObjective: (text: string) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = useMemo(() => ({
    setScene: (scene: Scene) => dispatch({ type: 'SET_SCENE', scene }),
    addAxiomMessage: (text: string) => dispatch({ type: 'ADD_AXIOM', text }),
    addChronicleEvent: (text: string) => dispatch({ type: 'ADD_CHRONICLE', text }),
    applyDropChoice: (choice: 'sprint' | 'crawl') => dispatch({ type: 'APPLY_DROP_CHOICE', choice }),
    setSiloHatchOpen: (open: boolean) => dispatch({ type: 'SET_SILO_HATCH_OPEN', open }),
    setSiloScrapCollected: (collected: boolean) => dispatch({ type: 'SET_SILO_SCRAP_COLLECTED', collected }),
    adjustEnergy: (delta: number) => dispatch({ type: 'ADJUST_ENERGY', delta }),
    adjustHeat: (delta: number) => dispatch({ type: 'ADJUST_HEAT', delta }),
    setObjective: (text: string) => dispatch({ type: 'SET_OBJECTIVE', text }),
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
