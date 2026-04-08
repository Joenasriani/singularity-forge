import { GameStateProvider, useGameState } from './store/gameState'
import DiegeticShell from './components/ui/DiegeticShell'
import NexusScene from './components/scenes/NexusScene'
import DropScene from './components/scenes/DropScene'
import SiloScene from './components/scenes/SiloScene'

function SceneRouter() {
  const { state } = useGameState()
  switch (state.scene) {
    case 'nexus': return <NexusScene />
    case 'drop':  return <DropScene />
    case 'silo':  return <SiloScene />
  }
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
