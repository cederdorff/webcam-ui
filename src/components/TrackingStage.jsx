export function TrackingStage({
  canvasRef,
  isLoading,
  isRunning,
  onStartCamera,
  puckRef,
  videoRef,
}) {
  return (
    <div className="stage" data-running={isRunning ? 'true' : 'false'}>
      <video
        ref={videoRef}
        className="webcam-feed"
        muted
        playsInline
        aria-label="Webcam feed"
      />
      <canvas ref={canvasRef} className="landmark-layer" aria-hidden="true" />
      <div ref={puckRef} className="control-object" role="img" aria-label="Puck">
        <span></span>
      </div>

      {!isRunning && (
        <div className="start-overlay">
          <button type="button" onClick={onStartCamera} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Start camera'}
          </button>
        </div>
      )}
    </div>
  )
}
