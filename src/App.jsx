import { ControlPanel } from './components/ControlPanel'
import { StatusPill } from './components/StatusPill'
import { TrackingStage } from './components/TrackingStage'
import { useHandTracking } from './hooks/useHandTracking'
import './App.css'

function App() {
  const {
    canvasRef,
    isLoading,
    isRunning,
    puckRef,
    startCamera,
    stopCamera,
    tracking,
    videoRef,
  } = useHandTracking()

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Webcam control</p>
          <h1>Hand Puck</h1>
        </div>
        <StatusPill mode={tracking.mode} label={tracking.label} />
      </header>

      <section className="workspace" aria-label="Hand controlled object">
        <TrackingStage
          canvasRef={canvasRef}
          isLoading={isLoading}
          isRunning={isRunning}
          onStartCamera={startCamera}
          puckRef={puckRef}
          videoRef={videoRef}
        />

        <ControlPanel
          isLoading={isLoading}
          isRunning={isRunning}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          tracking={tracking}
        />
      </section>
    </main>
  )
}

export default App
