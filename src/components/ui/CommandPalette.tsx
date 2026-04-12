import { useState, useEffect, useRef } from 'react'
import { useGameState } from '../../store/gameState'
import { downloadMarkdown } from '../../utils/exportMarkdown'

export interface PaletteCommand {
  id: string
  label: string
  description?: string
  shortcut?: string
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  extraCommands?: PaletteCommand[]
}

export default function CommandPalette({ open, onClose, extraCommands = [] }: CommandPaletteProps) {
  const { state, pomodoroStart, pomodoroReset, addTask } = useGameState()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Built-in commands
  const builtIn: PaletteCommand[] = [
    {
      id: 'focus-start',
      label: '▶ Start Focus Session',
      description: 'Begin a 25-minute Pomodoro focus session',
      shortcut: 'F',
      action: () => {
        if (state.pomodoro.phase === 'idle') pomodoroStart()
        onClose()
      },
    },
    {
      id: 'focus-reset',
      label: '↺ Reset Focus Timer',
      description: 'Reset the Pomodoro timer to idle',
      action: () => {
        pomodoroReset()
        onClose()
      },
    },
    {
      id: 'new-task',
      label: '▣ New Quick Task',
      description: 'Add a task (enter title after prompt)',
      shortcut: 'T',
      action: () => {
        const title = window.prompt('Task title:')
        if (title?.trim()) {
          addTask({
            id: `task-${Date.now()}`,
            title: title.trim(),
            status: 'todo',
            createdAt: Date.now(),
            linkedScene: state.scene,
          })
        }
        onClose()
      },
    },
    {
      id: 'export-md',
      label: '↓ Export Markdown',
      description: 'Download notes + chronicle as .md file',
      action: () => {
        downloadMarkdown(state)
        onClose()
      },
    },
    ...extraCommands,
  ]

  const filtered = query.trim()
    ? builtIn.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : builtIn

  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter' && filtered[selected]) {
        filtered[selected].action()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, filtered, selected, onClose])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        style={{
          background: 'rgba(10,12,18,0.98)',
          border: '1px solid rgba(0,245,212,0.3)',
          borderRadius: '6px',
          width: '480px',
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 0 40px rgba(0,245,212,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            borderBottom: '1px solid rgba(0,245,212,0.15)',
          }}
        >
          <span style={{ color: 'rgba(0,245,212,0.5)', fontSize: '14px' }}>⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command…"
            aria-label="Command search"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--teal)',
              fontSize: '13px',
              fontFamily: 'inherit',
              letterSpacing: '0.5px',
            }}
          />
          <kbd
            style={{
              fontSize: '9px',
              color: 'rgba(0,245,212,0.3)',
              border: '1px solid rgba(0,245,212,0.2)',
              borderRadius: '3px',
              padding: '1px 5px',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'rgba(0,245,212,0.3)',
                fontSize: '12px',
                fontStyle: 'italic',
              }}
            >
              No commands found
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => cmd.action()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                background: i === selected ? 'rgba(0,245,212,0.08)' : 'none',
                border: 'none',
                borderBottom: '1px solid rgba(0,245,212,0.05)',
                color: i === selected ? 'var(--teal-bright)' : 'rgba(0,245,212,0.7)',
                fontSize: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={() => setSelected(i)}
            >
              <div>
                <div style={{ letterSpacing: '0.5px' }}>{cmd.label}</div>
                {cmd.description && (
                  <div style={{ fontSize: '10px', color: 'rgba(0,245,212,0.35)', marginTop: '2px' }}>
                    {cmd.description}
                  </div>
                )}
              </div>
              {cmd.shortcut && (
                <kbd
                  style={{
                    fontSize: '9px',
                    color: 'rgba(0,245,212,0.4)',
                    border: '1px solid rgba(0,245,212,0.2)',
                    borderRadius: '3px',
                    padding: '1px 6px',
                    flexShrink: 0,
                  }}
                >
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '6px 14px',
            borderTop: '1px solid rgba(0,245,212,0.1)',
            display: 'flex',
            gap: '12px',
            fontSize: '9px',
            color: 'rgba(0,245,212,0.3)',
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ execute</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  )
}
