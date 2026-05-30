import { DrawingUtils, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const VISION_WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'

const HAND_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

export const CAMERA_SETTINGS = {
  audio: false,
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
}

export const READY_STATUS = {
  mode: 'idle',
  label: 'Ready',
  hand: 'No hand',
  confidence: 0,
  pinching: false,
}

export async function createHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(VISION_WASM_PATH)

  try {
    return await createLandmarker(vision, 'GPU')
  } catch (error) {
    console.warn('GPU hand tracking unavailable, falling back to CPU.', error)
    return createLandmarker(vision, 'CPU')
  }
}

export function resizeCanvasToVideo(canvas, video) {
  const width = video.videoWidth || 1280
  const height = video.videoHeight || 720

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
}

export function clearCanvas(canvas) {
  const context = canvas?.getContext('2d')

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }
}

export function drawHand(canvas, landmarks) {
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  const drawing = new DrawingUtils(context)
  drawing.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
    color: 'rgba(41, 210, 178, 0.92)',
    lineWidth: 5,
  })
  drawing.drawLandmarks(landmarks, {
    fillColor: getLandmarkColor,
    lineWidth: 1,
    radius: ({ index }) => (index === 4 || index === 8 ? 9 : 6),
  })
}

export function movePuckWithHand(landmarks, puck) {
  const indexTip = landmarks[8]
  const thumbTip = landmarks[4]
  const wrist = landmarks[0]
  const middleFingerBase = landmarks[9]

  const targetX = 1 - DrawingUtils.clamp(indexTip.x, 0.03, 0.97)
  const targetY = DrawingUtils.clamp(indexTip.y, 0.06, 0.94)
  const currentX = Number(puck.dataset.x) || 0.5
  const currentY = Number(puck.dataset.y) || 0.5
  const nextX = currentX + (targetX - currentX) * 0.26
  const nextY = currentY + (targetY - currentY) * 0.26

  const pinchDistance = Math.hypot(
    indexTip.x - thumbTip.x,
    indexTip.y - thumbTip.y,
  )
  const grip = DrawingUtils.clamp(1 - (pinchDistance - 0.035) / 0.11, 0, 1)
  const rotation = DrawingUtils.clamp(
    (middleFingerBase.x - wrist.x) * -115,
    -34,
    34,
  )
  const pinching = grip > 0.6

  puck.dataset.x = String(nextX)
  puck.dataset.y = String(nextY)
  puck.style.setProperty('--x', `${nextX * 100}%`)
  puck.style.setProperty('--y', `${nextY * 100}%`)
  puck.style.setProperty('--scale', String(0.96 + grip * 0.42))
  puck.style.setProperty('--rotate', `${rotation}deg`)
  puck.toggleAttribute('data-gripped', pinching)
  puck.removeAttribute('data-searching')

  return { grip, pinching }
}

function createLandmarker(vision, delegate) {
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: HAND_MODEL_PATH,
      delegate,
    },
    runningMode: 'VIDEO',
    numHands: 1,
  })
}

function getLandmarkColor({ index }) {
  if (index === 8) {
    return '#ffb84d'
  }

  if (index === 4) {
    return '#ff6f61'
  }

  return '#f8f4ea'
}
