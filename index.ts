let boxSize: number;
let c: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
function drawGridLine(x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1 * boxSize, y1 * boxSize);
  ctx.lineTo(x2 * boxSize, y2 * boxSize);
  ctx.stroke();
}

type Player = "X" | "O";
type Cell = Player | null;
type Coord = [number, number];
let board: Cell[][] = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

function drawMove(player: Player, x: number, y: number) {
  ctx.font = `${boxSize}px Arial`;
  ctx.fillText(player, (x + 0.15) * boxSize, (y + 0.85) * boxSize);
}

function checkWinner(): Player | null {
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      let ijPlayer: Player | null = board[i][j];
      if (ijPlayer == null) {
        continue;
      }
      let adjs: Coord[] = [
        [i, j - 1],
        [i - 1, j],
        [i + 1, j],
        [i, j + 1],
      ];
      for (let [x, y] of adjs) {
        if (x >= 0 && x < 3 && y >= 0 && y < 3 && board[x][y] == ijPlayer) {
          return otherPlayer(ijPlayer);
        }
      }
    }
  }
  return null;
}

function showWinner(p: Player) {
  document.getElementById("info")!.innerHTML = `${p} wins!`;
}

function showComputerWinner(p: Winner) {
  document.getElementById(
    "info"
  )!.innerHTML = `Computer calculated game result: ${p}`;
}

type Winner = Player | "tie";

interface MoveOutcome {
  x: number;
  y: number;
  winner: Winner;
}

function otherPlayer(p: Player): Player {
  if (p == "O") {
    return "X";
  } else {
    return "O";
  }
}
function lessWinner(w1: Winner, w2: Winner, current: Player) {
  if (w1 == current) {
    return false;
  } else if (w2 == current) {
    return true;
  } else if (w1 == "tie") {
    return false;
  } else if (w2 == "tie") {
    return true;
  } else {
    return false;
  }
}

function nextMove(current: Player): MoveOutcome | null {
  let bestOutcome: MoveOutcome | null = null;
  for (let x = 0; x < 3; ++x) {
    for (let y = 0; y < 3; ++y) {
      if (board[x][y] == null) {
        board[x][y] = current;
        if (checkWinner() != null) {
          if (bestOutcome == null) {
            bestOutcome = { x, y, winner: otherPlayer(current) };
          }
        } else {
          let nextOutcome = nextMove(otherPlayer(current));
          let winner = nextOutcome == null ? "tie" : nextOutcome.winner;
          if (bestOutcome == null) {
            bestOutcome = { x, y, winner };
          } else if (lessWinner(bestOutcome.winner, winner, current)) {
            bestOutcome = { x, y, winner };
          }
        }
        board[x][y] = null;
      }
    }
  }
  return bestOutcome;
}

function paintCanvas() {
  let dpi = 5;
  c = document.getElementById("maze-canvas") as HTMLCanvasElement;
  c.width *= dpi;
  c.height *= dpi;
  ctx = c.getContext("2d")!;

  ctx.scale(dpi, dpi);

  boxSize = c.width / 3;
  c.height = boxSize * 3;
  drawGridLine(0, 1, 3, 1);
  drawGridLine(0, 2, 3, 2);
  drawGridLine(1, 0, 1, 3);
  drawGridLine(2, 0, 2, 3);
  let computerMove = nextMove("O")!;
  showComputerWinner(computerMove.winner);
  drawMove("O", computerMove.x, computerMove.y);
  board[computerMove.x][computerMove.y] = "O";

  let gameOver = false;
  c.addEventListener("click", (e) => {
    if (gameOver) {
      return;
    }
    let r = c.getBoundingClientRect();
    let x = Math.floor(((e.clientX - r.left) / r.width) * 3);
    let y = Math.floor(((e.clientY - r.top) / r.width) * 3);
    if (x >= 0 && x <= 2 && y >= 0 && y <= 2 && board[x][y] == null) {
      drawMove("X", x, y);
      board[x][y] = "X";
      let winner = checkWinner();
      if (winner != null) {
        showWinner(winner);
        gameOver = true;
        return;
      }
      let computerMove = nextMove("O");
      if (computerMove != null) {
        drawMove("O", computerMove.x, computerMove.y);
        board[computerMove.x][computerMove.y] = "O";
        let winner = checkWinner();
        if (winner != null) {
          showWinner(winner);
          gameOver = true;
          return;
        } else {
          showComputerWinner(computerMove.winner);
        }
      }
    }
  });
}

window.onload = paintCanvas;
