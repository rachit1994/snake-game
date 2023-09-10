"use client";
import useSnakeGame from "@/hooks/useSnakeGame";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/game";
import {
  StarIcon,
  TrophyIcon,
  UpArrow,
  RightArrow,
  DownArrow,
  LeftArrow,
} from "@/assets";

export default function Home() {
  const { state, canvasRef, startGame } = useSnakeGame();

  return (
    <main>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH + 1}
        height={CANVAS_HEIGHT + 1}
      />
      <section>
        <div className="score">
          <p>
            <StarIcon />
            Score: {state.score}
          </p>
          <p>
            <TrophyIcon />
            Highscore:{" "}
            {state.highScore > state.score ? state.highScore : state.score}
          </p>
        </div>
        {!state.isLost && state.countDown > 0 ? (
          <button onClick={startGame}>
            {state.countDown === 4 ? "Start Game" : state.countDown}
          </button>
        ) : (
          <div className="controls">
            <p>How to Play?</p>
            <p>
              <UpArrow />
              <RightArrow />
              <DownArrow />
              <LeftArrow />
            </p>
          </div>
        )}
      </section>
      {state.isLost && (
        <div className="game-overlay">
          <p className="large">Game Over</p>
          <p className="final-score">
            {state.newHighScore
              ? `🎉 New Highscore 🎉`
              : `You scored: ${state.score}`}
          </p>
          {!state.running && state.isLost && (
            <button onClick={startGame}>
              {state.countDown === 4 ? "Restart Game" : state.countDown}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
