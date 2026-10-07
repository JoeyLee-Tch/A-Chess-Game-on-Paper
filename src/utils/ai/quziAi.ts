// 区字棋电脑：negamax + alpha-beta 搜索
// 棋盘只有 5 个点、双方各 2 子，局面极少（红选 2 点 × 蓝选 2 点 = 30 种），
// 但可以无限循环走子，故沿对弈路径检测重复局面（按和棋处理），并设深度上限。
import { QuziState, QUZI_ADJ, quziHasMove } from '@/utils/games/quzi';

interface Move {
  from: number;
  to: number;
}

const MAX_DEPTH = 40;
const WIN = 100000;

function legalMoves(board: number[], player: 1 | 2): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < 5; i++) {
    if (board[i] !== player) continue;
    for (const j of QUZI_ADJ[i]) {
      if (board[j] === 0) moves.push({ from: i, to: j });
    }
  }
  return moves;
}

function applyMove(board: number[], m: Move, player: 1 | 2): number[] {
  const next = board.slice();
  next[m.from] = 0;
  next[m.to] = player;
  return next;
}

const positionKey = (board: number[], player: 1 | 2): string => `${board.join('')}-${player}`;

// 叶子局面启发式（当前行动方视角）：机动性 + 中心点
function heuristic(board: number[], player: 1 | 2): number {
  const opponent: 1 | 2 = player === 1 ? 2 : 1;
  const score =
    (legalMoves(board, player).length - legalMoves(board, opponent).length) * 3 +
    (board[4] === player ? 2 : 0) -
    (board[4] === opponent ? 2 : 0);
  return score;
}

function negamax(
  board: number[],
  player: 1 | 2,
  depth: number,
  path: Set<string>,
  alpha: number,
  beta: number
): number {
  const moves = legalMoves(board, player);
  if (moves.length === 0) return -WIN; // 被憋死，当前方负
  if (depth === 0) return heuristic(board, player);

  const key = positionKey(board, player);
  if (path.has(key)) return 0; // 重复走子按和棋处理
  path.add(key);

  const opponent: 1 | 2 = player === 1 ? 2 : 1;
  let best = -Infinity;
  for (const m of moves) {
    const score = -negamax(applyMove(board, m, player), opponent, depth - 1, path, -beta, -alpha);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  path.delete(key);
  return best;
}

// 选出最佳走法；fixedFrom 不为空时只评估该棋子的落点（对应“已选中棋子”的状态）
function bestMove(board: number[], player: 1 | 2, fixedFrom: number | null): Move | null {
  const moves = legalMoves(board, player).filter((m) => fixedFrom === null || m.from === fixedFrom);
  if (moves.length === 0) return null;

  const opponent: 1 | 2 = player === 1 ? 2 : 1;
  const path = new Set<string>([positionKey(board, player)]);
  let best = moves[0];
  let bestScore = -Infinity;
  for (const m of moves) {
    const next = applyMove(board, m, player);
    if (!quziHasMove(next, opponent)) return m; // 一步憋死对手，直接走
    const score = -negamax(next, opponent, MAX_DEPTH, path, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

// 返回电脑这一次点击的点号：未选子时返回棋子点，已选子时返回落点
export function quziAiTap(state: QuziState): number {
  const move = bestMove(state.board, state.turn, state.selected);
  if (!move) return state.selected ?? 0;
  return state.selected !== null ? move.to : move.from;
}
