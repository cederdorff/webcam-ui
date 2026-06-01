import Webcam from "react-webcam";
import { VIDEO_CONSTRAINTS } from "../handTracking";

export function TrackingStage({
  canvasRef,
  children,
  onCameraError,
  onCameraReady,
  isLoading,
  isRunning,
  onStartCamera,
  webcamRef
}) {
  return (
    <div className="stage" data-running={isRunning ? "true" : "false"}>
      {isRunning && (
        <Webcam
          ref={webcamRef}
          audio={false}
          className="webcam-feed"
          onUserMedia={onCameraReady}
          onUserMediaError={onCameraError}
          playsInline
          videoConstraints={VIDEO_CONSTRAINTS}
        />
      )}
      <canvas ref={canvasRef} className="landmark-layer" aria-hidden="true" />
      {children}

      {!isRunning && (
        <div className="start-overlay">
          <button type="button" onClick={onStartCamera} disabled={isLoading}>
            {isLoading ? "Loading..." : "Start camera"}
          </button>
        </div>
      )}
    </div>
  );
}
