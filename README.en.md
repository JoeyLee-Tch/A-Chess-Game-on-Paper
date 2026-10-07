# Paper Board Games (纸上棋局)

[简体中文](README.md) | English

A mini-program that recreates classic paper-and-pencil board games, built with [Taro](https://taro.zone) + React. It includes 4 traditional games, supporting both local two-player matches and games against built-in AI opponents.

## Included Games

| Game | Alias | One-line Description |
| --- | --- | --- |
| Quzi (区字棋) | Bi Si Niu · San Qi | Move 3 pieces on a 9-point grid; trap your opponent so they have no legal move |
| Chengfang (成方棋) | Wu Zi Fei · Liu Cheng San | Place then move pieces; form a line of three to capture, capture all to win |
| Tic-Tac-Toe (井字棋) | O's & X's | Draw O/X on a 3×3 grid; three in a row wins |
| Old Hen (老母鸡棋) | Zhua Xiao Ji | 1 hen jumps to eat 5 chicks; the chicks win by trapping the hen |

## Features

- **Two-player mode**: play on the same screen, taking turns
- **AI mode**: a dedicated AI for each game (`src/utils/ai/`) with a thinking delay, supporting multi-step turns (select → move, capture after forming a line, chained jumps)
- **Rules center**: full rules and strategy tips for every game
- **Multi-platform**: primarily WeChat Mini Program, also supports H5, Alipay, Douyin Mini Program, etc. (cloud functions automatically fall back to local mocks on non-WeChat platforms)

## Tech Stack

- [Taro](https://taro.zone) 4.x (webpack5 compiler)
- React 18 + TypeScript
- Zustand (state management)
- Sass + CSS Modules (only `*.module.scss` takes effect)
- Design width 375px (auto-converted by pxtransform)

## Quick Start

```bash
# Install dependencies
npm install

# WeChat Mini Program dev mode (compile dist, then import the project root in WeChat DevTools)
npm run dev:weapp

# H5 dev mode
npm run dev:h5

# Production build
npm run build:weapp
npm run build:h5
```

Other platforms: `dev:alipay` / `dev:tt` / `dev:qq` / `dev:swan` / `dev:jd` / `dev:rn` / `dev:quickapp`.

### WeChat Cloud Development

Cloud function calls are wrapped in [src/services/cloud.ts](file:///d:/Project/YouXi/src/services/cloud.ts). On WeChat, call `Taro.cloud.init` with your environment ID before use; on non-WeChat platforms, local mock implementations from `src/data/` are imported automatically.

## Directory Structure

```
├── config/                  # Taro build config (index / dev / prod)
├── src/
│   ├── app.config.ts        # Global config: pages, navigation bar, TabBar
│   ├── pages/
│   │   ├── index/           # Game list (home)
│   │   ├── game/            # Play page (loads the board by type)
│   │   ├── rules/           # Rules page
│   │   └── about/           # About page
│   ├── components/
│   │   ├── GameShell/       # Play page shell (mode switch, restart, etc.)
│   │   ├── GameCard/        # Game card on the home page
│   │   ├── BoardView/       # Generic board container
│   │   ├── Piece/           # Generic game piece
│   │   └── {Quzi,ChengFang,TicTacToe,Hen}Board/  # Per-game board components
│   ├── utils/
│   │   ├── games/           # Core rule logic for each game
│   │   └── ai/              # AI strategies for each game
│   ├── hooks/
│   │   └── useAiTurn.ts     # AI turn scheduling (delay + nonce driven)
│   ├── data/games.ts        # Game metadata (names, rules text, tags)
│   ├── services/cloud.ts    # Cloud function wrapper (mock fallback off WeChat)
│   ├── types/game.ts        # Game-related type definitions
│   └── styles/              # Theme, variables, compatibility styles
└── project.config.json      # WeChat Mini Program project config
```

## Adding a New Game

1. Implement the core rules in `src/utils/games/` (moves, win/loss detection)
2. Implement the corresponding AI in `src/utils/ai/`
3. Create an `XxxBoard` board component under `src/components/` and register it on the `game` page
4. Add the `GameMeta` entry (name, rules text, tags, etc.) in `src/data/games.ts`

## License

This project is open-sourced under the [GPL-2.0](file:///d:/Project/YouXi/LICENSE) (GNU General Public License v2).

You are free to use, study, and modify this project, but any derivative works or redistributions must also be licensed under GPL-2.0.

Copyright (c) 2026 JoeyLee-Tch
