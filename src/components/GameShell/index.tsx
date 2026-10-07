import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { GameMode } from '@/types/game';
import styles from './index.module.scss';

export interface ShellPlayer {
  label: string;
  color: string;
}

interface GameShellProps {
  title: string;
  players: [ShellPlayer, ShellPlayer];
  current: 1 | 2 | null; // 当前行动方；游戏结束时为 null
  status: string;
  winnerText?: string | null;
  onRestart: () => void;
  onShowRules?: () => void;
  mode?: GameMode;
  onModeChange?: (mode: GameMode) => void;
  children: React.ReactNode;
}

const GameShell: React.FC<GameShellProps> = ({
  title,
  players,
  current,
  status,
  winnerText,
  onRestart,
  onShowRules,
  mode,
  onModeChange,
  children
}) => {
  const footerNote =
    mode === 'pve' ? `${title} · 人机对战（你执先手）` : `${title} · 双人同屏对弈`;

  return (
    <View className={styles.shell}>
      {/* 顶部对战信息栏 */}
      <View className={styles.headerCard}>
        <View
          className={styles.playerBadge}
          style={{
            borderColor: current === 1 ? players[0].color : 'transparent',
            opacity: current === 2 ? 0.55 : 1
          }}
        >
          <View className={styles.dot} style={{ background: players[0].color }} />
          <Text className={styles.playerName}>{players[0].label}</Text>
        </View>
        <View className={styles.vs}>
          <Text className={styles.vsText}>VS</Text>
        </View>
        <View
          className={styles.playerBadge}
          style={{
            borderColor: current === 2 ? players[1].color : 'transparent',
            opacity: current === 1 ? 0.55 : 1
          }}
        >
          <View className={styles.dot} style={{ background: players[1].color }} />
          <Text className={styles.playerName}>{players[1].label}</Text>
        </View>
      </View>

      {/* 模式切换 */}
      {mode && onModeChange ? (
        <View className={styles.modeSwitch}>
          <View
            className={classnames(styles.modeItem, mode === 'pvp' && styles.modeItemActive)}
            onClick={() => onModeChange('pvp')}
          >
            <Text
              className={classnames(styles.modeItemText, mode === 'pvp' && styles.modeItemTextActive)}
            >
              双人同屏
            </Text>
          </View>
          <View
            className={classnames(styles.modeItem, mode === 'pve' && styles.modeItemActive)}
            onClick={() => onModeChange('pve')}
          >
            <Text
              className={classnames(styles.modeItemText, mode === 'pve' && styles.modeItemTextActive)}
            >
              人机对战
            </Text>
          </View>
        </View>
      ) : null}

      {/* 状态提示 */}
      <View className={styles.statusBar}>
        <Text className={styles.statusText}>{status}</Text>
      </View>

      {/* 棋盘区域 */}
      <View className={styles.boardWrap}>{children}</View>

      {/* 结果遮罩 */}
      {winnerText ? (
        <View className={styles.resultOverlay}>
          <View className={styles.resultCard}>
            <Text className={styles.resultEmoji}>🏆</Text>
            <Text className={styles.resultText}>{winnerText}</Text>
            <View className={styles.resultBtn} onClick={onRestart}>
              <Text className={styles.resultBtnText}>再来一局</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* 底部操作 */}
      <View className={styles.footer}>
        <View className={styles.footerBtn} onClick={onRestart}>
          <Text className={styles.footerBtnText}>重新开始</Text>
        </View>
        {onShowRules ? (
          <View className={styles.footerBtnGhost} onClick={onShowRules}>
            <Text className={styles.footerBtnGhostText}>查看规则</Text>
          </View>
        ) : null}
      </View>

      <View className={styles.footerNote}>
        <Text className={styles.footerNoteText}>{footerNote}</Text>
      </View>
    </View>
  );
};

export default GameShell;
