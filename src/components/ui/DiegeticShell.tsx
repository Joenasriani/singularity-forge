import StatusPanel from './StatusPanel'
import SignalPanel from './SignalPanel'
import CompassPanel from './CompassPanel'
import ChroniclePanel from './ChroniclePanel'

export default function DiegeticShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Scene content */}
      {children}

      {/* HUD overlay — panels in corners, pointer-events disabled on container */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}>
        {/* Top-left: Status */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', pointerEvents: 'auto' }}>
          <StatusPanel />
        </div>

        {/* Top-right: Signal */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', pointerEvents: 'auto' }}>
          <SignalPanel />
        </div>

        {/* Bottom-left: Compass */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', pointerEvents: 'auto' }}>
          <CompassPanel />
        </div>

        {/* Bottom-right: Chronicle */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', pointerEvents: 'auto' }}>
          <ChroniclePanel />
        </div>
      </div>
    </div>
  )
}
