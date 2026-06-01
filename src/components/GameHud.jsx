export function GameHud({ message, onResetGame, score }) {
  return (
    <aside className="game-hud" aria-label="Game status">
      <div>
        <span>Score</span>
        <strong>{score}</strong>
      </div>

      <p>{message}</p>

      <button type="button" onClick={onResetGame}>
        Reset game
      </button>
    </aside>
  );
}
