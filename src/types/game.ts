// 对局玩家：1 = 先手方，2 = 后手方
export type Player = 1 | 2;

export type GameType = 'quzi' | 'chengfang' | 'tictactoe' | 'hen';

// 对局模式：pvp = 双人同屏，pve = 人机对战（玩家始终执先手方）
export type GameMode = 'pvp' | 'pve';

export interface GameMeta {
  type: GameType;
  name: string;
  alias: string;
  desc: string;
  players: [string, string];
  pieces: string;
  tags: string[];
  rules: string[];
  tip: string;
}
