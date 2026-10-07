import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const AboutPage: React.FC = () => {
  return (
    <View className={styles.container}>
      <View className={styles.hero}>
        <View className={styles.heroIcon}>
          <Text className={styles.heroIconText}>棋</Text>
        </View>
        <Text className={styles.heroTitle}>纸上棋局</Text>
        <Text className={styles.heroVersion}>Version 1.0.0</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>回忆</Text>
        <Text className={styles.cardText}>
          在没有手机游戏和网吧的年代，快乐只需要一张纸、一支笔，或者几颗捡来的石子。{'\n\n'}
          课本背面、作业本边角、甚至泥巴地，都是我们的棋盘。{'\n\n'}
          这个小程序想把这些棋盘重新画出来，递到你面前。
        </Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>特色</Text>
        <View className={styles.featureList}>
          <View className={styles.featureItem}>
            <Text className={styles.featureDot}>·</Text>
            <Text className={styles.featureText}>四种经典纸上棋，双人同屏对战</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureDot}>·</Text>
            <Text className={styles.featureText}>复古纸张手绘风格，暖黄底色</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureDot}>·</Text>
            <Text className={styles.featureText}>纯本地运行，无需联网无需注册</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureDot}>·</Text>
            <Text className={styles.featureText}>适合课间、通勤、带娃、陪爸妈</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Text className={styles.footerText}>愿你永远记得，那节课间对弈的时光</Text>
      </View>
    </View>
  );
};

export default AboutPage;
