import type { GameState } from '../../store/gameState'

const HESITATION_MESSAGES = [
  'Hesitation is a choice.',
  'Stillness has a cost in moving systems.',
  'The Silo does not wait for operators.',
  'Inaction is data. Act on it.',
]

const SILO_ENTER_MESSAGES = [
  "The Silo remembers every operator who passed through here. Most didn't leave.",
  'Sector 01. Systems degraded. Opportunities remain.',
  'Entry logged. Integrity at risk. Proceed with intent.',
]

function pick(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
}

export function evaluateAxiom(state: GameState, event: string): string | null {
  if (event === 'energy_low' && state.energy < 15) {
    return state.energy <= 5
      ? 'Critical reserve. One wrong move ends this run.'
      : 'Low reserves. Every decision has a cost you haven\'t calculated yet.'
  }

  switch (event) {
    case 'hesitation':
      return pick(HESITATION_MESSAGES)
    case 'drop_sprint':
      return state.energy < 30
        ? 'Corridor 7 at low energy. Bold, or reckless?'
        : 'Bold entry. Corridor failures follow a pattern — find it before it finds you.'
    case 'drop_crawl':
      return state.energy < 30
        ? 'Safe choice. Energy preserved. Now use it.'
        : 'The slow path is still a path. Use the time.'
    case 'silo_enter':
      return pick(SILO_ENTER_MESSAGES)
    case 'hatch_open':
      return state.energy < 25
        ? 'Hatch forced. Low on reserves — move quickly.'
        : 'You found one way through. There are others. Not all of them cost what this did.'
    default:
      return null
  }
}
