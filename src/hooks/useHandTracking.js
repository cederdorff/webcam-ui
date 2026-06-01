import { useEffect, useRef, useState } from "react";
import { READY_STATUS, clearCanvas, createHandLandmarker, drawHand, resizeCanvasToVideo } from "../handTracking";
import { getHandGesture } from "../gestures";

export function useHandTracking({ onGesture, onNoHand } = {}) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const animationRef = useRef(0);
  const callbacksRef = useRef({ onGesture, onNoHand });
  const lastVideoTimeRef = useRef(-1);

  const [isRunning, setIsRunning] = useState(false);
  const [tracking, setTracking] = useState(READY_STATUS);

  function stopCamera() {
    cancelAnimationFrame(animationRef.current);

    animationRef.current = 0;
    lastVideoTimeRef.current = -1;

    clearCanvas(canvasRef.current);
    setIsRunning(false);
    callbacksRef.current.onNoHand?.();
    setTracking(READY_STATUS);
  }

  function runFrameLoop() {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (!video || !canvas || !handLandmarker) {
      return;
    }

    resizeCanvasToVideo(canvas, video);

    if (hasNewVideoFrame(video, lastVideoTimeRef.current)) {
      lastVideoTimeRef.current = video.currentTime;
      const results = handLandmarker.detectForVideo(video, performance.now());
      const landmarks = results.landmarks?.[0];

      if (landmarks) {
        drawHand(canvas, landmarks);
        const gesture = getHandGesture(landmarks);

        callbacksRef.current.onGesture?.(gesture);
        setTracking(createTrackingStatus(results, gesture));
      } else {
        clearCanvas(canvas);
        callbacksRef.current.onNoHand?.();
        setTracking(createSearchingStatus());
      }
    }

    animationRef.current = requestAnimationFrame(runFrameLoop);
  }

  async function startCamera() {
    if (isRunning || tracking.mode === "loading") {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setTracking(createErrorStatus("Camera unavailable"));
      return;
    }

    setTracking({
      ...READY_STATUS,
      mode: "loading",
      label: "Loading model"
    });

    try {
      if (!handLandmarkerRef.current) {
        handLandmarkerRef.current = await createHandLandmarker();
      }

      setIsRunning(true);
      setTracking(createSearchingStatus());
    } catch (error) {
      console.error(error);
      stopCamera();
      setTracking(createErrorStatus(getCameraErrorLabel(error)));
    }
  }

  function handleCameraReady() {
    cancelAnimationFrame(animationRef.current);
    runFrameLoop();
  }

  function handleCameraError(error) {
    console.error(error);
    stopCamera();
    setTracking(createErrorStatus(getCameraErrorLabel(error)));
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      handLandmarkerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    callbacksRef.current = { onGesture, onNoHand };
  }, [onGesture, onNoHand]);

  return {
    canvasRef,
    handleCameraError,
    handleCameraReady,
    isLoading: tracking.mode === "loading",
    isRunning,
    startCamera,
    stopCamera,
    tracking,
    webcamRef
  };
}

function hasNewVideoFrame(video, lastVideoTime) {
  return (
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    video.videoWidth > 0 &&
    video.currentTime !== lastVideoTime
  );
}

function createSearchingStatus() {
  return {
    ...READY_STATUS,
    mode: "searching",
    label: "Looking for hand"
  };
}

function createTrackingStatus(results, gesture) {
  const hand = results.handednesses?.[0]?.[0];

  return {
    mode: "tracking",
    label: gesture.isPinching ? "Pinch active" : gesture.name,
    hand: hand?.categoryName ?? "Hand",
    confidence: hand?.score ?? gesture.grip,
    gesture: gesture.name,
    pinching: gesture.isPinching
  };
}

function createErrorStatus(label) {
  return {
    ...READY_STATUS,
    mode: "error",
    label
  };
}

function getCameraErrorLabel(error) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera blocked";
  }

  return "Tracking failed";
}
