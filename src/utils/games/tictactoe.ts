// 井字棋（圈圈叉叉）引擎
// board: 长度 9，0=空，1=O（先手），2=X

export interface TttState {
  board: number[];
  turn: 1 | 2;
  winner: 0 | 1 | 2; // 0=未分胜负
  draw: boolean;
  winLine: number[] | null;
}

export const TTT_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function createTttState(): TttState {
  return { board: Array(9).fill(0), turn: 1, winner: 0, draw: false, winLine: null };
}

export function tttPlay(state: TttState, index: number): TttState {
  if (state.winner !== 0 || state.draw) return state;
  if (index < 0 || index > 8 || state.board[index] !== 0) return state;

  const board = state.board.slice();
  board[index] = state.turn;

  let winner: 0 | 1 | 2 = 0;
  let winLine: number[] | null = null;
  for (const line of TTT_LINES) {
    const [a, b, c] = line;
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      winner = board[a] as 1 | 2;
      winLine = line;
      break;
    }
  }
  const draw = winner === 0 && board.every((v) => v !== 0);

  console.log('[TicTacToe] play', { index, player: state.turn, winner, draw });
  return {
    board,
    turn: state.turn === 1 ? 2 : 1,
    winner,
    draw,
    winLine
  };
}
