import { FINGERTIP_LANDMARKS, HAND_CONNECTIONS } from './handLandmarks'

export function ensureCanvasMatchesVideo(canvas, video) {
  const width = video.videoWidth || 1280
  const height = video.videoHeight || 720

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  return { width, height }
}

export function clearCanvas(canvas) {
  const context = canvas?.getContext('2d')

  if (canvas && context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }
}

export function drawHand(context, landmarks, width, height) {
  context.clearRect(0, 0, width, height)
  context.save()

  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = 'rgba(41, 210, 178, 0.92)'
  context.lineWidth = Math.max(4, width * 0.004)

  HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
    const start = landmarks[startIndex]
    const end = landmarks[endIndex]

    context.beginPath()
    context.moveTo(start.x * width, start.y * height)
    context.lineTo(end.x * width, end.y * height)
    context.stroke()
  })

  landmarks.forEach((point, index) => {
    drawLandmarkDot(context, point, index, width, height)
  })

  context.restore()
}

function drawLandmarkDot(context, point, index, width, height) {
  const isThumbTip = index === 4
  const isIndexTip = index === 8
  const radius = isThumbTip || isIndexTip ? width * 0.011 : width * 0.007

  context.beginPath()
  context.arc(point.x * width, point.y * height, radius, 0, Math.PI * 2)
  context.fillStyle = getLandmarkColor(index)
  context.fill()
}

function getLandmarkColor(index) {
  if (index === 8) {
    return '#ffb84d'
  }

  if (index === 4) {
    return '#ff6f61'
  }

  if (FINGERTIP_LANDMARKS.has(index)) {
    return '#f8f4ea'
  }

  return 'rgba(248, 244, 234, 0.72)'
}
