export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/rules/index',
    'pages/about/index',
    'pages/game/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    backgroundColor: '#f3ead7',
    navigationBarBackgroundColor: '#f3ead7',
    navigationBarTitleText: '纸上棋局',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#b5512a',
    backgroundColor: '#fdf7ea',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '棋局',
        iconPath: 'assets/tabbar/home.svg',
        selectedIconPath: 'assets/tabbar/home-selected.svg'
      },
      {
        pagePath: 'pages/rules/index',
        text: '规则',
        iconPath: 'assets/tabbar/rules.svg',
        selectedIconPath: 'assets/tabbar/rules-selected.svg'
      },
      {
        pagePath: 'pages/about/index',
        text: '关于',
        iconPath: 'assets/tabbar/about.svg',
        selectedIconPath: 'assets/tabbar/about-selected.svg'
      }
    ]
  }
})
