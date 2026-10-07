# 纸上棋局

简体中文 | [English](README.en.md)

一款复刻"纸上画格子"传统小游戏的对弈小程序，基于 [Taro](https://taro.zone) + React 构建。收录 4 款经典纸笔棋，支持双人对战与人机对战，内置各棋类的 AI 对手。

## 收录棋类

| 棋类 | 别名 | 玩法一句话 |
| --- | --- | --- |
| 区字棋 | 憋死牛 · 三棋 | 各 3 子沿九宫格走动，把对方憋得无路可走即胜 |
| 成方棋 | 五子飞 · 六成三 | 先下子后走子，连成"三"吃掉对方一子，吃光即胜 |
| 井字棋 | 圈圈叉叉 | 3×3 格内画 O/X，三点一线即胜 |
| 老母鸡棋 | 抓小鸡棋 | 1 只母鸡跳吃 5 只小鸡，小鸡围死母鸡即胜 |

## 功能特性

- **双人对战**：同屏轮流执子
- **人机对战**：每款棋内置独立 AI（`src/utils/ai/`），带思考延时，支持一回合多步操作（选子→走子、成三吃子、连跳）
- **规则中心**：每款棋的完整规则与攻略提示
- **多端适配**：微信小程序为主，支持 H5、支付宝、抖音小程序等（非微信端云函数自动降级为本地 mock）

## 技术栈

- [Taro](https://taro.zone) 4.x（webpack5 编译）
- React 18 + TypeScript
- Zustand（状态管理）
- Sass + CSS Modules（仅 `*.module.scss` 生效）
- 设计稿宽度 375px（pxtransform 自动转换）

## 快速开始

```bash
# 安装依赖
npm install

# 微信小程序开发模式（编译 dist 后用微信开发者工具导入项目根目录）
npm run dev:weapp

# H5 开发模式
npm run dev:h5

# 生产构建
npm run build:weapp
npm run build:h5
```

其他平台：`dev:alipay` / `dev:tt` / `dev:qq` / `dev:swan` / `dev:jd` / `dev:rn` / `dev:quickapp`。

### 微信云开发

云函数调用封装在 [src/services/cloud.ts](file:///d:/Project/YouXi/src/services/cloud.ts)。在微信端使用前需 `Taro.cloud.init` 指定环境 ID；非微信端会自动导入 `src/data/` 下的本地 mock 实现。

## 目录结构

```
├── config/                  # Taro 编译配置（index / dev / prod）
├── src/
│   ├── app.config.ts        # 全局配置：页面注册、导航栏、TabBar
│   ├── pages/
│   │   ├── index/           # 棋局列表（首页）
│   │   ├── game/            # 对弈页（按 type 加载对应棋盘）
│   │   ├── rules/           # 规则页
│   │   └── about/           # 关于页
│   ├── components/
│   │   ├── GameShell/       # 对弈页外壳（模式切换、重开等）
│   │   ├── GameCard/        # 首页游戏卡片
│   │   ├── BoardView/       # 通用棋盘容器
│   │   ├── Piece/           # 通用棋子
│   │   └── {Quzi,ChengFang,TicTacToe,Hen}Board/  # 各棋类棋盘组件
│   ├── utils/
│   │   ├── games/           # 各棋类核心规则逻辑
│   │   └── ai/              # 各棋类 AI 策略
│   ├── hooks/
│   │   └── useAiTurn.ts     # 人机回合调度（延时 + nonce 驱动）
│   ├── data/games.ts        # 棋类元信息（名称、规则文案、标签）
│   ├── services/cloud.ts    # 云函数封装（非微信端降级 mock）
│   ├── types/game.ts        # 游戏相关类型定义
│   └── styles/              # 主题、变量、兼容样式
└── project.config.json      # 微信小程序项目配置
```

## 新增一款棋

1. 在 `src/utils/games/` 下实现核心规则（走子、胜负判定）
2. 在 `src/utils/ai/` 下实现对应 AI
3. 在 `src/components/` 下新建 `XxxBoard` 棋盘组件，并在 `game` 页注册
4. 在 `src/data/games.ts` 中补充 `GameMeta`（名称、规则、标签等）

## 开源协议

本项目基于 [GPL-2.0](file:///d:/Project/YouXi/LICENSE) (GNU General Public License v2) 协议开源。

你可以自由地使用、学习和修改本项目代码，但基于本项目修改或二次分发的作品，同样必须以 GPL-2.0 协议开源。

Copyright (c) 2026 JoeyLee-Tch

