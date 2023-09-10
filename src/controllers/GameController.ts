import { CANVAS_GRID_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH, FILL_STYLE, MIN_GAME_SPEED, SNAKE_HEAD, STROKE_STYLE } from "@/constants/game";
import { Dispatch } from "react";

export interface GameState {
  gameDelay: number;
  countDown: number;
  running: boolean;
  isLost: boolean;
  highScore: number;
  newHighScore: boolean;
  score: number;
  snake: { head: { x: number; y: number }; trail: { x: number; y: number }[] };
  apple: { x: number; y: number };
  velocity: { dx: number; dy: number };
  previousVelocity: { dx: number; dy: number };
}

export const initState: GameState = {
  gameDelay: 1000 / MIN_GAME_SPEED,
  countDown: 4,
  running: false,
  isLost: false,
  highScore: 0,
  newHighScore: false,
  score: 0,
  snake: { head: SNAKE_HEAD, trail: [] },
  apple: { x: -1, y: -1 },
  velocity: { dx: 0, dy: 0 },
  previousVelocity: { dx: 0, dy: 0 },
};

export class GameController {
  private ctx: HTMLCanvasElement;
  private state: GameState;
  private dispatch: Dispatch<{
    type: "UPDATE";
    payload: Partial<GameState>;
  }>;

  constructor(
    ctx: HTMLCanvasElement,
    dispatch: Dispatch<{
      type: "UPDATE";
      payload: Partial<GameState>;
    }>
  ) {
    this.ctx = ctx;
    this.dispatch = dispatch;
    this.state = initState;
    this.startGame = this.startGame.bind(this);
    this.updateState = this.updateState.bind(this);
    this.generateApplePosition = this.generateApplePosition.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.drawSnake = this.drawSnake.bind(this);
    this.drawApple = this.drawApple.bind(this);
    this.updateSnake = this.updateSnake.bind(this);
    this.onSnakeChange = this.onSnakeChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  updateState(state: GameState) {
    this.state = state;
  }

  clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(-1, -1, CANVAS_WIDTH + 2, CANVAS_HEIGHT + 2);
  }

