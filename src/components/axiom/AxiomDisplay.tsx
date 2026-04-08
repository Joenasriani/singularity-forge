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
        animation: 'axiom-appear 0.5s ease both',
      }}
    >
      <span style={{
        color: 'var(--teal-bright)',
        fontWeight: 'bold',
        fontSize: '9px',
        letterSpacing: '2px',
        display: 'inline-block',
        marginRight: '6px',
        opacity: 0.8,
      }}>
        AXIOM
      </span>
      <span style={{
        color: 'var(--teal)',
        fontStyle: 'italic',
        fontSize: '11px',
        lineHeight: '1.5',
        textShadow: '0 0 8px rgba(0,245,212,0.3)',
      }}>
        {message}
      </span>
    </div>
  )
}
