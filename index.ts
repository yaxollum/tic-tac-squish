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

function checkWinner() {
  let winning: [Coord, Coord, Coord][] = [];
  for (let i = 0; i < 3; ++i) {
    winning.push([
      [i, 0],
      [i, 1],
      [i, 2],
    ]);
  }
  for (let j = 0; j < 3; ++j) {
    winning.push([
      [0, j],
      [1, j],
      [2, j],
    ]);
  }
  winning.push([
    [0, 0],
    [1, 1],
    [2, 2],
  ]);
  winning.push([
    [0, 2],
    [1, 1],
    [2, 0],
  ]);

  for (let w of winning) {
    if (
      w.every(([x, y]) => board[x][y] == "X") ||
      w.every(([x, y]) => board[x][y] == "O")
    ) {
      return w;
    }
  }
}

function drawWinner(x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = boxSize / 6;
  ctx.moveTo((x1 + 0.5) * boxSize, (y1 + 0.5) * boxSize);
  ctx.lineTo((x2 + 0.5) * boxSize, (y2 + 0.5) * boxSize);
  ctx.stroke();
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
        if (checkWinner() != undefined) {
          bestOutcome = { x, y, winner: current };
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
  let computerMove = { x: 1, y: 0 };
  drawMove("O", computerMove.x, computerMove.y);
  board[computerMove.x][computerMove.y] = "O";

  c.addEventListener("click", (e) => {
    let r = c.getBoundingClientRect();
    let x = Math.floor(((e.clientX - r.left) / r.width) * 3);
    let y = Math.floor(((e.clientY - r.top) / r.width) * 3);
    if (x >= 0 && x <= 2 && y >= 0 && y <= 2 && board[x][y] == null) {
      drawMove("X", x, y);
      board[x][y] = "X";
      let winner = checkWinner();
      if (winner != undefined) {
        drawWinner(...winner[0], ...winner[2]);
      }
      let computerMove = nextMove("O");
      if (computerMove != null) {
        drawMove("O", computerMove.x, computerMove.y);
        board[computerMove.x][computerMove.y] = "O";
        let winner = checkWinner();
        if (winner != undefined) {
          drawWinner(...winner[0], ...winner[2]);
        }
      }
    }
  });
}

window.onload = paintCanvas;
