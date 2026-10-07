import React, { useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import QuziBoard from '@/components/QuziBoard';
import ChengFangBoard from '@/components/ChengFangBoard';
import TicTacToeBoard from '@/components/TicTacToeBoard';
import HenBoard from '@/components/HenBoard';
import { getGameMeta } from '@/data/games';
import styles from './index.module.scss';

const GamePage: React.FC = () => {
  const router = useRouter();
  const type = router.params.type;
  const meta = getGameMeta(type);

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: meta.name });
  }, [meta.name]);

  const goRules = () => {
    Taro.switchTab({ url: '/pages/rules/index' });
  };

  const renderBoard = () => {
    switch (meta.type) {
      case 'quzi':
        return <QuziBoard onShowRules={goRules} />;
      case 'chengfang':
        return <ChengFangBoard onShowRules={goRules} />;
      case 'tictactoe':
        return <TicTacToeBoard onShowRules={goRules} />;
      case 'hen':
        return <HenBoard onShowRules={goRules} />;
      default:
        return (
          <View className={styles.unknown}>
            <Text className={styles.unknownText}>未知棋局</Text>
          </View>
        );
    }
  };

  return <View className={styles.page}>{renderBoard()}</View>;
};

export default GamePage;
