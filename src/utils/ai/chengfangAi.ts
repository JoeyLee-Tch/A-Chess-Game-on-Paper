// 成方棋电脑（执蓝，后手）：alpha-beta 搜索。
// 一个完整回合 = 下子/走子（可能成“三”）+ 成三后吃对方一子，
// turnActions 把吃子分支并入行动方的决策，搜索时才好正确估值。
import {
  CfState,
  CF_ADJ,
  CF_MILLS,
  cfTap,
  cfCapturable,
  cfCountMills
} from '@/utils/games/chengfang';

const AI: 1 | 2 = 2;
const HUMAN: 1 | 2 = 1;
const SEARCH_DEPTH = 3;
const WIN = 100000;
const NODE_CAP = 80000;

interface TurnAction {
  taps: number[]; // 完成本回合所需的点击序列
  next: CfState; // 落到对方行动时的局面
}

function ownPieces(board: number[], player: 1 | 2): number[] {
  const res: number[] = [];
  board.forEach((v, i) => {
    if (v === player) res.push(i);
  });
  return res;
}

// 生成当前方一个完整回合的所有走法（成三吃子展开为多个分支）
function turnActions(state: CfState): TurnAction[] {
  const primaries: number[][] = [];
  if (state.hand[state.turn - 1] > 0) {
    state.board.forEach((v, i) => {
      if (v === 0) primaries.push([i]);
    });
  } else {
    for (const from of ownPieces(state.board, state.turn)) {
      for (const to of CF_ADJ[from]) {
        if (state.board[to] === 0) primaries.push([from, to]);
      }
    }
  }

  const actions: TurnAction[] = [];
  const millActions: TurnAction[] = [];
  const opponent: 1 | 2 = state.turn === 1 ? 2 : 1;
  for (const taps of primaries) {
    let s = cfTap(state, taps[0]);
    if (taps.length > 1) s = cfTap(s, taps[1]);
    if (s.mustCapture) {
      for (const captured of cfCapturable(s.board, opponent)) {
        const action = { taps: [...taps, captured], next: cfTap(s, captured) };
        millActions.push(action);
      }
    } else {
      actions.push({ taps, next: s });
    }
  }
  // 成三的走法排前面，提升剪枝效率
  return [...millActions, ...actions];
}

// “潜在成三”：一条线上已有己方 2 子、另一点为空
function potentialMills(board: number[], player: 1 | 2): number {
  return CF_MILLS.filter((m) => {
    const vals = m.map((i) => board[i]);
    return vals.filter((v) => v === player).length === 2 && vals.includes(0);
  }).length;
}

function mobility(state: CfState, player: 1 | 2): number {
  if (state.hand[player - 1] > 0) {
    return state.board.filter((v) => v === 0).length;
  }
  return ownPieces(state.board, player).reduce(
    (sum, i) => sum + CF_ADJ[i].filter((j) => state.board[j] === 0).length,
    0
  );
}

// 静态估值（电脑视角）
function evaluate(state: CfState): number {
  const board = state.board;
  const aiOn = ownPieces(board, AI).length;
  const humanOn = ownPieces(board, HUMAN).length;
  const aiTotal = aiOn + state.hand[1];
  const humanTotal = humanOn + state.hand[0];

  return (
    (aiTotal - humanTotal) * 60 + // 总子数（低于 3 即负，最重要）
    (aiOn - humanOn) * 20 +
    (cfCountMills(board, AI) - cfCountMills(board, HUMAN)) * 25 +
    (potentialMills(board, AI) - potentialMills(board, HUMAN)) * 14 +
    (mobility(state, AI) - mobility(state, HUMAN)) * 5
  );
}

function search(state: CfState, depth: number, alpha: number, beta: number, nodes: { n: number }): number {
  nodes.n += 1;
  if (state.winner !== 0) {
    const ply = SEARCH_DEPTH - depth;
    return state.winner === AI ? WIN - ply * 100 : -WIN + ply * 100;
  }
  if (depth === 0 || nodes.n > NODE_CAP) return evaluate(state);

  const maximizing = state.turn === AI;
  let successors: CfState[];
  if (state.mustCapture) {
    const opponent: 1 | 2 = state.turn === 1 ? 2 : 1;
    successors = cfCapturable(state.board, opponent).map((c) => cfTap(state, c));
  } else {
    successors = turnActions(state).map((a) => a.next);
  }

  if (maximizing) {
    let best = -Infinity;
    for (const s of successors) {
      best = Math.max(best, search(s, depth - 1, alpha, beta, nodes));
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const s of successors) {
    best = Math.min(best, search(s, depth - 1, alpha, beta, nodes));
    if (best < beta) beta = best;
    if (alpha >= beta) break;
  }
  return best;
}

// 成三吃子阶段：选最值得吃的子
function chooseCapture(state: CfState): number {
  const candidates = cfCapturable(state.board, HUMAN);
  let bestIndex = candidates[0];
  let bestScore = -Infinity;
  const nodes = { n: 0 };
  for (const c of candidates) {
    const score = search(cfTap(state, c), SEARCH_DEPTH - 1, -Infinity, Infinity, nodes);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = c;
    }
  }
  return bestIndex;
}

// 已选中棋子时：评估该棋子每个落点的完整结果（含成三后最优吃子）
function chooseTarget(state: CfState): number {
  const from = state.selected as number;
  const targets = CF_ADJ[from].filter((j) => state.board[j] === 0);
  if (targets.length === 0) return from;
  const nodes = { n: 0 };
  let bestIndex = targets[0];
  let bestScore = -Infinity;
  for (const to of targets) {
    let s = cfTap(cfTap(state, from), to);
    let score: number;
    if (s.mustCapture) {
      score = -Infinity;
      for (const c of cfCapturable(s.board, HUMAN)) {
        score = Math.max(score, search(cfTap(s, c), SEARCH_DEPTH - 2, -Infinity, Infinity, nodes));
      }
    } else {
      score = search(s, SEARCH_DEPTH - 1, -Infinity, Infinity, nodes);
    }
    if (score > bestScore) {
      bestScore = score;
      bestIndex = to;
    }
  }
  return bestIndex;
}

// 返回电脑当前应点击的点号
export function cfAiTap(state: CfState): number {
  if (state.mustCapture) return chooseCapture(state);
  if (state.selected !== null) return chooseTarget(state);

  const nodes = { n: 0 };
  const actions = turnActions(state);
  if (actions.length === 0) return 0;
  let best = actions[0];
  let bestScore = -Infinity;
  for (const action of actions) {
    const score = search(action.next, SEARCH_DEPTH - 1, -Infinity, Infinity, nodes);
    if (score > bestScore) {
      bestScore = score;
      best = action;
    }
  }
  return best.taps[0];
}
