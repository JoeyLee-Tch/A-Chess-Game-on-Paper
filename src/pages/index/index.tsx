import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import GameCard from '@/components/GameCard';
import { GAMES } from '@/data/games';
import styles from './index.module.scss';

const IndexPage: React.FC = () => {
  const goGame = (type: string) => {
    Taro.navigateTo({ url: `/pages/game/index?type=${type}` });
  };

  return (
    <View className={styles.container}>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>纸上棋局</Text>
        <Text className={styles.heroSubtitle}>小时候课本背面画的棋，你还记得吗？</Text>
      </View>
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>选一局对弈</Text>
          <Text className={styles.sectionCount}>{GAMES.length} 种玩法</Text>
        </View>
        {GAMES.map((g) => (
          <GameCard key={g.type} meta={g} onPlay={() => goGame(g.type)} />
        ))}
      </View>
      <View className={styles.tip}>
        <Text className={styles.tipText}>把手机交给对手，面对面纸上对弈</Text>
      </View>
    </View>
  );
};

export default IndexPage;
