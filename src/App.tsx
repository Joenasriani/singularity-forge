import { useEffect, useRef, useState } from 'react'
import './App.css'
import { GameStateProvider, useGameState, type Scene } from './store/gameState'
import DiegeticShell from './components/ui/DiegeticShell'
import NexusScene from './components/scenes/NexusScene'
import DropScene from './components/scenes/DropScene'
import SiloScene from './components/scenes/SiloScene'

const STORAGE_KEY = 'sf-game-state-v1'

function ResetButton() {
  const [confirm, setConfirm] = useState(false)
  const { loadState } = useGameState()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleClick() {
    if (!confirm) {
      setConfirm(true)
      timerRef.current = setTimeout(() => setConfirm(false), 3000)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setConfirm(false)
    localStorage.removeItem(STORAGE_KEY)
    // reload page to reset all React state from scratch
    window.location.reload()
    // also dispatch loadState for immediate feedback before reload
    loadState({
      scene: 'nexus', energy: 60, heat: 30, armor: 85, scrap: 0,
      dropChoice: null, axiomMessages: [], chronicleEvents: [],
      siloHatchOpen: false, siloScrapCollected: false,
      objective: 'Find your path.',
    })
  }

  return (
    <button
      onClick={handleClick}
      title="Reset all progress"
      style={{
        position: 'fixed',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: confirm ? 'rgba(255,34,68,0.15)' : 'rgba(10,15,20,0.8)',
        border: `1px solid ${confirm ? 'rgba(255,34,68,0.5)' : 'rgba(0,245,212,0.12)'}`,
        borderRadius: '4px',
        color: confirm ? 'var(--danger)' : 'rgba(0,245,212,0.3)',
        fontSize: '9px',
        letterSpacing: '2px',
        padding: '3px 10px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {confirm ? '⚠ CONFIRM RESET?' : '↺ RESET'}
    </button>
  )
}

function SceneRouter() {
  const { state } = useGameState()
  const [displayScene, setDisplayScene] = useState<Scene>(state.scene)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // fading is derived: we're mid-transition whenever displayScene lags behind state.scene
  const fading = displayScene !== state.scene

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDisplayScene(state.scene)
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [state.scene])

  const content = (() => {
    switch (displayScene) {
      case 'nexus': return <NexusScene />
      case 'drop':  return <DropScene />
      case 'silo':  return <SiloScene />
    }
  })()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        opacity: fading ? 0 : 1,
        transition: 'opacity 300ms ease',
      }}
    >
      <div key={displayScene} className="scene-wrapper">
        {content}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <GameStateProvider>
      <DiegeticShell>
        <SceneRouter />
      </DiegeticShell>
      <ResetButton />
    </GameStateProvider>
  )
}
