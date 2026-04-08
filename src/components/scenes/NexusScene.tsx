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
}

const STRUCTURES: Structure[] = [
  { id: 'arm',   label: 'THE ARM',   sublabel: 'Manipulation & Control',  active: true,  orbitRadius: 180, orbitDuration: 20, orbitDelay: 0   },
  { id: 'eye',   label: 'THE EYE',   sublabel: 'Perception & Sensing',    active: false, orbitRadius: 240, orbitDuration: 28, orbitDelay: -7  },
  { id: 'swarm', label: 'THE SWARM', sublabel: 'Distributed Systems',     active: false, orbitRadius: 300, orbitDuration: 35, orbitDelay: -14 },
  { id: 'mind',  label: 'THE MIND',  sublabel: 'Cognition & Planning',    active: false, orbitRadius: 150, orbitDuration: 16, orbitDelay: -5  },
]

export default function NexusScene() {
  const { setScene, addChronicleEvent, setObjective } = useGameState()
  const stars = useMemo(() => generateStars(100), [])
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  function handleArmClick() {
    addChronicleEvent('Entered The Arm path')
    setObjective('Survive The Drop.')
    setScene('drop')
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at center, #0d0d22 0%, #0a0a0f 65%)',
      overflow: 'hidden',
    }}>
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
            background: s.size > 2 ? 'var(--teal-bright)' : '#fff',
            opacity: 0.6,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Orbit ring guides (subtle) */}
      {STRUCTURES.map((s) => (
        <div
          key={`ring-${s.id}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${s.orbitRadius * 2}px`,
            height: `${s.orbitRadius * 2}px`,
            borderRadius: '50%',
            border: `1px solid ${s.active ? 'rgba(0,245,212,0.08)' : 'rgba(100,100,100,0.06)'}`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Center title — entrance animation */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        animation: 'nexus-title-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: 'clamp(22px, 3vw, 32px)',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: 'var(--teal-bright)',
          textShadow: '0 0 24px rgba(0,245,212,0.6), 0 0 60px rgba(0,245,212,0.15)',
          marginBottom: '10px',
          lineHeight: 1,
        }}>
          SINGULARITY FORGE
        </div>
        <div style={{
          fontSize: '10px',
          letterSpacing: '5px',
          color: 'rgba(0,245,212,0.4)',
          animation: 'nexus-sub-in 2.5s ease both',
          textTransform: 'uppercase',
        }}>
          Select your path
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
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                transform: 'translate(-50%, -50%)',
                cursor: s.active ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              {/* Node circle */}
              <div style={{
                width: s.active ? '52px' : '38px',
                height: s.active ? '52px' : '38px',
                borderRadius: '50%',
                border: `2px solid ${s.active ? 'var(--teal)' : 'rgba(80,80,100,0.35)'}`,
                background: s.active
                  ? hoveredId === s.id
                    ? 'rgba(0,245,212,0.18)'
                    : 'rgba(0,245,212,0.08)'
                  : 'rgba(40,40,60,0.25)',
                boxShadow: s.active
                  ? hoveredId === s.id
                    ? '0 0 24px rgba(0,245,212,0.55), inset 0 0 12px rgba(0,245,212,0.12)'
                    : '0 0 14px rgba(0,245,212,0.3)'
                  : 'none',
                animation: s.active ? 'pulse-glow 2.5s ease-in-out infinite' : 'none',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}>
                {s.active && (
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--teal)',
                    boxShadow: 'var(--glow-teal)',
                  }} />
                )}
                {!s.active && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(80,80,100,0.4)',
                  }} />
                )}
              </div>

              {/* Label */}
              <div style={{
                fontSize: s.active ? '10px' : '9px',
                letterSpacing: '2px',
                color: s.active ? 'var(--teal)' : 'rgba(80,80,100,0.5)',
                textShadow: s.active ? 'var(--glow-teal)' : 'none',
                whiteSpace: 'nowrap',
                fontWeight: s.active ? 'bold' : 'normal',
                marginBottom: '3px',
              }}>
                {s.label}
              </div>

              {/* Active callout or Coming Soon */}
              {s.active && hoveredId === s.id && (
                <div style={{
                  fontSize: '8px',
                  letterSpacing: '1.5px',
                  color: 'var(--teal-bright)',
                  textShadow: 'var(--glow-teal)',
                  animation: 'pulse-glow 1s ease-in-out infinite',
                }}>
                  ▶ ENTER
                </div>
              )}
              {s.active && hoveredId !== s.id && (
                <div style={{
                  fontSize: '8px',
                  letterSpacing: '1px',
                  color: 'rgba(0,245,212,0.35)',
                }}>
                  {s.sublabel}
                </div>
              )}
              {!s.active && hoveredId === s.id && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--panel-bg)',
                  border: '1px solid rgba(255,183,0,0.3)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '9px',
                  color: 'var(--amber)',
                  letterSpacing: '1.5px',
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                  backdropFilter: 'blur(4px)',
                }}>
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom instruction */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '9px',
        letterSpacing: '3px',
        color: 'rgba(0,245,212,0.2)',
        animation: 'nexus-sub-in 3s ease both',
        whiteSpace: 'nowrap',
      }}>
        PHASE I — THE ARM IS ACTIVE
      </div>
    </div>
  )
}
