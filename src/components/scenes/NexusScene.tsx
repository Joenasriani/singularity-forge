import { useMemo, useState } from 'react'
import { useGameState } from '../../store/gameState'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 4,
  }))
}

interface Structure {
  id: string
  label: string
  sublabel: string
  active: boolean
  orbitRadius: number
  orbitDuration: number
  orbitDelay: number
  icon: string
}

const STRUCTURES: Structure[] = [
  { id: 'arm',   label: 'THE ARM',   sublabel: 'Forge Mode',   active: true,  icon: '⬡', orbitRadius: 180, orbitDuration: 22, orbitDelay: 0   },
  { id: 'eye',   label: 'THE EYE',   sublabel: 'Perception',   active: false, icon: '◎', orbitRadius: 250, orbitDuration: 30, orbitDelay: -8  },
  { id: 'swarm', label: 'THE SWARM', sublabel: 'Coordination', active: false, icon: '⬢', orbitRadius: 310, orbitDuration: 38, orbitDelay: -15 },
  { id: 'mind',  label: 'THE MIND',  sublabel: 'Synthesis',    active: false, icon: '◈', orbitRadius: 155, orbitDuration: 16, orbitDelay: -5  },
]

export default function NexusScene() {
  const { setScene, addChronicleEvent, setObjective } = useGameState()
  const stars = useMemo(() => generateStars(100), [])
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [armHovered, setArmHovered] = useState(false)

  function handleArmClick() {
    addChronicleEvent('Entered The Arm path')
    setObjective('Survive The Drop.')
    setScene('drop')
  }

  return (
    <div
      className="scene-enter"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, #0e0e1f 0%, #080810 55%, #0a0a0f 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Deep space radial */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,245,212,0.025) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: s.size > 2 ? 'rgba(180,220,255,0.9)' : '#fff',
            opacity: 0.6,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Nexus core glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,245,212,0.08) 0%, transparent 70%)',
        boxShadow: '0 0 60px rgba(0,245,212,0.06)',
        pointerEvents: 'none',
      }} />

      {/* Center title */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div style={{
          fontSize: '11px',
          letterSpacing: '5px',
          color: 'rgba(0,245,212,0.35)',
          marginBottom: '10px',
          textTransform: 'uppercase',
        }}>
          Phase I — The Nexus
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: 'var(--teal)',
          textShadow: '0 0 30px rgba(0,245,212,0.5), 0 0 60px rgba(0,245,212,0.15)',
          marginBottom: '6px',
          lineHeight: 1,
        }}>
          SINGULARITY
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: 'var(--teal)',
          textShadow: '0 0 30px rgba(0,245,212,0.5), 0 0 60px rgba(0,245,212,0.15)',
          marginBottom: '14px',
          lineHeight: 1,
        }}>
          FORGE
        </div>
        <div style={{
          fontSize: '10px',
          letterSpacing: '4px',
          color: 'rgba(0,245,212,0.4)',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}>
          SELECT YOUR PATH
        </div>
      </div>

      {/* Orbiting structures */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
      }}>
        {STRUCTURES.map((s) => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              animation: `orbit ${s.orbitDuration}s ${s.orbitDelay}s linear infinite`,
              '--orbit-r': `${s.orbitRadius}px`,
            } as React.CSSProperties}
          >
            <div
              onClick={s.active ? handleArmClick : undefined}
              onMouseEnter={() => {
                if (!s.active) setTooltip(s.id)
                if (s.active) setArmHovered(true)
              }}
              onMouseLeave={() => {
                setTooltip(null)
                setArmHovered(false)
              }}
              style={{
                transform: 'translate(-50%, -50%)',
                cursor: s.active ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              {/* Structure node */}
              <div style={{
                width: s.active ? '56px' : '40px',
                height: s.active ? '56px' : '40px',
                borderRadius: s.active ? '8px' : '50%',
                border: `2px solid ${s.active ? 'var(--teal)' : 'rgba(80,80,100,0.35)'}`,
                background: s.active
                  ? (armHovered ? 'rgba(0,245,212,0.2)' : 'rgba(0,245,212,0.08)')
                  : 'rgba(30,30,50,0.3)',
                boxShadow: s.active
                  ? (armHovered ? '0 0 24px rgba(0,245,212,0.6), 0 0 8px rgba(0,245,212,0.4)' : '0 0 16px rgba(0,245,212,0.3)')
                  : 'none',
                animation: s.active ? 'pulse-glow 2.5s ease-in-out infinite' : 'none',
                margin: '0 auto 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
                transform: s.active && armHovered ? 'scale(1.08)' : 'scale(1)',
              }}>
                <span style={{
                  fontSize: s.active ? '22px' : '16px',
                  color: s.active ? 'var(--teal)' : 'rgba(80,80,100,0.5)',
                  textShadow: s.active ? 'var(--glow-teal)' : 'none',
                }}>
                  {s.icon}
                </span>
              </div>
              <div style={{
                fontSize: '9px',
                letterSpacing: '2.5px',
                color: s.active ? 'var(--teal)' : 'rgba(80,80,100,0.45)',
                textShadow: s.active ? '0 0 8px rgba(0,245,212,0.4)' : 'none',
                whiteSpace: 'nowrap',
                marginBottom: '2px',
              }}>
                {s.label}
              </div>
              <div style={{
                fontSize: '8px',
                letterSpacing: '1px',
                color: s.active ? 'rgba(0,245,212,0.45)' : 'rgba(60,60,80,0.4)',
                whiteSpace: 'nowrap',
              }}>
                {s.active ? s.sublabel : 'Not Available'}
              </div>
              {tooltip === s.id && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(8,8,16,0.95)',
                  border: '1px solid rgba(255,183,0,0.3)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '9px',
                  color: 'var(--amber)',
                  letterSpacing: '1.5px',
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                  boxShadow: '0 0 10px rgba(255,183,0,0.15)',
                  animation: 'axiom-slide-in 0.15s ease forwards',
                }}>
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '9px',
        letterSpacing: '2px',
        color: 'rgba(0,245,212,0.2)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        SINGULARITY FORGE v0.1 — PHASE I PROTOTYPE
      </div>
    </div>
  )
}
