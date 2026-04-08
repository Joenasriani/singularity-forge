import type { GameState } from '../../store/gameState'

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

const POOLS = {
  energy_low: [
    'Low reserves. Every decision has a cost you haven\'t calculated yet.',
    'Energy critical. The Silo doesn\'t reward hesitation at this margin.',
    'You\'re running thin. Choose what to spend it on carefully.',
  ],
  hesitation: [
    'The Silo doesn\'t wait. Neither should you.',
    'Stillness here is a decision too. Make sure it\'s intentional.',
    'Inaction is still a choice. What are you waiting for?',
  ],
  drop_sprint: [
    'Bold entry. Corridor failures follow a pattern — find it before it finds you.',
    'You moved fast. Now move smart.',
    'Corridor 7 has a history. You\'re part of it now.',
  ],
  drop_crawl: [
    'The slow path is still a path. Use the time.',
    'Measured entry. The Silo rewards operators who think before they run.',
    'Crawlspace access. Low profile, lower cost. Good call.',
  ],
  silo_enter: [
    'The Silo has memory. Every operator who passed through left a trace. You\'re adding yours now.',
    'You\'re in. The room doesn\'t know you yet — but it will.',
    'Sector 01. Three nodes. Your priorities will reveal themselves.',
  ],
  hatch_open: [
    'You found one way through. There are others. Not all of them cost what this did.',
    'Hatch cleared. Energy spent. What\'s on the other side better be worth it.',
    'Access granted. The Silo opens when you push. Remember that.',
  ],
}

export function evaluateAxiom(state: GameState, event: string): string | null {
  switch (event) {
    case 'energy_low':
      if (state.energy < 15) {
        return pick(POOLS.energy_low)
      }
      return null

    case 'hesitation':
      return pick(POOLS.hesitation)

    case 'drop_sprint':
      return pick(POOLS.drop_sprint)

    case 'drop_crawl':
      return pick(POOLS.drop_crawl)

    case 'silo_enter':
      return pick(POOLS.silo_enter)

    case 'hatch_open':
      return pick(POOLS.hatch_open)

    default:
      return null
  }
}
