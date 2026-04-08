import type { GameState } from '../../store/gameState'

export function evaluateAxiom(state: GameState, event: string): string | null {
  switch (event) {
    case 'energy_low':
      if (state.energy < 15) {
        return 'Low reserves. Every decision has a cost you haven\'t calculated yet.'
      }
      return null

    case 'hesitation':
      return 'The Silo doesn\'t wait. Neither should you.'

    case 'drop_sprint':
      return 'Bold entry. Corridor failures follow a pattern — find it before it finds you.'

    case 'drop_crawl':
      return 'The slow path is still a path. Use the time.'

    case 'silo_enter':
      return 'The Silo has memory. Every operator who passed through left a trace. You\'re adding yours now.'

    case 'hatch_open':
      return 'You found one way through. There are others. Not all of them cost what this did.'

    default:
      return null
  }
}
