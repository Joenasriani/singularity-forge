import './App.css'
import { GameStateProvider, useGameState } from './store/gameState'
import DiegeticShell from './components/ui/DiegeticShell'
import NexusScene from './components/scenes/NexusScene'
import DropScene from './components/scenes/DropScene'
import SiloScene from './components/scenes/SiloScene'

function SceneRouter() {
  const { state } = useGameState()
  // Key prop on wrapper triggers remount (and the CSS fade-in animation) on scene change
  return (
    <div key={state.scene} className="scene-wrapper">
      {state.scene === 'nexus' && <NexusScene />}
      {state.scene === 'drop'  && <DropScene />}
      {state.scene === 'silo'  && <SiloScene />}
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
