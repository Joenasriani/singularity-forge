import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [countdown, setCountdown] = useState<number>(60)
  const [showChoices, setShowChoices] = useState<boolean>(false)
  const [chosen, setChosen] = useState<boolean>(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bootRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Refs so interval callbacks can read latest values without re-subscribing
  const chosenRef = useRef(false)
  const handleChoiceRef = useRef<((choice: 'sprint' | 'crawl') => void) | null>(null)

  const handleChoice = useCallback((choice: 'sprint' | 'crawl') => {
    if (chosenRef.current) return
    chosenRef.current = true
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
  }, [state, applyDropChoice, addAxiomMessage, addChronicleEvent, setScene, setObjective])

  // Keep ref in sync so interval callback can call latest handleChoice
  useEffect(() => {
    handleChoiceRef.current = handleChoice
  })

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

  // Countdown — auto-selects crawl via ref callback when it reaches 0
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!)
          // Auto-select via ref so no setState-in-effect
          setTimeout(() => handleChoiceRef.current?.('crawl'), 0)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [])

  const countdownColor = countdown <= 10 ? 'var(--danger)' : countdown <= 20 ? 'var(--amber)' : 'var(--teal)'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#060610',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'scene-fade-in 0.4s ease forwards, flicker 8s ease-in-out infinite, alarm-border 1.2s ease-in-out infinite',
      overflow: 'hidden',
    }}>
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
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)',
        zIndex: 4,
      }} />

      {/* Countdown */}
      <div style={{
        position: 'absolute',
        top: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 'bold',
        color: countdownColor,
        textShadow: `0 0 24px ${countdownColor}`,
        letterSpacing: '6px',
        zIndex: 10,
        fontFamily: 'monospace',
        animation: countdown <= 10 ? 'pulse-glow 0.5s ease-in-out infinite' : 'none',
      }}>
        {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
      </div>

      {/* Boot messages */}
      <div style={{
        zIndex: 10,
        width: '580px',
        maxWidth: '90vw',
        marginBottom: '36px',
        animation: 'slide-up-fade 0.5s ease both',
      }}>
        {BOOT_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
          <div key={i} style={{
            fontSize: i === visibleMessages - 1 ? '14px' : '12px',
            color: i === visibleMessages - 1 ? '#fff' : 'rgba(255,255,255,0.35)',
            marginBottom: '8px',
            letterSpacing: '2px',
            textShadow: i === visibleMessages - 1 ? '0 0 12px rgba(255,34,68,0.7)' : 'none',
            transition: 'color 0.4s ease, font-size 0.3s ease',
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
          gap: '16px',
          width: '580px',
          maxWidth: '90vw',
          animation: 'slide-up-fade 0.4s ease both',
        }}>
          <button
            onClick={() => handleChoice('sprint')}
            style={{
              flex: 1,
              padding: '18px 16px',
              background: 'rgba(255,34,68,0.08)',
              border: '1px solid rgba(255,34,68,0.5)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,34,68,0.18)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,34,68,0.3)'
              e.currentTarget.style.borderColor = 'rgba(255,34,68,0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,34,68,0.08)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(255,34,68,0.5)'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--danger)', marginBottom: '8px' }}>
              ⚡ SPRINT — CORRIDOR 7
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', lineHeight: '1.5' }}>
              Power cell at risk. Structural failure imminent.<br/>
              <span style={{ color: 'rgba(255,183,0,0.6)' }}>+3 SCRAP · −15 ENERGY</span>
            </div>
          </button>

          <button
            onClick={() => handleChoice('crawl')}
            style={{
              flex: 1,
              padding: '18px 16px',
              background: 'rgba(0,245,212,0.06)',
              border: '1px solid rgba(0,245,212,0.35)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,245,212,0.12)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,212,0.2)'
              e.currentTarget.style.borderColor = 'rgba(0,245,212,0.7)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,245,212,0.06)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(0,245,212,0.35)'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--teal)', marginBottom: '8px' }}>
              ◎ CRAWLSPACE ACCESS
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', lineHeight: '1.5' }}>
              Slower. Stable. Lower exposure.<br/>
              <span style={{ color: 'rgba(0,245,212,0.6)' }}>+5 ENERGY</span>
            </div>
          </button>
        </div>
      )}

      {/* Chosen confirmation */}
      {chosen && (
        <div style={{
          zIndex: 10,
          textAlign: 'center',
          animation: 'slide-up-fade 0.3s ease both',
        }}>
          <div style={{
            fontSize: '14px',
            color: 'var(--teal)',
            letterSpacing: '5px',
            textShadow: 'var(--glow-teal)',
            animation: 'pulse-glow 0.8s ease-in-out infinite',
          }}>
            INITIALIZING SILO ACCESS...
          </div>
        </div>
      )}
    </div>
  )
}