  generateApplePosition(): { x: number; y: number } {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / CANVAS_GRID_SIZE));
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / CANVAS_GRID_SIZE));
    // Check if random position interferes with snake head or trail
    if (
      (this.state.snake.head.x === x && this.state.snake.head.y === y) ||
      this.state.snake.trail.some((snakePart) => snakePart.x === x && snakePart.y === y)
    ) {
      return this.generateApplePosition()
    }
    return { x, y }
  }

  startGame() {
    this?.dispatch({
      type: 'UPDATE',
      payload: {
        gameDelay: 1000 / MIN_GAME_SPEED,
        isLost: false,
        score: 0,
        snake: { head: { x: 12, y: 9 }, trail: [] },
        apple: this.generateApplePosition(),
        velocity: { dx: 0, dy: -1 },
        running: true,
        newHighScore: false,
        countDown: 3,
      }
    })
  }

  gameOver() {
    let payload: Partial<GameState> = {
      isLost: true,
      running: false,
      velocity: { dx: 0, dy: 0 },
      countDown: 4
    };
    if (this.state.score > this.state.highScore) {
      payload = { ...payload, highScore: this.state.score, newHighScore: true }
      localStorage.setItem('highscore', this.state.score.toString());
    }
    this.dispatch({
      type: "UPDATE",
      payload
    });
  }

  fillRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.fillRect(x, y, w, h);
  }

  strokeRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.strokeRect(x + 0.5, y + 0.5, w, h);
  }

  drawSnake(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = FILL_STYLE;
    ctx.strokeStyle = STROKE_STYLE;

    this.fillRect(
      ctx,
      this.state.snake.head.x * CANVAS_GRID_SIZE,
      this.state.snake.head.y * CANVAS_GRID_SIZE,
      CANVAS_GRID_SIZE,
      CANVAS_GRID_SIZE
    );

    this.strokeRect(
      ctx,
      this.state.snake.head.x * CANVAS_GRID_SIZE,
      this.state.snake.head.y * CANVAS_GRID_SIZE,
      CANVAS_GRID_SIZE,
      CANVAS_GRID_SIZE
    );

    this.state.snake.trail.forEach((snakePart) => {
      this.fillRect(
        ctx,
        snakePart.x * CANVAS_GRID_SIZE,
        snakePart.y * CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE
      )

      this.strokeRect(
        ctx,
        snakePart.x * CANVAS_GRID_SIZE,
        snakePart.y * CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE
      )
    });
  }

  drawApple(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#DC3030' // '#38C172' // '#F4CA64'
    ctx.strokeStyle = '#881A1B' // '#187741' // '#8C6D1F

    if (
      this.state.apple &&
      typeof this.state.apple.x !== 'undefined' &&
      typeof this.state.apple.y !== 'undefined'
    ) {
      this.fillRect(
        ctx,
        this.state.apple.x * CANVAS_GRID_SIZE,
        this.state.apple.y * CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE
      )

      this.strokeRect(
        ctx,
        this.state.apple.x * CANVAS_GRID_SIZE,
        this.state.apple.y * CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE,
        CANVAS_GRID_SIZE
      )
    }
  }

  updateSnake() {
    // Check for collision with walls
    const nextHeadPosition = {
      x: this.state.snake.head.x + this.state.velocity.dx,
      y: this.state.snake.head.y + this.state.velocity.dy,
    }
    if (
      nextHeadPosition.x < 0 ||
      nextHeadPosition.y < 0 ||
      nextHeadPosition.x >= CANVAS_WIDTH / CANVAS_GRID_SIZE ||
      nextHeadPosition.y >= CANVAS_HEIGHT / CANVAS_GRID_SIZE
    ) {
      this.gameOver()
    }

    // Check for collision with apple
    if (nextHeadPosition.x === this.state.apple.x && nextHeadPosition.y === this.state.apple.y) {
      this.dispatch({
        type: 'UPDATE',
        payload: {
          score: this.state.score + 1,
          apple: this.generateApplePosition()
        }
      })
    }

    const updatedSnakeTrail = [...this.state.snake.trail, { ...this.state.snake.head }]
    // Remove trail history beyond snake trail length (score + 2)
    while (updatedSnakeTrail.length > this.state.score + 2) updatedSnakeTrail.shift()
    // Check for snake colliding with itsself
    if (
      updatedSnakeTrail.some(
        (snakePart) =>
          snakePart.x === nextHeadPosition.x &&
          snakePart.y === nextHeadPosition.y
      )
    )
      this.gameOver()

    // Update state

    this.dispatch({
      type: 'UPDATE',
      payload: {
        previousVelocity: {...this.state.velocity},
        snake: {
          head: {...nextHeadPosition},
          trail: [...updatedSnakeTrail]
        }
      }
    });
  }

  onSnakeChange() {
    const canvas = this.ctx;
    const ctx = canvas?.getContext('2d');

    if (ctx && !this.state.isLost) {
      this.clearCanvas(ctx);
      this.drawApple(ctx);
      this.drawSnake(ctx);
    }
  }

  onKeyDown(e: KeyboardEvent) {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'w',
        'a',
        's',
        'd',
      ].includes(e.key)
    ) {
      let velocity = { dx: 0, dy: 0 }

      switch (e.key) {
        case 'ArrowRight':
          velocity = { dx: 1, dy: 0 }
          break
        case 'ArrowLeft':
          velocity = { dx: -1, dy: 0 }
          break
        case 'ArrowDown':
          velocity = { dx: 0, dy: 1 }
          break
        case 'ArrowUp':
          velocity = { dx: 0, dy: -1 }
          break
        case 'd':
          velocity = { dx: 1, dy: 0 }
          break
        case 'a':
          velocity = { dx: -1, dy: 0 }
          break
        case 's':
          velocity = { dx: 0, dy: 1 }
          break
        case 'w':
          velocity = { dx: 0, dy: -1 }
          break
        default:
          console.error('Error with handleKeyDown')
      }
      if (
        !(
          this.state.previousVelocity.dx + velocity.dx === 0 &&
          this.state.previousVelocity.dy + velocity.dy === 0
        )
      ) {
        this.dispatch({
          type: 'UPDATE',
          payload: {
            velocity
          }
        });
      }
    }
  }

}
