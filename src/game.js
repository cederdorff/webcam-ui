const TARGET_MARGIN = 0.14;
const CATCH_DISTANCE = 0.12;

export function createTarget() {
  return {
    id: Math.random().toString(36).slice(2),
    x: getRandomPosition(),
    y: getRandomPosition()
  };
}

export function isPuckTouchingTarget(puckPosition, target) {
  if (!puckPosition || !target) {
    return false;
  }

  const distance = Math.hypot(puckPosition.x - target.x, puckPosition.y - target.y);

  return distance < CATCH_DISTANCE;
}

function getRandomPosition() {
  return TARGET_MARGIN + Math.random() * (1 - TARGET_MARGIN * 2);
}
