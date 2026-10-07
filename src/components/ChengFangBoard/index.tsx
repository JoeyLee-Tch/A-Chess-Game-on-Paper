import React, { useMemo, useState } from 'react';
import GameShell from '@/components/GameShell';
import BoardView, { BoardPoint } from '@/components/BoardView';
import Piece from '@/components/Piece';
import { GameMode } from '@/types/game';
import { useAiTurn } from '@/hooks/useAiTurn';
import {
  createCfState,
  cfTap,
  cfTargets,
  cfCapturable,
  CF_POINTS,
  CF_EDGES,
  CfState
} from '@/utils/games/chengfang';
import { cfAiTap } from '@/utils/ai/chengfangAi';

const SIZE = 600;
const PAD = 46;
const STEP = (SIZE - PAD * 2) / 6;

const toRpx = (p: { x: number; y: number }): BoardPoint => ({
  x: PAD + p.x * STEP,
  y: PAD + p.y * STEP
});

const LABELS: Record<1 | 2, string> = { 1: '红方', 2: '蓝方' };

interface ChengFangBoardProps {
  onShowRules?: () => void;
}

const ChengFangBoard: React.FC<ChengFangBoardProps> = ({ onShowRules }) => {
  const [mode, setMode] = useState<GameMode>('pvp');
  const [state, setState] = useState<CfState>(() => createCfState());

  const aiThinking = mode === 'pve' && state.winner === 0 && state.turn === 2;
  const inputLocked = mode === 'pve' && (state.winner !== 0 || state.turn === 2);

  useAiTurn(aiThinking, state, () => {
    setState((s) => cfTap(s, cfAiTap(s)));
  });

  const changeMode = (next: GameMode) => {
    setMode(next);
    setState(createCfState());
  };

  const points = useMemo(() => CF_POINTS.map(toRpx), []);
  const opponent: 1 | 2 = state.turn === 1 ? 2 : 1;
  const placing = state.hand[state.turn - 1] > 0;
  const targets = state.winner === 0 && !state.mustCapture ? cfTargets(state) : [];
  const capturables =
    state.winner === 0 && state.mustCapture ? cfCapturable(state.board, opponent) : [];

  let status = '';
  if (state.winner === 0) {
    if (aiThinking) {
      status = state.mustCapture ? '电脑成“三”，正在吃子…' : '电脑思考中…';
    } else if (state.mustCapture) {
      status = `成“三”！${LABELS[state.turn]}点选一颗对方的棋子吃掉`;
    } else if (placing) {
      status =
        (mode === 'pve' ? '下子阶段：轮到你' : `下子阶段：${LABELS[state.turn]}`) +
        `落子（双方各剩 ${state.hand[0]} / ${state.hand[1]} 子）`;
    } else if (state.selected === null) {
      status = `走子阶段：轮到${mode === 'pve' ? '你' : LABELS[state.turn]}，点选棋子`;
    } else {
      status = '已选中棋子，点击相邻发光空点走子';
    }
  }

  const winnerText = state.winner
    ? mode === 'pve'
      ? state.winner === 1
        ? '你赢了！电脑无力回天'
        : '电脑获胜！再来一局雪耻'
      : `${LABELS[state.winner]}获胜！`
    : null;

  return (
    <GameShell
      title="成方棋"
      players={
        mode === 'pve'
          ? [
              { label: '你（红方）', color: '#c0392b' },
              { label: '电脑（蓝方）', color: '#2e5eaa' }
            ]
          : [
              { label: '红方', color: '#c0392b' },
              { label: '蓝方', color: '#2e5eaa' }
            ]
      }
      current={state.winner ? null : state.turn}
      status={status}
      winnerText={winnerText}
      onRestart={() => setState(createCfState())}
      onShowRules={onShowRules}
      mode={mode}
      onModeChange={changeMode}
    >
      <BoardView
        size={SIZE}
        points={points}
        edges={CF_EDGES}
        selected={state.selected}
        targets={targets}
        capturables={capturables}
        onPointTap={(i) => {
          if (!inputLocked) setState((s) => cfTap(s, i));
        }}
        renderPiece={(i) => {
          const v = state.board[i];
          if (v === 0) return null;
          return (
            <Piece
              color={v === 1 ? '#c0392b' : '#2e5eaa'}
              selected={state.selected === i}
              size={64}
            />
          );
        }}
      />
    </GameShell>
  );
};

export default ChengFangBoard;
