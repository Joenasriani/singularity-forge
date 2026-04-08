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
  const stars = useMemo(() => generateStars(80), [])
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
      background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #0a0a0f 70%)',
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
            background: '#fff',
            opacity: 0.7,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Center title */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          letterSpacing: '6px',
          color: 'var(--teal)',
          textShadow: 'var(--glow-teal)',
          marginBottom: '8px',
        }}>
          SINGULARITY FORGE
        </div>
        <div style={{
          fontSize: '11px',
          letterSpacing: '4px',
          color: 'rgba(0,245,212,0.45)',
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
              onMouseEnter={() => !s.active && setTooltip(s.id)}
              onMouseLeave={() => setTooltip(null)}
              style={{
                transform: 'translate(-50%, -50%)',
                cursor: s.active ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              <div style={{
                width: s.active ? '48px' : '36px',
                height: s.active ? '48px' : '36px',
                borderRadius: '50%',
                border: `2px solid ${s.active ? 'var(--teal)' : 'rgba(100,100,100,0.4)'}`,
                background: s.active ? 'rgba(0,245,212,0.1)' : 'rgba(60,60,80,0.2)',
                boxShadow: s.active ? 'var(--glow-teal)' : 'none',
                animation: s.active ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                margin: '0 auto 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {s.active && (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--teal)',
                    boxShadow: 'var(--glow-teal)',
                  }} />
                )}
              </div>
              <div style={{
                fontSize: '9px',
                letterSpacing: '2px',
                color: s.active ? 'var(--teal)' : 'rgba(100,100,100,0.5)',
                textShadow: s.active ? 'var(--glow-teal)' : 'none',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </div>
              {tooltip === s.id && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--panel-bg)',
                  border: '1px solid rgba(0,245,212,0.2)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '9px',
                  color: 'var(--amber)',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                }}>
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
