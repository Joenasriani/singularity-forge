interface AxiomDisplayProps {
  message: string | null
}

export default function AxiomDisplay({ message }: AxiomDisplayProps) {
  if (!message) return null

  return (
    <div style={{
      borderLeft: '2px solid var(--teal)',
      paddingLeft: '10px',
      marginTop: '8px',
    }}>
      <span style={{
        color: 'var(--teal-bright)',
        fontWeight: 'bold',
        fontSize: '10px',
        letterSpacing: '2px',
        animation: 'blink 1s step-end infinite',
        display: 'inline-block',
        marginRight: '6px',
      }}>
        AXIOM
      </span>
      <span style={{
        color: 'var(--teal)',
        fontStyle: 'italic',
        textShadow: 'var(--glow-teal)',
      }}>
        {message}
      </span>
    </div>
  )
}
