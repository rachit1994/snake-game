"use client"
import { useEffect, useReducer, useRef } from "react";
import { GameController, GameState, initState } from "@/controllers/GameController";
import { MAX_GAME_SPEED, MIN_GAME_SPEED } from "@/constants/game";
import useInterval from '@use-it/interval'

const reducer = (
  state: GameState,
  action: { type: 'UPDATE'; payload: Partial<GameState> }
) => {
  if (action?.type === "UPDATE") {
    return { ...state, ...action?.payload };
  }
  return state;
};

const useSnakeGame = () => {
  const [state, dispatch] = useReducer(reducer, initState);
  const controllerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef?.current) {
      controllerRef.current = new GameController(
        canvasRef?.current,
        dispatch
      );
    }

    //  set high score
    const highScore = localStorage.getItem("highscore")
    ? parseInt(localStorage.getItem("highscore")!)
    : 0;

    dispatch({
      type: 'UPDATE',
      payload: {
        highScore
      }
    });
  }, []);

  useEffect(() => {
    controllerRef.current.updateState({...state});
  }, [state]);

  useEffect(() => {
    controllerRef.current.onSnakeChange();
  }, [state.snake]);

  // Game Update Interval
  useInterval(
    () => {
      if (!state.isLost) {
        controllerRef.current?.updateSnake()
      }
    },
    state.running && state.countDown === 0 ? state.gameDelay : null
  );

  // Countdown Interval
  useInterval(
    () => {
      dispatch({
        type: 'UPDATE',
        payload: {
          countDown: state.countDown - 1
        }
      })
    },
    state.countDown > 0 && state.countDown < 4 ? 800 : null
  )

  useEffect(() => {
    if (state.score > MIN_GAME_SPEED && state.score <= MAX_GAME_SPEED) {
      dispatch({
        type: 'UPDATE',
        payload: {
          gameDelay: 1000 / state.score
        }
      });
    }
  }, [state.score]);

  useEffect(() => {
    document.addEventListener('keydown', controllerRef.current?.onKeyDown);
    return () => {
      document.removeEventListener('keydown', controllerRef.current?.onKeyDown);
    }
  }, [state.previousVelocity]);

  return { state, canvasRef, startGame: controllerRef.current?.startGame };
};

export default useSnakeGame;
