import { useState } from 'react'
import { useGameState, type Note } from '../../store/gameState'
import { downloadMarkdown } from '../../utils/exportMarkdown'

function genId() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

interface NoteEditorProps {
  note?: Note
  isGlobal: boolean
  onSave: (text: string) => void
  onCancel: () => void
}

function NoteEditor({ note, isGlobal, onSave, onCancel }: NoteEditorProps) {
  const [text, setText] = useState(note?.text ?? '')

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isGlobal ? 'Global note…' : 'Run note…'}
        aria-label={isGlobal ? 'Global note text' : 'Run note text'}
        rows={5}
        style={{
          width: '100%',
          background: 'rgba(0,245,212,0.05)',
          border: '1px solid rgba(0,245,212,0.2)',
          borderRadius: '3px',
          color: 'var(--teal)',
          fontSize: '11px',
          padding: '6px',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          marginBottom: '6px',
          lineHeight: '1.5',
        }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => { if (text.trim()) onSave(text) }}
          disabled={!text.trim()}
          aria-label="Save note"
          style={{
            flex: 1,
            background: 'rgba(0,245,212,0.1)',
            border: '1px solid rgba(0,245,212,0.3)',
            borderRadius: '3px',
            color: 'var(--teal)',
            fontSize: '10px',
            letterSpacing: '1px',
            padding: '4px',
            cursor: 'pointer',
          }}
        >
          SAVE
        </button>
        <button
          onClick={onCancel}
          aria-label="Cancel"
          style={{
            flex: 1,
            background: 'none',
            border: '1px solid rgba(0,245,212,0.15)',
            borderRadius: '3px',
            color: 'rgba(0,245,212,0.4)',
            fontSize: '10px',
            letterSpacing: '1px',
            padding: '4px',
            cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}

export default function NotesPanel() {
  const { state, addNote, updateNote, deleteNote } = useGameState()
  const [tab, setTab] = useState<'run' | 'global'>('run')
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const isGlobal = tab === 'global'
  const notes = state.notes.filter((n) => n.isGlobal === isGlobal)

  function handleCreate(text: string) {
    const note: Note = {
      id: genId(),
      text,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isGlobal,
    }
    addNote(note)
    setShowEditor(false)
  }

  function handleEdit(id: string, text: string) {
    updateNote(id, text)
    setEditingId(null)
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    background: active ? 'rgba(0,245,212,0.1)' : 'none',
    border: `1px solid ${active ? 'rgba(0,245,212,0.3)' : 'rgba(0,245,212,0.1)'}`,
    borderRadius: '3px',
    color: active ? 'var(--teal)' : 'rgba(0,245,212,0.4)',
    fontSize: '9px',
    letterSpacing: '1px',
    padding: '3px',
    cursor: 'pointer',
  })

  return (
    <div
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid rgba(0,245,212,0.2)',
        borderRadius: '4px',
        padding: '12px',
        width: '240px',
        backdropFilter: 'blur(4px)',
        maxHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '2px',
          color: 'var(--teal-bright)',
          marginBottom: '10px',
          borderBottom: '1px solid rgba(0,245,212,0.2)',
          paddingBottom: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>✎ NOTES</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => { setShowEditor(true); setEditingId(null) }}
            aria-label="New note"
            style={{
              background: 'none',
              border: '1px solid rgba(0,245,212,0.3)',
              borderRadius: '3px',
              color: 'var(--teal)',
              fontSize: '10px',
              cursor: 'pointer',
              padding: '1px 6px',
            }}
          >
            + NEW
          </button>
          <button
            onClick={() => downloadMarkdown(state)}
            aria-label="Export notes and chronicle as Markdown"
            title="Export Markdown"
            style={{
              background: 'none',
              border: '1px solid rgba(0,245,212,0.2)',
              borderRadius: '3px',
              color: 'rgba(0,245,212,0.5)',
              fontSize: '10px',
              cursor: 'pointer',
              padding: '1px 5px',
            }}
          >
            ↓MD
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <button onClick={() => setTab('run')} aria-pressed={tab === 'run'} style={tabStyle(tab === 'run')}>
          RUN
        </button>
        <button onClick={() => setTab('global')} aria-pressed={tab === 'global'} style={tabStyle(tab === 'global')}>
          GLOBAL
        </button>
      </div>

      {/* New note editor */}
      {showEditor && (
        <div style={{ marginBottom: '8px' }}>
          <NoteEditor
            isGlobal={isGlobal}
            onSave={handleCreate}
            onCancel={() => setShowEditor(false)}
          />
        </div>
      )}

      {/* Note list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notes.length === 0 && !showEditor && (
          <div style={{ color: 'rgba(0,245,212,0.3)', fontSize: '10px', fontStyle: 'italic', textAlign: 'center', paddingTop: '8px' }}>
            — no {isGlobal ? 'global' : 'run'} notes —
          </div>
        )}
        {notes.map((note) =>
          editingId === note.id ? (
            <div key={note.id} style={{ marginBottom: '8px' }}>
              <NoteEditor
                note={note}
                isGlobal={isGlobal}
                onSave={(text) => handleEdit(note.id, text)}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div
              key={note.id}
              style={{
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(0,245,212,0.08)',
              }}
            >
              <div
                style={{
                  fontSize: '9px',
                  color: 'rgba(0,245,212,0.3)',
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{formatDate(note.updatedAt)}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => { setEditingId(note.id); setShowEditor(false) }}
                    aria-label="Edit note"
                    style={{ background: 'none', border: 'none', color: 'rgba(0,245,212,0.4)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    aria-label="Delete note"
                    style={{ background: 'none', border: 'none', color: 'rgba(255,34,68,0.4)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--teal)',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {note.text}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
