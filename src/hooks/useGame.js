import { useRef, useState } from "react";
import { createTarget, isPuckTouchingTarget } from "../game";

export function useGame() {
  const [game, setGameState] = useState(() => createGameState());
  const gameRef = useRef(game);
  const wasPinchingRef = useRef(false);

  function setGame(nextGame) {
    gameRef.current = nextGame;
    setGameState(nextGame);
  }

  function resetGame() {
    wasPinchingRef.current = false;
    setGame(createGameState("Move your index finger onto the target."));
  }

  function handleNoHand() {
    wasPinchingRef.current = false;
    updateGameStatus("Show one hand to start tracking.", false);
  }

  function handleGesture(gesture) {
    const currentGame = gameRef.current;
    const isTouchingTarget = isPuckTouchingTarget(gesture.pointerPosition, currentGame.target);
    const didPinchStart = gesture.isPinching && !wasPinchingRef.current;

    wasPinchingRef.current = gesture.isPinching;

    if (isTouchingTarget && didPinchStart) {
      setGame({
        ...currentGame,
        isReadyToCatch: false,
        message: "Caught! Find the next target.",
        score: currentGame.score + 1,
        target: createTarget()
      });
      return;
    }

    if (isTouchingTarget) {
      updateGameStatus("Pinch now to catch it.", true);
      return;
    }

    if (gesture.isPinching) {
      updateGameStatus("Move onto the target before pinching.", false);
      return;
    }

    updateGameStatus("Move your index finger onto the target.", false);
  }

  function updateGameStatus(message, isReadyToCatch) {
    const currentGame = gameRef.current;

    if (currentGame.message === message && currentGame.isReadyToCatch === isReadyToCatch) {
      return;
    }

    setGame({
      ...currentGame,
      isReadyToCatch,
      message
    });
  }

  return {
    handleGesture,
    handleNoHand,
    isReadyToCatch: game.isReadyToCatch,
    message: game.message,
    resetGame,
    score: game.score,
    target: game.target
  };
}

function createGameState(message = "Start the camera to play.") {
  return {
    isReadyToCatch: false,
    message,
    score: 0,
    target: createTarget()
  };
}
