import './App.css'
import { useEffect, useRef, useState } from 'react'
import { GameStateProvider, useGameState, type Scene } from './store/gameState'
import DiegeticShell from './components/ui/DiegeticShell'
import NexusScene from './components/scenes/NexusScene'
import DropScene from './components/scenes/DropScene'
import SiloScene from './components/scenes/SiloScene'

function SceneRouter() {
  const { state } = useGameState()
  const [displayScene, setDisplayScene] = useState<Scene>(state.scene)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // fading is derived: we're mid-transition whenever displayScene lags behind state.scene
  const fading = displayScene !== state.scene

  useEffect(() => {
    if (state.scene === displayScene) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDisplayScene(state.scene)
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [state.scene, displayScene])

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
      {content}
    </div>
  )
}

export default function App() {
  return (
    <GameStateProvider>
      <DiegeticShell>
        <SceneRouter />
      </DiegeticShell>
    </GameStateProvider>
  )
}
