import React from 'react';
import { View, Text } from '@tarojs/components';
import { GameMeta } from '@/types/game';
import styles from './index.module.scss';

interface GameCardProps {
  meta: GameMeta;
  onPlay: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ meta, onPlay }) => {
  return (
    <View className={styles.card} onClick={onPlay}>
      <View className={styles.header}>
        <Text className={styles.name}>{meta.name}</Text>
        <Text className={styles.alias}>{meta.alias}</Text>
      </View>
      <Text className={styles.desc}>{meta.desc}</Text>
      <View className={styles.tags}>
        {meta.tags.map((t) => (
          <Text key={t} className={styles.tag}>{t}</Text>
        ))}
      </View>
      <View className={styles.footer}>
        <Text className={styles.pieces}>{meta.pieces}</Text>
        <View className={styles.playBtn}>
          <Text className={styles.playBtnText}>开始对弈</Text>
        </View>
      </View>
    </View>
  );
};

export default GameCard;
