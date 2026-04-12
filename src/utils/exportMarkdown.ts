import type { GameState } from '../store/gameState'

function formatDate(ms: number): string {
  return new Date(ms).toISOString().replace('T', ' ').slice(0, 19) + 'Z'
}

/**
 * Generates a Markdown export of notes + chronicle from the current game state.
 */
export function buildMarkdown(state: GameState): string {
  const lines: string[] = []
  const now = formatDate(Date.now())

  lines.push('# Singularity Forge — Export')
  lines.push(`\n_Generated: ${now}_\n`)

  // Stats
  lines.push('## Stats\n')
  lines.push(`| Metric | Value |`)
  lines.push(`|---|---|`)
  lines.push(`| Sessions started | ${state.stats.sessionsStarted} |`)
  lines.push(`| Total focus minutes | ${state.stats.totalFocusMinutes} |`)
  lines.push(`| Tasks completed | ${state.stats.tasksCompleted} |`)
  lines.push(`| Scrap earned | ${state.stats.scrapEarned} |`)
  lines.push('')

  // Tasks
  if (state.tasks.length > 0) {
    lines.push('## Tasks\n')
    for (const task of state.tasks) {
      const check = task.status === 'done' ? '[x]' : '[ ]'
      const tags = task.tags?.length ? ` _(${task.tags.join(', ')})_` : ''
      lines.push(`- ${check} **${task.title}**${tags}`)
      if (task.description) lines.push(`  > ${task.description}`)
      lines.push(`  _Created: ${formatDate(task.createdAt)}${task.completedAt ? ` · Completed: ${formatDate(task.completedAt)}` : ''}_`)
    }
    lines.push('')
  }

  // Notes
  const globalNotes = state.notes.filter((n) => n.isGlobal)
  const runNotes = state.notes.filter((n) => !n.isGlobal)

  if (globalNotes.length > 0) {
    lines.push('## Global Notes\n')
    for (const note of globalNotes) {
      lines.push(`### ${formatDate(note.createdAt)}\n`)
      lines.push(note.text)
      lines.push('')
    }
  }

  if (runNotes.length > 0) {
    lines.push('## Run Notes\n')
    for (const note of runNotes) {
      lines.push(`### ${formatDate(note.createdAt)}\n`)
      lines.push(note.text)
      lines.push('')
    }
  }

  // Chronicle
  if (state.chronicleEvents.length > 0) {
    lines.push('## Chronicle\n')
    for (const evt of [...state.chronicleEvents].reverse()) {
      lines.push(`- ${evt}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Triggers a browser download of the Markdown export.
 */
export function downloadMarkdown(state: GameState): void {
  const md = buildMarkdown(state)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `singularity-forge-export-${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
