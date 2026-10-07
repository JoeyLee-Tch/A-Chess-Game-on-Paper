import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { GAMES } from '@/data/games';
import styles from './index.module.scss';

const RulesPage: React.FC = () => {
  const [open, setOpen] = useState<number>(0);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>规则图鉴</Text>
        <Text className={styles.headerSubtitle}>四种纸上棋的玩法都在这里</Text>
      </View>
      {GAMES.map((g, idx) => (
        <View key={g.type} className={styles.ruleCard}>
          <View
            className={styles.ruleHeader}
            onClick={() => setOpen(open === idx ? -1 : idx)}
          >
            <View className={styles.ruleTitleWrap}>
              <Text className={styles.ruleTitle}>{g.name}</Text>
              <Text className={styles.ruleAlias}>{g.alias}</Text>
            </View>
            <Text className={classnames(styles.arrow, open === idx && styles.arrowOpen)}>
              ▾
            </Text>
          </View>
          {open === idx ? (
            <View className={styles.ruleBody}>
              {g.rules.map((r, i) => (
                <View key={i} className={styles.ruleItem}>
                  <View className={styles.ruleIndex}>
                    <Text className={styles.ruleIndexText}>{i + 1}</Text>
                  </View>
                  <Text className={styles.ruleText}>{r}</Text>
                </View>
              ))}
              <View className={styles.ruleTip}>
                <Text className={styles.ruleTipText}>妙招：{g.tip}</Text>
              </View>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
};

export default RulesPage;
