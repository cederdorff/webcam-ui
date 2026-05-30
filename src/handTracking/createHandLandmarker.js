import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { HAND_MODEL_PATH, VISION_WASM_PATH } from './config'

export async function createHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(VISION_WASM_PATH)

  try {
    return await createLandmarkerWithDelegate(vision, 'GPU')
  } catch (error) {
    console.warn('GPU hand tracking unavailable, falling back to CPU.', error)
    return createLandmarkerWithDelegate(vision, 'CPU')
  }
}

function createLandmarkerWithDelegate(vision, delegate) {
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: HAND_MODEL_PATH,
      delegate,
    },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.5,
  })
}
