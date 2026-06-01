export function Target({ isReadyToCatch, target }) {
  return (
    <div
      className="game-target"
      data-ready={isReadyToCatch ? "true" : "false"}
      style={{
        "--target-x": `${target.x * 100}%`,
        "--target-y": `${target.y * 100}%`
      }}
      role="img"
      aria-label="Catch target"
    >
      <span></span>
    </div>
  );
}
