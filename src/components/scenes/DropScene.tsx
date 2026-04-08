import { useState, useEffect, useRef } from 'react'
import { useGameState } from '../../store/gameState'
import { evaluateAxiom } from '../axiom/AxiomEngine'

const BOOT_MESSAGES = [
  'SYSTEM BOOT... PARTIAL',
  'STRUCTURAL INTEGRITY: 43%',
  'WARNING: FIRE IN SECTOR 7',
  'EMERGENCY PROTOCOL ALPHA ENGAGED',
  'OPERATOR... ARE YOU FUNCTIONAL?',
]

export default function DropScene() {
  const { state, setScene, applyDropChoice, addAxiomMessage, addChronicleEvent, setObjective } = useGameState()
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [countdown, setCountdown] = useState<number>(45)
  const [showChoices, setShowChoices] = useState<boolean>(false)
  const [chosen, setChosen] = useState<boolean>(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bootRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Boot message sequence
  useEffect(() => {
    bootRef.current = setInterval(() => {
      setVisibleMessages((v) => {
        const next = v + 1
        if (next >= BOOT_MESSAGES.length) {
          clearInterval(bootRef.current!)
        }
        return next
      })
    }, 900)
    return () => { if (bootRef.current) clearInterval(bootRef.current) }
  }, [])

  // Show choices after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowChoices(true), 5000)
    return () => clearTimeout(t)
  }, [])

  // Countdown
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [])

  function handleChoice(choice: 'sprint' | 'crawl') {
    if (chosen) return
    setChosen(true)

    const axiomEvent = choice === 'sprint' ? 'drop_sprint' : 'drop_crawl'
    const axiomText = evaluateAxiom(state, axiomEvent)
    applyDropChoice(choice)
    if (axiomText) addAxiomMessage(axiomText)
    addChronicleEvent(`Chose: ${choice === 'sprint' ? 'Sprint — Corridor 7' : 'Crawlspace Access'}`)

    setTimeout(() => {
      setScene('silo')
      setObjective('Explore The Silo.')
    }, 2000)
  }

  // Auto-choose crawl when countdown hits 0 (placed after handleChoice declaration)
  useEffect(() => {
    if (countdown === 0 && !chosen) {
      handleChoice('crawl')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, chosen])

  const countdownColor = countdown <= 10 ? 'var(--danger)' : countdown <= 20 ? 'var(--amber)' : 'var(--teal)'

  return (
    <div
      className="scene-enter"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#070710',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'flicker 8s ease-in-out infinite, alarm-border 1.2s ease-in-out infinite',
        overflow: 'hidden',
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        zIndex: 5,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        zIndex: 4,
      }} />

      {/* Countdown */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '36px',
        fontWeight: 'bold',
        color: countdownColor,
        textShadow: `0 0 20px ${countdownColor}`,
        letterSpacing: '4px',
        zIndex: 10,
        fontFamily: 'monospace',
        animation: countdown <= 10 ? 'pulse-glow 0.5s ease-in-out infinite' : 'none',
      }}>
        {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
      </div>

      {/* Boot messages */}
      <div style={{
        zIndex: 10,
        width: '560px',
        maxWidth: '90vw',
        marginBottom: '32px',
      }}>
        {BOOT_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
          <div key={i} style={{
            fontSize: i === visibleMessages - 1 ? '14px' : '12px',
            color: i === visibleMessages - 1 ? '#fff' : 'rgba(255,255,255,0.45)',
            marginBottom: '6px',
            letterSpacing: '2px',
            textShadow: i === visibleMessages - 1 ? '0 0 10px rgba(255,34,68,0.6)' : 'none',
            transition: 'all 0.3s ease',
          }}>
            &gt; {msg}
            {i === visibleMessages - 1 && (
              <span style={{ animation: 'blink 0.8s step-end infinite' }}>_</span>
            )}
          </div>
        ))}
      </div>

      {/* Choices */}
      {showChoices && !chosen && (
        <div style={{
          zIndex: 10,
          display: 'flex',
          gap: '20px',
          width: '560px',
          maxWidth: '90vw',
        }}>
          <button
            onClick={() => handleChoice('sprint')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'rgba(255,34,68,0.1)',
              border: '1px solid rgba(255,34,68,0.6)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,34,68,0.2)'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(255,34,68,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,34,68,0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--danger)', marginBottom: '6px' }}>
              SPRINT — CORRIDOR 7
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
              Power cell at risk. Structural failure imminent.
            </div>
          </button>

          <button
            onClick={() => handleChoice('crawl')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'rgba(0,245,212,0.08)',
              border: '1px solid rgba(0,245,212,0.4)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,245,212,0.15)'
              e.currentTarget.style.boxShadow = 'var(--glow-teal)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,245,212,0.08)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--teal)', marginBottom: '6px' }}>
              CRAWLSPACE ACCESS
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
              Slower. Stable.
            </div>
          </button>
        </div>
      )}

      {/* Chosen confirmation */}
      {chosen && (
        <div style={{
          zIndex: 10,
          fontSize: '16px',
          color: 'var(--teal)',
          letterSpacing: '4px',
          textShadow: 'var(--glow-teal)',
          animation: 'pulse-glow 0.8s ease-in-out infinite',
        }}>
          INITIALIZING...
        </div>
      )}
    </div>
  )
}
