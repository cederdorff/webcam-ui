import { useCallback, useEffect, useRef, useState } from 'react'
import { CAMERA_SETTINGS, READY_STATUS } from '../handTracking/config'
import { createHandLandmarker } from '../handTracking/createHandLandmarker'
import {
  clearCanvas,
  drawHand,
  ensureCanvasMatchesVideo,
} from '../handTracking/drawHand'
import { movePuckWithHand } from '../handTracking/movePuck'

export function useHandTracking() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const puckRef = useRef(null)

  const streamRef = useRef(null)
  const handLandmarkerRef = useRef(null)
  const animationRef = useRef(0)
  const runIdRef = useRef(0)
  const isStartingRef = useRef(false)

  const lastVideoTimeRef = useRef(-1)
  const latestResultsRef = useRef(null)
  const latestStatusRef = useRef(READY_STATUS)
  const lastStatusUpdateRef = useRef(0)

  const [isRunning, setIsRunning] = useState(false)
  const [tracking, setTracking] = useState(READY_STATUS)

  const updateTracking = useCallback((nextStatus, force = false) => {
    const now = performance.now()
    const previousStatus = latestStatusRef.current
    const importantChange =
      previousStatus.mode !== nextStatus.mode ||
      previousStatus.pinching !== nextStatus.pinching ||
      previousStatus.hand !== nextStatus.hand

    // The camera can update 60 times per second. This keeps React calm.
    if (force || importantChange || now - lastStatusUpdateRef.current > 180) {
      latestStatusRef.current = nextStatus
      lastStatusUpdateRef.current = now
      setTracking(nextStatus)
    }
  }, [])

  const getHandLandmarker = useCallback(async () => {
    if (!handLandmarkerRef.current) {
      handLandmarkerRef.current = await createHandLandmarker()
    }

    return handLandmarkerRef.current
  }, [])

  const resetCamera = useCallback(() => {
    runIdRef.current += 1
    isStartingRef.current = false

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    latestResultsRef.current = null
    lastVideoTimeRef.current = -1

    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
    }

    clearCanvas(canvasRef.current)
    showSearchingPuck(puckRef.current)
  }, [])

  const stopCamera = useCallback(() => {
    resetCamera()
    setIsRunning(false)
    updateTracking(READY_STATUS, true)
  }, [resetCamera, updateTracking])

  const detectNextFrame = useCallback(
    function detectNextFrame(handLandmarker, runId) {
      if (runIdRef.current !== runId) {
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const puck = puckRef.current

      if (!video || !canvas || !puck) {
        return
      }

      const context = canvas.getContext('2d')
      const { width, height } = ensureCanvasMatchesVideo(canvas, video)

      if (context && hasNewVideoFrame(video, lastVideoTimeRef.current)) {
        lastVideoTimeRef.current = video.currentTime
        latestResultsRef.current = handLandmarker.detectForVideo(
          video,
          performance.now(),
        )
      }

      const results = latestResultsRef.current
      const landmarks = results?.landmarks?.[0]

      if (context && landmarks) {
        drawHand(context, landmarks, width, height)
        const puckState = movePuckWithHand(landmarks, puck)

        updateTracking(createTrackingStatus(results, puckState))
      } else if (context) {
        context.clearRect(0, 0, width, height)
        showSearchingPuck(puck)
        updateTracking(createSearchingStatus())
      }

      animationRef.current = requestAnimationFrame(() =>
        detectNextFrame(handLandmarker, runId),
      )
    },
    [updateTracking],
  )

  const startCamera = useCallback(async () => {
    if (isRunning || isStartingRef.current) {
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      updateTracking(
        {
          ...READY_STATUS,
          mode: 'error',
          label: 'Camera unavailable',
        },
        true,
      )
      return
    }

    const runId = runIdRef.current + 1
    runIdRef.current = runId
    isStartingRef.current = true

    updateTracking(
      {
        ...READY_STATUS,
        mode: 'loading',
        label: 'Loading model',
      },
      true,
    )

    try {
      const [handLandmarker, stream] = await Promise.all([
        getHandLandmarker(),
        navigator.mediaDevices.getUserMedia(CAMERA_SETTINGS),
      ])

      if (runIdRef.current !== runId) {
        stopStream(stream)
        return
      }

      streamRef.current = stream
      await connectStreamToVideo(stream, videoRef.current)

      if (runIdRef.current !== runId) {
        stopStream(stream)
        return
      }

      isStartingRef.current = false
      setIsRunning(true)
      updateTracking(createSearchingStatus(), true)

      animationRef.current = requestAnimationFrame(() =>
        detectNextFrame(handLandmarker, runId),
      )
    } catch (error) {
      console.error(error)
      stopCamera()
      updateTracking(createErrorStatus(error), true)
    } finally {
      if (runIdRef.current === runId) {
        isStartingRef.current = false
      }
    }
  }, [
    detectNextFrame,
    getHandLandmarker,
    isRunning,
    stopCamera,
    updateTracking,
  ])

  useEffect(() => {
    showSearchingPuck(puckRef.current)

    return () => {
      resetCamera()
      handLandmarkerRef.current?.close()
      handLandmarkerRef.current = null
    }
  }, [resetCamera])

  return {
    canvasRef,
    isLoading: tracking.mode === 'loading',
    isRunning,
    puckRef,
    startCamera,
    stopCamera,
    tracking,
    videoRef,
  }
}

function hasNewVideoFrame(video, lastVideoTime) {
  return (
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    video.videoWidth > 0 &&
    video.currentTime !== lastVideoTime
  )
}

async function connectStreamToVideo(stream, video) {
  if (!video) {
    throw new Error('Video element is unavailable.')
  }

  video.srcObject = stream
  await video.play()
}

function stopStream(stream) {
  stream.getTracks().forEach((track) => track.stop())
}

function showSearchingPuck(puck) {
  if (!puck) {
    return
  }

  puck.setAttribute('data-searching', 'true')
  puck.removeAttribute('data-gripped')
}

function createSearchingStatus() {
  return {
    ...READY_STATUS,
    mode: 'searching',
    label: 'Looking for hand',
  }
}

function createTrackingStatus(results, puckState) {
  const handedness = results.handednesses?.[0]?.[0]

  return {
    mode: 'tracking',
    label: puckState.pinching ? 'Pinch active' : 'Tracking',
    hand: handedness?.categoryName ?? 'Hand',
    confidence: handedness?.score ?? puckState.grip,
    pinching: puckState.pinching,
  }
}

function createErrorStatus(error) {
  return {
    ...READY_STATUS,
    mode: 'error',
    label:
      error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Camera blocked'
        : 'Tracking failed',
  }
}
