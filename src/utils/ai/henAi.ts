// 老母鸡棋电脑（执母鸡，后手）：恒以母鸡视角的 alpha-beta 搜索。
// 母鸡连跳时行动方不变（仍是母鸡选择下一跳），所以搜索节点按 state.turn
// 决定 max/min，而不是简单地每层翻转。
import {
  HenState,
  HEN_POINTS,
  henJumps,
  henSteps,
  chickMoves,
  henTap
} from '@/utils/games/hen';

const MAX_DEPTH = 6;
const WIN = 100000;
const NODE_CAP = 200000;

// 局面评分（越大越利于母鸡）
function evaluate(state: HenState): number {
  const { board, captured } = state;
  let chicks = 0;
  let advance = 0; // 小鸡越压到底线，母鸡越危险
  board.forEach((v, i) => {
    if (v === 1) {
      chicks += 1;
      advance += HEN_POINTS[i].y;
    }
  });
  const henPos = board.indexOf(2);
  const jumpCount = henJumps(board, henPos).length;
  const stepCount = henSteps(board, henPos).length;

  return (
    captured * 500 - // 吃到嘴的小鸡最实在
    chicks * 40 -
    advance * 18 +
    jumpCount * 120 + // 能跳吃意味着开饭机会
    stepCount * 12 // 机动性，避免被围
  );
}

function terminalScore(state: HenState, depth: number): number | null {
  if (state.winner === 2) return WIN - (MAX_DEPTH - depth) * 100;
  if (state.winner === 1) return -WIN + (MAX_DEPTH - depth) * 100;
  return null;
}

function search(state: HenState, depth: number, alpha: number, beta: number, nodes: { n: number }): number {
  nodes.n += 1;
  const terminal = terminalScore(state, depth);
  if (terminal !== null) return terminal;
  if (depth === 0 || nodes.n > NODE_CAP) return evaluate(state);

  if (state.turn === 2) {
    // 母鸡决策（含连跳中继续选跳）：跳吃优先
    const henPos = state.board.indexOf(2);
    const jumps = henJumps(state.board, henPos);
    let best = -Infinity;
    let acted = false;
    for (const j of jumps) {
      acted = true;
      best = Math.max(best, search(henTap(state, j.to), depth - 1, alpha, beta, nodes));
      if (best > alpha) alpha = best;
      if (alpha >= beta) return best;
    }
    if (!state.chaining) {
      for (const t of henSteps(state.board, henPos)) {
        acted = true;
        best = Math.max(best, search(henTap(state, t), depth - 1, alpha, beta, nodes));
        if (best > alpha) alpha = best;
        if (alpha >= beta) return best;
      }
    }
    // 无子可动又未判负的极端局面，按静态评估处理
    return acted ? best : evaluate(state);
  }

  // 小鸡决策：每只小鸡选中后走到合法落点
  let best = Infinity;
  let acted = false;
  for (let from = 0; from < state.board.length; from++) {
    if (state.board[from] !== 1) continue;
    for (const to of chickMoves(state.board, from)) {
      acted = true;
      const selected = henTap(state, from);
      const moved = henTap(selected, to);
      best = Math.min(best, search(moved, depth - 1, alpha, beta, nodes));
      if (best < beta) beta = best;
      if (alpha >= beta) return best;
    }
  }
  return acted ? best : evaluate(state);
}

// 电脑（母鸡）选择点击点号：连跳时只返回跳点，否则跳点/走点均可
export function henAiTap(state: HenState): number {
  const nodes = { n: 0 };
  const henPos = state.board.indexOf(2);
  const jumps = henJumps(state.board, henPos).map((j) => j.to);
  // 连跳中只能继续跳；否则跳吃与走步都合法（跳吃排在前面优先考虑）
  const candidates = state.chaining ? jumps : [...jumps, ...henSteps(state.board, henPos)];

  let bestIndex = candidates[0];
  let bestScore = -Infinity;
  for (const target of candidates) {
    const score = search(henTap(state, target), MAX_DEPTH - 1, -Infinity, Infinity, nodes);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = target;
    }
  }
  return bestIndex;
}
