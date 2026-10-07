import React, { useMemo, useState } from 'react';
import GameShell from '@/components/GameShell';
import BoardView, { BoardPoint } from '@/components/BoardView';
import Piece from '@/components/Piece';
import { GameMode } from '@/types/game';
import { useAiTurn } from '@/hooks/useAiTurn';
import {
  createQuziState,
  quziTap,
  quziTargets,
  QUZI_POINTS,
  QUZI_EDGES,
  QuziState
} from '@/utils/games/quzi';
import { quziAiTap } from '@/utils/ai/quziAi';

const SIZE = 600;
const PAD = 84;
const STEP = (SIZE - PAD * 2) / 2;

const toRpx = (p: { x: number; y: number }): BoardPoint => ({
  x: PAD + p.x * STEP,
  y: PAD + p.y * STEP
});

const LABELS: Record<1 | 2, string> = { 1: '红方', 2: '蓝方' };

interface QuziBoardProps {
  onShowRules?: () => void;
}

const QuziBoard: React.FC<QuziBoardProps> = ({ onShowRules }) => {
  const [mode, setMode] = useState<GameMode>('pvp');
  const [state, setState] = useState<QuziState>(() => createQuziState());

  const aiThinking = mode === 'pve' && state.winner === 0 && state.turn === 2;
  const inputLocked = mode === 'pve' && (state.winner !== 0 || state.turn === 2);

  useAiTurn(aiThinking, state, () => {
    setState((s) => quziTap(s, quziAiTap(s)));
  });

  const changeMode = (next: GameMode) => {
    setMode(next);
    setState(createQuziState());
  };

  const points = useMemo(() => QUZI_POINTS.map(toRpx), []);
  const targets = state.winner === 0 ? quziTargets(state) : [];

  const status = state.winner
    ? ''
    : aiThinking
    ? '电脑思考中…'
    : state.selected === null
    ? `轮到${mode === 'pve' ? '你（红方）' : LABELS[state.turn]}：点选自己的棋子`
    : '已选中棋子，点击发光空点走子';

  const winnerText = state.winner
    ? mode === 'pve'
      ? state.winner === 1
        ? '你赢了！电脑被憋死了'
        : '电脑获胜！你被憋得无路可走'
      : `${LABELS[state.winner]}获胜！对方被憋死了`
    : null;

  return (
    <GameShell
      title="区字棋"
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
      onRestart={() => setState(createQuziState())}
      onShowRules={onShowRules}
      mode={mode}
      onModeChange={changeMode}
    >
      <BoardView
        size={SIZE}
        points={points}
        edges={QUZI_EDGES}
        selected={state.selected}
        targets={targets}
        onPointTap={(i) => {
          if (!inputLocked) setState((s) => quziTap(s, i));
        }}
        renderPiece={(i) => {
          const v = state.board[i];
          if (v === 0) return null;
          return (
            <Piece
              color={v === 1 ? '#c0392b' : '#2e5eaa'}
              selected={state.selected === i}
            />
          );
        }}
      />
    </GameShell>
  );
};

export default QuziBoard;
