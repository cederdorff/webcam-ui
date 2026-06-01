import { ControlPanel } from './components/ControlPanel'
import { GameHud } from './components/GameHud'
import { StatusPill } from './components/StatusPill'
import { Target } from './components/Target'
import { TrackingStage } from './components/TrackingStage'
import { useGame } from './hooks/useGame'
import { useHandTracking } from './hooks/useHandTracking'
import './App.css'

function App() {
  const game = useGame()
  const {
    canvasRef,
    handleCameraError,
    handleCameraReady,
    isLoading,
    isRunning,
    puckRef,
    startCamera,
    stopCamera,
    tracking,
    webcamRef,
  } = useHandTracking({
    onGesture: game.handleGesture,
    onNoHand: game.handleNoHand,
  })

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Webcam game</p>
          <h1>Hand Puck</h1>
        </div>
        <StatusPill mode={tracking.mode} label={tracking.label} />
      </header>

      <section className="workspace" aria-label="Hand controlled object">
        <TrackingStage
          canvasRef={canvasRef}
          onCameraError={handleCameraError}
          onCameraReady={handleCameraReady}
          isLoading={isLoading}
          isRunning={isRunning}
          onStartCamera={startCamera}
          puckRef={puckRef}
          webcamRef={webcamRef}
        >
          <Target isReadyToCatch={game.isReadyToCatch} target={game.target} />
        </TrackingStage>

        <div className="side-panel">
          <GameHud
            message={isRunning ? game.message : 'Start the camera to play.'}
            onResetGame={game.resetGame}
            score={game.score}
          />

          <ControlPanel
            isLoading={isLoading}
            isRunning={isRunning}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
            tracking={tracking}
          />
        </div>
      </section>
    </main>
  )
}

export default App
