interface KeyboardHelpProps {
  open: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Open command palette' },
  { keys: ['?'], description: 'Toggle keyboard shortcuts' },
  { keys: ['T'], description: 'Toggle task panel' },
  { keys: ['F'], description: 'Toggle focus timer' },
  { keys: ['N'], description: 'Toggle notes panel' },
  { keys: ['S'], description: 'Toggle stats panel' },
  { keys: ['Esc'], description: 'Close overlay / cancel' },
]

export default function KeyboardHelp({ open, onClose }: KeyboardHelpProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        style={{
          background: 'rgba(10,12,18,0.98)',
          border: '1px solid rgba(0,245,212,0.3)',
          borderRadius: '6px',
          padding: '20px',
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 0 40px rgba(0,245,212,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(0,245,212,0.15)',
            paddingBottom: '10px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--teal-bright)',
            }}
          >
            ⌨ KEYBOARD SHORTCUTS
          </span>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(0,245,212,0.4)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <div>
          {SHORTCUTS.map(({ keys, description }) => (
            <div
              key={keys.join('+')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '11px', color: 'rgba(0,245,212,0.7)' }}>{description}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {keys.map((k) => (
                  <kbd
                    key={k}
                    style={{
                      fontSize: '10px',
                      background: 'rgba(0,245,212,0.08)',
                      border: '1px solid rgba(0,245,212,0.25)',
                      borderRadius: '3px',
                      padding: '2px 7px',
                      color: 'var(--teal)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(0,245,212,0.1)',
            fontSize: '9px',
            color: 'rgba(0,245,212,0.3)',
            textAlign: 'center',
          }}
        >
          Shortcuts work when no text input is focused
        </div>
      </div>
    </div>
  )
}
