// 井字棋电脑：完整 minimax，电脑执 X（后手），不可战胜
import { TttState, TTT_LINES } from '@/utils/games/tictactoe';

const AI: 1 | 2 = 2;

function winnerOf(board: number[]): 0 | 1 | 2 {
  for (const [a, b, c] of TTT_LINES) {
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as 1 | 2;
    }
  }
  return 0;
}

// 分数恒以电脑视角：电脑赢 +，玩家赢 -，平局 0；depth 让电脑速胜、缓败
function minimax(board: number[], turn: 1 | 2, depth: number): number {
  const winner = winnerOf(board);
  if (winner === AI) return 10 - depth;
  if (winner !== 0) return depth - 10;
  if (board.every((v) => v !== 0)) return 0;

  const next: 1 | 2 = turn === 1 ? 2 : 1;
  let best = turn === AI ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] !== 0) continue;
    board[i] = turn;
    const score = minimax(board, next, depth + 1);
    board[i] = 0;
    best = turn === AI ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

// 返回电脑要落子的格号
export function tttAiTap(state: TttState): number {
  const board = state.board.slice();
  let bestIndex = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] !== 0) continue;
    board[i] = AI;
    const score = minimax(board, 1, 1);
    board[i] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
}
