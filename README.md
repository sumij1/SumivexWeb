#SumivexJavaScript Web

包含首页、游玩服务器／加入我们页、桌面和手机适配、手机菜单。纯 HTML、CSS 和原生 JavaScript，无框架依赖、无需安装或构建。V1 保存在原来的 `sumivex-web/`，本包独立使用。

## 打开与运行

解压 ZIP 后，双击 `index.html` 即可浏览（请保留目录结构）。推荐使用本地 HTTP 预览：

```sh
npm start
```

或者直接运行 `node server.mjs`，然后打开 `http://127.0.0.1:4173`。需要 Node.js 18 或更新版本，不需要执行 `npm install`。端口被占用时，可设置 `PORT` 环境变量。预览服务器只绑定本机，按 Ctrl+C 停止。

## 文件

- `index.html`：轮播首屏、姊妹工作室和贡献人员。
- `join.html`：游玩 ROH 服务器、服务器宣传片、QQ群和提问入口。
- `assets/site.css`：黑色主题、响应式布局与轮播渐变。
- `assets/site.js`：菜单打开／关闭、Escape 原生处理、焦点恢复、随机轮播和音乐控制。
- `assets/config.js`：背景音乐路径及音量配置。
- `assets/`：从 Figma 导出的真实 Logo、主视觉 SVG、两位成员头像、Minecraft 示意图、趣味配图。
- `assets/fonts/`：随包提供 Noto Sans SC 和 Space Grotesk，含 SIL Open Font License；无需第三方字体 CDN。
- `favicon.svg`：沿用既有绿色透明站点图标。
- `server.mjs`：可选的本机静态预览服务器。
- `tests/check.mjs`：资源、内部链接、菜单和音频状态测试。
- `QA.md`：本次验证结果和剩余素材。

## 已实现的交互

首页导览、工作室和团队锚点；加入页及返回首页；跨页准确跳到工作室／团队；手机全屏菜单、关闭按钮、Escape、原生 dialog 焦点圈定、焦点恢复、菜单链接点击后关闭、桌面断点自动关闭菜单；工作室外链；邮箱 `mailto:`。QQ 群号作为文字展示，未提供邀请 URL，因此不猜测链接。所有页面都能在关闭 JavaScript 时阅读；手机导航也提供无脚本回退。

## 背景音乐

当前配置使用 `assets/sumivex song.mp3`。进入首页与加入页时会立即尝试播放；若浏览器拦截带声音的自动播放，音乐按钮会显示「开始音乐」，供访客手动启动。播放中点击按钮会停止音乐。

替换音频时，将文件放入 `assets/`，再更新 `assets/config.js` 的 `musicSrc`。音量范围为 0–1。

AGM 使用本地 `AGMlogo.jpg`；加入页嵌入服务器内实拍宣传片。Sumirona 图片位预留在首页代码中，并附有替换说明。

## 验证与发布

```sh
npm test
node --check assets/site.js
```

上传到静态托管时，只需上传 `index.html`、`join.html`、`favicon.svg` 和完整的 `assets/`，无需运行 Node.js。本次仅交付本地源码和 ZIP，没有发布网站或更改域名／电邮配置。

