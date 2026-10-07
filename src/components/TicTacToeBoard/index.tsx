import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import GameShell from '@/components/GameShell';
import { GameMode } from '@/types/game';
import { useAiTurn } from '@/hooks/useAiTurn';
import { createTttState, tttPlay, TttState } from '@/utils/games/tictactoe';
import { tttAiTap } from '@/utils/ai/tictactoeAi';
import styles from './index.module.scss';

const LABELS: Record<1 | 2, string> = { 1: '画圈 O', 2: '画叉 X' };

interface TicTacToeBoardProps {
  onShowRules?: () => void;
}

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ onShowRules }) => {
  const [mode, setMode] = useState<GameMode>('pvp');
  const [state, setState] = useState<TttState>(() => createTttState());

  const gameOver = state.winner !== 0 || state.draw;
  const aiThinking = mode === 'pve' && !gameOver && state.turn === 2;
  const inputLocked = mode === 'pve' && (gameOver || state.turn === 2);

  useAiTurn(aiThinking, state, () => {
    setState((s) => tttPlay(s, tttAiTap(s)));
  });

  const changeMode = (next: GameMode) => {
    setMode(next);
    setState(createTttState());
  };

  const status = gameOver
    ? ''
    : aiThinking
    ? '电脑思考中…'
    : `轮到${mode === 'pve' ? '你' : LABELS[state.turn]}：点击空格落子`;

  let winnerText: string | null = null;
  if (state.winner) {
    winnerText =
      mode === 'pve'
        ? state.winner === 1
          ? '你赢了！三点连成一线'
          : '电脑获胜！再来一局找回场子'
        : `${LABELS[state.winner]}获胜！三点连成一线`;
  } else if (state.draw) {
    winnerText = '平局！九格画满，不分胜负';
  }

  return (
    <GameShell
      title="井字棋"
      players={
        mode === 'pve'
          ? [
              { label: '你（画圈 O）', color: '#c0392b' },
              { label: '电脑（画叉 X）', color: '#2e5eaa' }
            ]
          : [
              { label: '画圈 O', color: '#c0392b' },
              { label: '画叉 X', color: '#2e5eaa' }
            ]
      }
      current={gameOver ? null : state.turn}
      status={status}
      winnerText={winnerText}
      onRestart={() => setState(createTttState())}
      onShowRules={onShowRules}
      mode={mode}
      onModeChange={changeMode}
    >
      <View className={styles.grid}>
        {/* 网格线 */}
        <View className={classnames(styles.gridLine, styles.gridLineV1)} />
        <View className={classnames(styles.gridLine, styles.gridLineV2)} />
        <View className={classnames(styles.gridLine, styles.gridLineH1)} />
        <View className={classnames(styles.gridLine, styles.gridLineH2)} />
        {state.board.map((v, i) => {
          const inWinLine = state.winLine?.includes(i);
          return (
            <View
              key={i}
              className={classnames(styles.cell, inWinLine && styles.cellWin)}
              onClick={() => {
                if (!inputLocked) setState((s) => tttPlay(s, i));
              }}
            >
              {v === 1 && <Text className={classnames(styles.mark, styles.markO)}>O</Text>}
              {v === 2 && <Text className={classnames(styles.mark, styles.markX)}>X</Text>}
            </View>
          );
        })}
      </View>
    </GameShell>
  );
};

export default TicTacToeBoard;
