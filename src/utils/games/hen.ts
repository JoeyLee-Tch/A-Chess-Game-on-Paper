// 老母鸡棋（抓小鸡棋）引擎
// 棋盘为 3×3 点阵：index = y*3 + x，横、竖、两条对角线为通路。
// board[i]: 0=空 1=小鸡 2=母鸡
// 小鸡 5 只初始在 0,1,2,3,5（上方两排）；母鸡初始在 7（底边中点）。
// 小鸡先行：只能向前（y 增大）或横走（y 不变）到相邻空点。
// 母鸡：可走到相邻空点；可沿直线跳过相邻小鸡落到其后方空点并吃掉，可连跳。
// 母鸡吃满 3 只小鸡获胜；母鸡回合开始无任何走法则小鸡胜。

export const HEN_CAPTURE_TARGET = 3;
export const HEN_POS = 7;

export interface HenState {
  board: number[];
  turn: 1 | 2; // 1=小鸡 2=母鸡
  selected: number | null; // 小鸡方选中的小鸡
  captured: number; // 已被吃掉的小鸡数
  winner: 0 | 1 | 2;
  chaining: boolean; // 母鸡连跳中（必须继续跳）
}

export const HEN_POINTS: { x: number; y: number }[] = Array.from(
  { length: 9 },
  (_, i) => ({ x: i % 3, y: Math.floor(i / 3) })
);

export const HEN_EDGES: [number, number][] = [
  [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], // 横
  [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8], // 竖
  [0, 4], [4, 8], [2, 4], [4, 6] // 斜
];

export const HEN_ADJ: number[][] = HEN_EDGES.reduce<number[][]>((acc, [a, b]) => {
  acc[a].push(b);
  acc[b].push(a);
  return acc;
}, Array.from({ length: 9 }, () => []));

export function createHenState(): HenState {
  const board = Array(9).fill(0);
  [0, 1, 2, 3, 5].forEach((i) => (board[i] = 1));
  board[HEN_POS] = 2;
  return { board, turn: 1, selected: null, captured: 0, winner: 0, chaining: false };
}

// 母鸡从 from 出发的所有跳吃：返回 { to, over } 列表
export function henJumps(board: number[], from: number): { to: number; over: number }[] {
  const res: { to: number; over: number }[] = [];
  const p = HEN_POINTS[from];
  for (const n of HEN_ADJ[from]) {
    if (board[n] !== 1) continue;
    const q = HEN_POINTS[n];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const bx = q.x + dx;
    const by = q.y + dy;
    if (bx < 0 || bx > 2 || by < 0 || by > 2) continue;
    const to = by * 3 + bx;
    if (board[to] === 0 && HEN_ADJ[n].includes(to)) {
      res.push({ to, over: n });
    }
  }
  return res;
}

// 母鸡可走的相邻空点
export function henSteps(board: number[], from: number): number[] {
  return HEN_ADJ[from].filter((j) => board[j] === 0);
}

// 小鸡从 from 出发的合法落点：相邻空点且不后退
export function chickMoves(board: number[], from: number): number[] {
  const py = HEN_POINTS[from].y;
  return HEN_ADJ[from].filter((j) => board[j] === 0 && HEN_POINTS[j].y >= py);
}

// 当前局面下某点作为目标是否合法（用于 UI 高亮）
export function henTargets(state: HenState): number[] {
  if (state.turn === 2) {
    const jumps = henJumps(state.board, state.board.indexOf(2));
    if (state.chaining) return jumps.map((j) => j.to);
    return [...jumps.map((j) => j.to), ...henSteps(state.board, state.board.indexOf(2))];
  }
  if (state.selected !== null) return chickMoves(state.board, state.selected);
  return [];
}

export function henTap(state: HenState, index: number): HenState {
  if (state.winner !== 0) return state;
  const { board, turn } = state;

  if (turn === 1) {
    // 小鸡方：选中或走子
    if (board[index] === 1) return { ...state, selected: index };
    if (state.selected !== null && chickMoves(board, state.selected).includes(index)) {
      const next = board.slice();
      next[state.selected] = 0;
      next[index] = 1;
      const henPos = next.indexOf(2);
      const henAlive =
        henSteps(next, henPos).length > 0 || henJumps(next, henPos).length > 0;
      console.log('[Hen] chick move', { from: state.selected, to: index });
      return {
        board: next,
        turn: 2,
        selected: null,
        captured: state.captured,
        winner: henAlive ? 0 : 1, // 母鸡无路可走，小鸡胜
        chaining: false
      };
    }
    return { ...state, selected: null };
  }

  // 母鸡方
  const henPos = board.indexOf(2);
  const jumps = henJumps(board, henPos);
  const jump = jumps.find((j) => j.to === index);
  if (jump) {
    const next = board.slice();
    next[henPos] = 0;
    next[jump.over] = 0;
    next[index] = 2;
    const captured = state.captured + 1;
    if (captured >= HEN_CAPTURE_TARGET) {
      console.log('[Hen] hen captured enough chicks, hen wins');
      return { board: next, turn, selected: null, captured, winner: 2, chaining: false };
    }
    const more = henJumps(next, index).length > 0;
    console.log('[Hen] hen jump capture', { over: jump.over, to: index, chained: more });
    // 还能跳则必须连跳，否则轮到小鸡
    return {
      board: next,
      turn: more ? 2 : 1,
      selected: null,
      captured,
      winner: 0,
      chaining: more
    };
  }
  // 连跳中不允许走普通步
  if (state.chaining) return state;
  if (henSteps(board, henPos).includes(index)) {
    const next = board.slice();
    next[henPos] = 0;
    next[index] = 2;
    console.log('[Hen] hen step', { from: henPos, to: index });
    return { board: next, turn: 1, selected: null, captured: state.captured, winner: 0, chaining: false };
  }
  return state;
}
