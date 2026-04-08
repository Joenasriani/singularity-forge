import type { GameState } from '../../store/gameState'

export function evaluateAxiom(state: GameState, event: string): string | null {
  if (event === 'energy_low' && state.energy < 15) {
    return 'Low reserves. Adapt or fail.'
  }
  switch (event) {
    case 'hesitation':
      return 'Hesitation is a choice.'
    case 'drop_sprint':
      return 'Bold move. Corridor failures have a pattern.'
    case 'drop_crawl':
      return 'Safe paths breed safe operators. Is that what you want?'
    case 'silo_enter':
      return 'The Silo remembers every operator who passed through here. Most didn\'t leave.'
    case 'hatch_open':
      return 'You found a way. There are others.'
    default:
      return null
  }
}
