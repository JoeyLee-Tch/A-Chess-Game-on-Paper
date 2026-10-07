// 成方棋（六成三 / Six Men's Morris）引擎
// 棋盘 16 点（6x6 网格坐标）：
// 外圈 0:(0,0) 1:(3,0) 2:(6,0) 3:(6,3) 4:(6,6) 5:(3,6) 6:(0,6) 7:(0,3)
// 内圈 8:(2,2) 9:(3,2) 10:(4,2) 11:(4,3) 12:(4,4) 13:(3,4) 14:(2,4) 15:(2,3)
// “三”：外圈 4 条边 + 内圈 4 条边，共 8 条。
// 每人 6 子；下子阶段放子，走子阶段沿边移动；成三即吃对方一子。

export const CF_PIECES = 6;

export interface CfState {
  board: number[]; // 0=空 1=红 2=蓝
  hand: [number, number]; // 双方剩余未下的子
  turn: 1 | 2;
  selected: number | null;
  mustCapture: boolean; // 当前方必须先吃子
  winner: 0 | 1 | 2;
}

export const CF_POINTS: { x: number; y: number }[] = [
  { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3 },
  { x: 6, y: 6 }, { x: 3, y: 6 }, { x: 0, y: 6 }, { x: 0, y: 3 },
  { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 3 },
  { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 3 }
];

export const CF_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  [1, 9], [3, 11], [5, 13], [7, 15]
];

export const CF_MILLS: number[][] = [
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8]
];

export const CF_ADJ: number[][] = CF_EDGES.reduce<number[][]>((acc, [a, b]) => {
  acc[a].push(b);
  acc[b].push(a);
  return acc;
}, Array.from({ length: 16 }, () => []));

export function createCfState(): CfState {
  return {
    board: Array(16).fill(0),
    hand: [CF_PIECES, CF_PIECES],
    turn: 1,
    selected: null,
    mustCapture: false,
    winner: 0
  };
}

// 某方当前成“三”的数量
export function cfCountMills(board: number[], player: 1 | 2): number {
  return CF_MILLS.filter((m) => m.every((i) => board[i] === player)).length;
}

function cfOnBoard(board: number[], player: 1 | 2): number[] {
  const res: number[] = [];
  board.forEach((v, i) => {
    if (v === player) res.push(i);
  });
  return res;
}

// 可被吃的子：优先不在“三”里的；若全部成三则都可吃
export function cfCapturable(board: number[], opponent: 1 | 2): number[] {
  const pieces = cfOnBoard(board, opponent);
  const free = pieces.filter(
    (i) => !CF_MILLS.some((m) => m.includes(i) && m.every((j) => board[j] === opponent))
  );
  return free.length > 0 ? free : pieces;
}

function cfHasMove(state: CfState, player: 1 | 2): boolean {
  if (state.hand[player - 1] > 0) return state.board.some((v) => v === 0);
  return cfOnBoard(state.board, player).some((i) =>
    CF_ADJ[i].some((j) => state.board[j] === 0)
  );
}

function cfEndTurn(state: CfState, board: number[], hand: [number, number], movedBy: 1 | 2, millsBefore: number): CfState {
  const millsAfter = cfCountMills(board, movedBy);
  const formedMill = millsAfter > millsBefore;
  if (formedMill) {
    console.log('[ChengFang] mill formed by player', movedBy);
    return { ...state, board, hand, mustCapture: true, selected: null };
  }
  const opponent: 1 | 2 = movedBy === 1 ? 2 : 1;
  const next: CfState = { ...state, board, hand, turn: opponent, selected: null, mustCapture: false };
  // 对方无子可动则判负
  if (!cfHasMove(next, opponent)) {
    next.winner = movedBy;
    console.log('[ChengFang] opponent blocked, winner =', movedBy);
  }
  return next;
}

export function cfTap(state: CfState, index: number): CfState {
  if (state.winner !== 0) return state;
  const { board, turn, hand, selected, mustCapture } = state;
  const opponent: 1 | 2 = turn === 1 ? 2 : 1;

  // 吃子阶段：只能点对方可吃的子
  if (mustCapture) {
    if (board[index] !== opponent) return state;
    if (!cfCapturable(board, opponent).includes(index)) return state;
    const nextBoard = board.slice();
    nextBoard[index] = 0;
    const next: CfState = { ...state, board: nextBoard, mustCapture: false, selected: null };
    const oppTotal = cfOnBoard(nextBoard, opponent).length + hand[opponent - 1];
    if (oppTotal < 3) {
      next.winner = turn;
      console.log('[ChengFang] capture reduces opponent below 3, winner =', turn);
      return next;
    }
    const switched: CfState = { ...next, turn: opponent };
    if (!cfHasMove(switched, opponent)) {
      switched.winner = turn;
    }
    return switched;
  }

  const millsBefore = cfCountMills(board, turn);

  // 下子阶段
  if (hand[turn - 1] > 0) {
    if (board[index] !== 0) return state;
    const nextBoard = board.slice();
    nextBoard[index] = turn;
    const nextHand: [number, number] = [hand[0], hand[1]];
    nextHand[turn - 1] -= 1;
    console.log('[ChengFang] place', { index, player: turn });
    return cfEndTurn(state, nextBoard, nextHand, turn, millsBefore);
  }

  // 走子阶段
  if (board[index] === turn) {
    return { ...state, selected: index };
  }
  if (selected !== null && board[index] === 0 && CF_ADJ[selected].includes(index)) {
    const nextBoard = board.slice();
    nextBoard[selected] = 0;
    nextBoard[index] = turn;
    console.log('[ChengFang] move', { from: selected, to: index, player: turn });
    return cfEndTurn(state, nextBoard, hand, turn, millsBefore);
  }
  return { ...state, selected: null };
}

// 走子阶段选中棋子后的可走落点
export function cfTargets(state: CfState): number[] {
  if (state.selected === null || state.hand[state.turn - 1] > 0) return [];
  return CF_ADJ[state.selected].filter((j) => state.board[j] === 0);
}
