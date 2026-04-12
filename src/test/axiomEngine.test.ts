/**
 * Tests for the AxiomEngine — pure function, no DOM needed.
 */
import { describe, it, expect } from 'vitest'
import { evaluateAxiom } from '../components/axiom/AxiomEngine'
import type { GameState } from '../store/gameState'

const baseState: GameState = {
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

describe('AxiomEngine — evaluateAxiom', () => {
  it('returns a string for energy_low when energy < 15', () => {
    const lowState = { ...baseState, energy: 10 }
    const result = evaluateAxiom(lowState, 'energy_low')
    expect(typeof result).toBe('string')
    expect(result).not.toBeNull()
  })

  it('returns null for energy_low when energy >= 15', () => {
    const result = evaluateAxiom(baseState, 'energy_low')
    expect(result).toBeNull()
  })

  it('returns a string for hesitation', () => {
    const result = evaluateAxiom(baseState, 'hesitation')
    expect(typeof result).toBe('string')
  })

  it('returns a string for drop_sprint', () => {
    const result = evaluateAxiom(baseState, 'drop_sprint')
    expect(typeof result).toBe('string')
  })

  it('returns a string for drop_crawl', () => {
    const result = evaluateAxiom(baseState, 'drop_crawl')
    expect(typeof result).toBe('string')
  })

  it('returns a string for silo_enter', () => {
    const result = evaluateAxiom(baseState, 'silo_enter')
    expect(typeof result).toBe('string')
  })

  it('returns a string for hatch_open', () => {
    const result = evaluateAxiom(baseState, 'hatch_open')
    expect(typeof result).toBe('string')
  })

  it('returns null for unknown event', () => {
    const result = evaluateAxiom(baseState, 'nonexistent_event_xyz')
    expect(result).toBeNull()
  })
})
