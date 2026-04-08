interface AxiomDisplayProps {
  message: string | null
  messageId?: string
}

export default function AxiomDisplay({ message, messageId }: AxiomDisplayProps) {
  if (!message) return null

  return (
    <div
      key={messageId}
      style={{
        borderLeft: '2px solid var(--teal)',
        paddingLeft: '10px',
        marginTop: '8px',
        animation: 'axiom-appear 0.4s ease both',
      }}
    >
      <span style={{
        color: 'var(--teal-bright)',
        fontWeight: 'bold',
        fontSize: '9px',
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
        fontSize: '12px',
        lineHeight: '1.55',
        textShadow: '0 0 10px rgba(0,245,212,0.35)',
      }}>
        {message}
      </span>
    </div>
  )
}
