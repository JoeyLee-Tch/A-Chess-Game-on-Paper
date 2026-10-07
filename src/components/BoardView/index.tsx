import React from 'react';
import { View } from '@tarojs/components';
import { pxTransform } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface BoardPoint {
  x: number; // rpx（点中心坐标）
  y: number;
}

export interface BoardViewProps {
  size: number; // 棋盘边长 rpx
  points: BoardPoint[];
  edges: [number, number][];
  selected?: number | null;
  targets?: number[]; // 可落点提示（半透明圈）
  capturables?: number[]; // 可吃子提示（红圈闪烁）
  onPointTap: (index: number) => void;
  renderPiece: (index: number) => React.ReactNode;
}

const LINE_THICK = 5; // rpx

const BoardView: React.FC<BoardViewProps> = ({
  size,
  points,
  edges,
  selected,
  targets = [],
  capturables = [],
  onPointTap,
  renderPiece
}) => {
  return (
    <View
      className={styles.board}
      style={{ width: pxTransform(size), height: pxTransform(size) }}
    >
      {/* 棋盘线 */}
      {edges.map(([a, b], i) => {
        const pa = points[a];
        const pb = points[b];
        const dx = pb.x - pa.x;
        const dy = pb.y - pa.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={`line-${i}`}
            className={styles.line}
            style={{
              left: pxTransform(pa.x),
              top: pxTransform(pa.y - LINE_THICK / 2),
              width: pxTransform(len),
              height: pxTransform(LINE_THICK),
              transform: `rotate(${deg}deg)`
            }}
          />
        );
      })}

      {/* 落点热区 + 提示 + 棋子 */}
      {points.map((p, i) => {
        const isTarget = targets.includes(i);
        const isCapturable = capturables.includes(i);
        return (
          <View
            key={`pt-${i}`}
            className={classnames(styles.hotspot, isCapturable && styles.hotspotCapturable)}
            style={{ left: pxTransform(p.x - 54), top: pxTransform(p.y - 54) }}
            onClick={() => onPointTap(i)}
          >
            {isTarget && <View className={styles.targetDot} />}
            {isCapturable && <View className={styles.captureRing} />}
            <View className={styles.pieceSlot}>{renderPiece(i)}</View>
          </View>
        );
      })}

      {/* 选中标记 */}
      {selected !== null && selected !== undefined && (
        <View
          className={styles.selectedRing}
          style={{
            left: pxTransform(points[selected].x - 52),
            top: pxTransform(points[selected].y - 52)
          }}
        />
      )}
    </View>
  );
};

export default BoardView;
