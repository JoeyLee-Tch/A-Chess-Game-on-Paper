import React from 'react';
import { View, Text } from '@tarojs/components';
import { pxTransform } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface PieceProps {
  color: string; // 棋子主色
  label?: string; // 棋子上的字（如“母”“鸡”）
  selected?: boolean;
  dimmed?: boolean; // 被吃掉/弱化
  size?: number; // rpx
}

const Piece: React.FC<PieceProps> = ({ color, label, selected, dimmed, size = 72 }) => {
  return (
    <View
      className={classnames(styles.piece, selected && styles.selected, dimmed && styles.dimmed)}
      style={{
        width: pxTransform(size),
        height: pxTransform(size),
        background: `radial-gradient(circle at 32% 30%, ${color}dd 0%, ${color} 55%, ${color}bb 100%)`
      }}
    >
      {label ? <Text className={styles.label}>{label}</Text> : null}
    </View>
  );
};

export default Piece;
