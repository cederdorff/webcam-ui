import { clamp } from '../utils/numbers'

export function movePuckWithHand(landmarks, puck) {
  const indexTip = landmarks[8]
  const thumbTip = landmarks[4]
  const wrist = landmarks[0]
  const middleFingerBase = landmarks[9]

  const target = getIndexFingerTarget(indexTip)
  const current = getCurrentPuckPosition(puck)
  const next = movePartWayTowardTarget(current, target)
  const grip = getGripAmount(indexTip, thumbTip)
  const rotation = getHandRotation(wrist, middleFingerBase)

  puck.dataset.x = String(next.x)
  puck.dataset.y = String(next.y)
  puck.style.setProperty('--x', `${next.x * 100}%`)
  puck.style.setProperty('--y', `${next.y * 100}%`)
  puck.style.setProperty('--scale', String(0.96 + grip * 0.42))
  puck.style.setProperty('--rotate', `${rotation}deg`)
  puck.toggleAttribute('data-gripped', grip > 0.6)
  puck.removeAttribute('data-searching')

  return {
    grip,
    pinching: grip > 0.6,
  }
}

function getIndexFingerTarget(indexTip) {
  return {
    // The webcam is mirrored, so x is flipped.
    x: 1 - clamp(indexTip.x, 0.03, 0.97),
    y: clamp(indexTip.y, 0.06, 0.94),
  }
}

function getCurrentPuckPosition(puck) {
  const x = Number(puck.dataset.x)
  const y = Number(puck.dataset.y)

  return {
    x: Number.isFinite(x) ? x : 0.5,
    y: Number.isFinite(y) ? y : 0.5,
  }
}

function movePartWayTowardTarget(current, target) {
  return {
    x: current.x + (target.x - current.x) * 0.26,
    y: current.y + (target.y - current.y) * 0.26,
  }
}

function getGripAmount(indexTip, thumbTip) {
  const pinchDistance = Math.hypot(
    indexTip.x - thumbTip.x,
    indexTip.y - thumbTip.y,
  )

  return clamp(1 - (pinchDistance - 0.035) / 0.11, 0, 1)
}

function getHandRotation(wrist, middleFingerBase) {
  return clamp((middleFingerBase.x - wrist.x) * -115, -34, 34)
}
