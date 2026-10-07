// 区字棋（憋死牛 / 三棋）引擎
// 棋盘为 3×3 点阵（横、竖、两条对角线为通路），index = y*3 + x。
// 每方 3 子：蓝方在顶排 0,1,2，红方在底排 6,7,8，红方先行。
// 沿实线走一步到相邻空点；轮到走棋时无子可动即被“憋死”判负。
// 和棋：同一局面（含走棋方）出现三次，或总步数超过 40 步。

export interface QuziState {
  board: number[]; // 0=空 1=红 2=蓝
  turn: 1 | 2;
  selected: number | null;
  winner: 0 | 1 | 2;
  draw: boolean;
  plies: number;
  history: Record<string, number>;
}

export const QUZI_POINTS: { x: number; y: number }[] = Array.from(
  { length: 9 },
  (_, i) => ({ x: i % 3, y: Math.floor(i / 3) })
);

export const QUZI_EDGES: [number, number][] = [
  [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], // 横
  [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8], // 竖
  [0, 4], [4, 8], [2, 4], [4, 6] // 斜
];

export const QUZI_ADJ: number[][] = QUZI_EDGES.reduce<number[][]>(
  (acc, [a, b]) => {
    acc[a].push(b);
    acc[b].push(a);
    return acc;
  },
  Array.from({ length: 9 }, () => [])
);

const MAX_PLIES = 40;

export function createQuziState(): QuziState {
  const board = Array(9).fill(0);
  [6, 7, 8].forEach((i) => (board[i] = 1));
  [0, 1, 2].forEach((i) => (board[i] = 2));
  const key = board.join('') + '-1';
  return {
    board,
    turn: 1,
    selected: null,
    winner: 0,
    draw: false,
    plies: 0,
    history: { [key]: 1 }
  };
}

// 某方是否还有合法走法
export function quziHasMove(board: number[], player: 1 | 2): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[i] === player && QUZI_ADJ[i].some((j) => board[j] === 0)) {
      return true;
    }
  }
  return false;
}

// 当前方选中棋子后可走的落点
export function quziTargets(state: QuziState): number[] {
  if (state.selected === null) return [];
  return QUZI_ADJ[state.selected].filter((j) => state.board[j] === 0);
}

export function quziTap(state: QuziState, index: number): QuziState {
  if (state.winner !== 0 || state.draw) return state;
  const { board, turn, selected } = state;

  // 点到自己的子：选中
  if (board[index] === turn) {
    return { ...state, selected: index };
  }
  // 已有选中且点到相邻空点：走子
  if (selected !== null && board[index] === 0 && QUZI_ADJ[selected].includes(index)) {
    const next = board.slice();
    next[selected] = 0;
    next[index] = turn;
    const opponent: 1 | 2 = turn === 1 ? 2 : 1;
    const plies = state.plies + 1;

    // 憋死判定
    if (!quziHasMove(next, opponent)) {
      console.log('[Quzi] blocked, winner =', turn);
      return { ...state, board: next, turn: opponent, selected: null, winner: turn, plies };
    }

    // 和棋判定：三次重复局面或超步数
    const key = next.join('') + '-' + opponent;
    const history = { ...state.history, [key]: (state.history[key] || 0) + 1 };
    const draw = history[key] >= 3 || plies >= MAX_PLIES;
    if (draw) console.log('[Quzi] draw', { reason: history[key] >= 3 ? 'threefold' : 'plies' });

    return {
      board: next,
      turn: opponent,
      selected: null,
      winner: 0,
      draw,
      plies,
      history
    };
  }
  // 其他情况：取消选中
  return { ...state, selected: null };
}
