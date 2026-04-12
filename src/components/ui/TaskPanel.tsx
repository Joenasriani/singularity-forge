import { useState } from 'react'
import { useGameState, type Task, type TaskStatus } from '../../store/gameState'

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'rgba(0,245,212,0.5)',
  doing: 'var(--amber)',
  done: 'rgba(0,245,212,0.3)',
}

function genId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface TaskRowProps {
  task: Task
  onComplete: () => void
  onDelete: () => void
  onEdit: () => void
}

function TaskRow({ task, onComplete, onDelete, onEdit }: TaskRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        padding: '6px 0',
        borderBottom: '1px solid rgba(0,245,212,0.08)',
        opacity: task.status === 'done' ? 0.5 : 1,
      }}
    >
      <button
        onClick={onComplete}
        disabled={task.status === 'done'}
        aria-label={task.status === 'done' ? 'Task done' : 'Mark done'}
        style={{
          flexShrink: 0,
          width: '16px',
          height: '16px',
          background: 'none',
          border: `1px solid ${STATUS_COLORS[task.status]}`,
          borderRadius: '2px',
          color: STATUS_COLORS[task.status],
          fontSize: '10px',
          cursor: task.status === 'done' ? 'default' : 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1px',
        }}
      >
        {task.status === 'done' ? '✓' : ''}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '11px',
            color: task.status === 'done' ? 'rgba(0,245,212,0.4)' : 'var(--teal-bright)',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </div>
        {task.tags && task.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '3px' }}>
            {task.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '9px',
                  background: 'rgba(0,245,212,0.1)',
                  border: '1px solid rgba(0,245,212,0.2)',
                  borderRadius: '2px',
                  padding: '1px 4px',
                  color: 'rgba(0,245,212,0.6)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button
          onClick={onEdit}
          aria-label="Edit task"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(0,245,212,0.4)',
            fontSize: '10px',
            cursor: 'pointer',
            padding: '0 2px',
          }}
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete task"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,34,68,0.4)',
            fontSize: '10px',
            cursor: 'pointer',
            padding: '0 2px',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

interface TaskFormProps {
  initial?: Partial<Task>
  onSave: (data: { title: string; description: string; tags: string; status: TaskStatus }) => void
  onCancel: () => void
}

function TaskForm({ initial, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '')
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo')

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,245,212,0.05)',
    border: '1px solid rgba(0,245,212,0.2)',
    borderRadius: '3px',
    color: 'var(--teal)',
    fontSize: '11px',
    padding: '4px 6px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '6px',
  }

  return (
    <div style={{ marginBottom: '8px' }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
        aria-label="Task title"
        style={inputStyle}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && title.trim()) onSave({ title, description, tags, status })
          if (e.key === 'Escape') onCancel()
        }}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        aria-label="Task description"
        style={inputStyle}
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        aria-label="Task tags"
        style={inputStyle}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
        aria-label="Task status"
        style={{ ...inputStyle, marginBottom: '8px' }}
      >
        <option value="todo">TODO</option>
        <option value="doing">DOING</option>
        <option value="done">DONE</option>
      </select>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => { if (title.trim()) onSave({ title, description, tags, status }) }}
          disabled={!title.trim()}
          aria-label="Save task"
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

export default function TaskPanel() {
  const { state, addTask, updateTask, deleteTask, completeTask } = useGameState()
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')
  const [tagFilter, setTagFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const allTags = Array.from(
    new Set(state.tasks.flatMap((t) => t.tags ?? []))
  )

  const filtered = state.tasks.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false
    if (tagFilter && !(t.tags ?? []).includes(tagFilter)) return false
    return true
  })

  function handleCreate(data: { title: string; description: string; tags: string; status: TaskStatus }) {
    const task: Task = {
      id: genId(),
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      status: data.status,
      createdAt: Date.now(),
      tags: data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      linkedScene: state.scene,
    }
    addTask(task)
    setShowForm(false)
  }

  function handleEdit(id: string, data: { title: string; description: string; tags: string; status: TaskStatus }) {
    updateTask(id, {
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      status: data.status,
      tags: data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    })
    setEditingId(null)
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(0,245,212,0.15)' : 'none',
    border: `1px solid ${active ? 'rgba(0,245,212,0.4)' : 'rgba(0,245,212,0.1)'}`,
    borderRadius: '3px',
    color: active ? 'var(--teal)' : 'rgba(0,245,212,0.4)',
    fontSize: '9px',
    letterSpacing: '1px',
    padding: '2px 6px',
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
        maxHeight: '420px',
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
        <span>▣ TASKS</span>
        <button
          onClick={() => { setShowForm(true); setEditingId(null) }}
          aria-label="New task"
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
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {(['all', 'todo', 'doing', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            style={btnStyle(filter === f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <button
            onClick={() => setTagFilter('')}
            aria-pressed={tagFilter === ''}
            style={btnStyle(tagFilter === '')}
          >
            ALL TAGS
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
              aria-pressed={tagFilter === tag}
              style={btnStyle(tagFilter === tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <TaskForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Task list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.length === 0 && !showForm && (
          <div style={{ color: 'rgba(0,245,212,0.3)', fontSize: '10px', fontStyle: 'italic', textAlign: 'center', paddingTop: '8px' }}>
            — no tasks —
          </div>
        )}
        {filtered.map((task) =>
          editingId === task.id ? (
            <TaskForm
              key={task.id}
              initial={task}
              onSave={(data) => handleEdit(task.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={() => completeTask(task.id)}
              onDelete={() => deleteTask(task.id)}
              onEdit={() => { setEditingId(task.id); setShowForm(false) }}
            />
          )
        )}
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(0,245,212,0.1)',
          fontSize: '9px',
          color: 'rgba(0,245,212,0.4)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{state.tasks.filter((t) => t.status === 'done').length}/{state.tasks.length} done</span>
        <span style={{ color: STATUS_COLORS.doing }}>
          {state.tasks.filter((t) => t.status === 'doing').length} in progress
        </span>
      </div>
    </div>
  )
}
