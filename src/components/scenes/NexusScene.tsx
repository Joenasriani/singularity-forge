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
  active: boolean
  orbitRadius: number
  orbitDuration: number
  orbitDelay: number
}

const STRUCTURES: Structure[] = [
  { id: 'arm',   label: 'THE ARM',   active: true,  orbitRadius: 180, orbitDuration: 20, orbitDelay: 0   },
  { id: 'eye',   label: 'THE EYE',   active: false, orbitRadius: 240, orbitDuration: 28, orbitDelay: -7  },
  { id: 'swarm', label: 'THE SWARM', active: false, orbitRadius: 300, orbitDuration: 35, orbitDelay: -14 },
  { id: 'mind',  label: 'THE MIND',  active: false, orbitRadius: 150, orbitDuration: 16, orbitDelay: -5  },
]

export default function NexusScene() {
  const { setScene, addChronicleEvent, setObjective } = useGameState()
  const stars = useMemo(() => generateStars(100), [])
  const [tooltip, setTooltip] = useState<string | null>(null)

  function handleArmClick() {
    addChronicleEvent('Entered The Arm path')
    setObjective('Survive The Drop.')
    setScene('drop')
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 60%, #0d1020 0%, #080810 55%, #050508 100%)',
      overflow: 'hidden',
      animation: 'scene-fade-in 0.6s ease forwards',
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
            background: '#fff',
            opacity: 0.6,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Subtle radial ring at center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(0,245,212,0.04) 0%, transparent 70%)',
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
        animation: 'slide-up-fade 0.8s 0.2s ease both',
      }}>
        <div style={{
          fontSize: 'clamp(20px, 3vw, 32px)',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: 'var(--teal)',
          textShadow: '0 0 30px rgba(0,245,212,0.6), var(--glow-teal)',
          marginBottom: '10px',
          textTransform: 'uppercase',
        }}>
          Singularity Forge
        </div>
        <div style={{
          fontSize: '10px',
          letterSpacing: '5px',
          color: 'rgba(0,245,212,0.4)',
          animation: 'pulse-glow 3s ease-in-out infinite',
          textTransform: 'uppercase',
        }}>
          Select Your Path
        </div>
        <div style={{
          marginTop: '16px',
          fontSize: '9px',
          letterSpacing: '2px',
          color: 'rgba(0,245,212,0.2)',
        }}>
          — Phase I: The Arm —
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
              onMouseEnter={() => !s.active && setTooltip(s.id)}
              onMouseLeave={() => setTooltip(null)}
              style={{
                transform: 'translate(-50%, -50%)',
                cursor: s.active ? 'pointer' : 'default',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              <div style={{
                width: s.active ? '52px' : '38px',
                height: s.active ? '52px' : '38px',
                borderRadius: '50%',
                border: `2px solid ${s.active ? 'var(--teal)' : 'rgba(80,80,100,0.35)'}`,
                background: s.active ? 'rgba(0,245,212,0.08)' : 'rgba(40,40,60,0.15)',
                boxShadow: s.active ? '0 0 20px rgba(0,245,212,0.35), inset 0 0 12px rgba(0,245,212,0.1)' : 'none',
                animation: s.active ? 'node-pulse 2.5s ease-in-out infinite' : 'none',
                '--pulse-color': 'var(--teal)',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              } as React.CSSProperties}>
                {s.active && (
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--teal)',
                    boxShadow: 'var(--glow-teal)',
                  }} />
                )}
              </div>
              <div style={{
                fontSize: '9px',
                letterSpacing: '2px',
                color: s.active ? 'var(--teal)' : 'rgba(80,80,100,0.45)',
                textShadow: s.active ? 'var(--glow-teal)' : 'none',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </div>
              {!s.active && (
                <div style={{
                  fontSize: '8px',
                  color: 'rgba(255,183,0,0.5)',
                  letterSpacing: '1px',
                  marginTop: '3px',
                  whiteSpace: 'nowrap',
                }}>
                  Coming Soon
                </div>
              )}
              {tooltip === s.id && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--panel-bg)',
                  border: '1px solid rgba(0,245,212,0.2)',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '9px',
                  color: 'var(--amber)',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                  backdropFilter: 'blur(4px)',
                }}>
                  Not yet available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
