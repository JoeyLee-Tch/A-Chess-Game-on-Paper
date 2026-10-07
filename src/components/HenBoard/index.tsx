import React, { useMemo, useState } from 'react';
import GameShell from '@/components/GameShell';
import BoardView, { BoardPoint } from '@/components/BoardView';
import Piece from '@/components/Piece';
import { GameMode } from '@/types/game';
import { useAiTurn } from '@/hooks/useAiTurn';
import {
  createHenState,
  henTap,
  henTargets,
  HEN_POINTS,
  HEN_EDGES,
  HEN_CAPTURE_TARGET,
  HenState
} from '@/utils/games/hen';
import { henAiTap } from '@/utils/ai/henAi';

const SIZE = 600;
const PAD = 84;
const STEP = (SIZE - PAD * 2) / 2;

const toRpx = (p: { x: number; y: number }): BoardPoint => ({
  x: PAD + p.x * STEP,
  y: PAD + p.y * STEP
});

interface HenBoardProps {
  onShowRules?: () => void;
}

const HenBoard: React.FC<HenBoardProps> = ({ onShowRules }) => {
  const [mode, setMode] = useState<GameMode>('pvp');
  const [state, setState] = useState<HenState>(() => createHenState());

  const aiThinking = mode === 'pve' && state.winner === 0 && state.turn === 2;
  const inputLocked = mode === 'pve' && (state.winner !== 0 || state.turn === 2);

  useAiTurn(aiThinking, state, () => {
    setState((s) => henTap(s, henAiTap(s)));
  });

  const changeMode = (next: GameMode) => {
    setMode(next);
    setState(createHenState());
  };

  const points = useMemo(() => HEN_POINTS.map(toRpx), []);
  const targets = state.winner === 0 ? henTargets(state) : [];

  let status = '';
  if (state.winner === 0) {
    if (state.turn === 1) {
      status =
        state.selected === null
          ? `轮到${mode === 'pve' ? '你' : '小鸡方'}：点选一只小鸡（只能向前或横走）`
          : '已选中小鸡，点击发光空点移动';
    } else if (aiThinking) {
      status = state.chaining
        ? '电脑连跳中！'
        : `电脑思考中…（母鸡已吃 ${state.captured}/${HEN_CAPTURE_TARGET}）`;
    } else {
      status = state.chaining
        ? '母鸡连跳中！继续跳吃小鸡'
        : `轮到母鸡方：走步或跳过小鸡吃掉它（已吃 ${state.captured}/${HEN_CAPTURE_TARGET}）`;
    }
  }

  let winnerText: string | null = null;
  if (state.winner) {
    if (state.winner === 2) {
      winnerText =
        mode === 'pve'
          ? `电脑获胜！母鸡吃掉了 ${HEN_CAPTURE_TARGET} 只小鸡`
          : `母鸡获胜！成功吃掉 ${HEN_CAPTURE_TARGET} 只小鸡`;
    } else {
      winnerText =
        mode === 'pve'
          ? '你赢了！电脑的母鸡被围得无路可走'
          : '小鸡方获胜！母鸡被围得无路可走';
    }
  }

  return (
    <GameShell
      title="老母鸡棋"
      players={
        mode === 'pve'
          ? [
              { label: '你（小鸡方）', color: '#d9a036' },
              { label: '电脑（母鸡方）', color: '#c0392b' }
            ]
          : [
              { label: '小鸡方', color: '#d9a036' },
              { label: '母鸡方', color: '#c0392b' }
            ]
      }
      current={state.winner ? null : state.turn}
      status={status}
      winnerText={winnerText}
      onRestart={() => setState(createHenState())}
      onShowRules={onShowRules}
      mode={mode}
      onModeChange={changeMode}
    >
      <BoardView
        size={SIZE}
        points={points}
        edges={HEN_EDGES}
        selected={state.turn === 1 ? state.selected : state.board.indexOf(2)}
        targets={targets}
        onPointTap={(i) => {
          if (!inputLocked) setState((s) => henTap(s, i));
        }}
        renderPiece={(i) => {
          const v = state.board[i];
          if (v === 1) {
            return (
              <Piece
                color="#d9a036"
                label="鸡"
                size={60}
                selected={state.turn === 1 && state.selected === i}
              />
            );
          }
          if (v === 2) {
            return <Piece color="#c0392b" label="母" size={84} />;
          }
          return null;
        }}
      />
    </GameShell>
  );
};

export default HenBoard;
