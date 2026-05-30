export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function formatPercent(value) {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`
}
