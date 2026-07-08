# 🌌 William新星防御 | William Nova Defense

致敬经典街机游戏《导弹指挥官》（Missile Command）的现代 Web 塔防射击游戏。

本游戏采用 **React 19 + TypeScript + Tailwind CSS (v4) + HTML5 Canvas** 深度构建，具有高度流畅的 60fps 游戏主循环、基于物理距离的精准碰撞检测、完全由 Web Audio API 实时合成的复古 8-bit 电子音效，以及兼顾 PC（鼠标）与移动端（触摸）的高性能自适应布局。

---

## 🎮 核心玩法 / Core Gameplay

### 1. 防御目标 (Defensive Objectives)
- 屏幕底部驻扎着 **6座城市建筑** 和 **3座导弹发射炮台**（左侧、中央、右侧）。
- 敌方火箭源源不断从屏幕上方坠落。若城市被击中将**永久摧毁**（当前本局内不可恢复）。

### 2. 拦截操作 (Interceptor Launch)
- **操作方式**：玩家点击或触摸屏幕任意位置，距离目标落点**最近**且**拥有剩余弹药**的活性炮台将立即发射一枚高速拦截导弹。
- **范围爆炸**：导弹到达落点（用 X 标出）会产生巨大的环状能量冲击波，吞噬半径内的任何敌方火箭。
- **预判技巧**：敌方火箭具有动态速度。玩家必须像优秀的指挥官一样，**根据轨迹提前预判瞄准点**，在火箭落下的前方引爆，才能获得完美拦截。

### 3. 弹药管理 (Resource Allocation)
- 各座炮台弹药相互独立：**左侧 20 发、中央 40 发、右侧 20 发**。
- **关卡结算**：每一轮（Wave）完全肃清残敌后，所有剩余弹药将以 **10分/发** 折算为奖励分数，并自动满额补给，同时被击损的炮台也将自动修缮重开。

### 4. 难度曲线 & 胜负机制 (Difficulty & Game Rules)
- **胜出条件**：保卫家园，当累计得分达到 **1000 分** 时大捷通关！
- **失败条件**：三座防御炮台全部失守（被火箭命中瘫痪），防御网络全面崩溃，游戏结束。
- **难度曲线**：随着你的分数不断提高，敌机火箭的下落速度、刷怪频次、单波火箭上限都将自适应极速提升。

---

## 🛠️ 项目技术栈与工程高光 (Architecture & Design Highlights)

1. **六十帧流畅循环**：利用浏览器底层的 `requestAnimationFrame` 驱动高精度 canvas 引擎，规避 React 虚拟 DOM 状态重渲染带来的卡顿，确保极限高刷下的射击手感。
2. **逻辑分辨率映射**：内部物理引擎在固定的 `800 × 600` 虚拟网格中计算移动、边界、速度及基于勾股定理的圆形碰撞检测。通过自动 ResizeObserver 获取父容器物理空间并实时重置 `ctx.scale`，实现**零拉伸失真、无感全自适应**的跨端体验。
3. **Web Audio 纯合成音效**：在 `src/sound.ts` 内使用 **Web Audio API** 的 `OscillatorNode`（振荡器）、`BiquadFilterNode`（滤波器）和 `AudioBuffer` 现场创造并叠加高阶白噪音。免去音频文件网络延迟，实现真正的零资源毫秒级微波拉丝、雷声轰鸣与凯旋乐章！
4. **全面的国际化适配**：极简的一键式 **双语（中/英）本地化**，结合 `localStorage` 自动记忆当前用户的语言倾向与音效偏好。

---

## 📂 项目结构说明 (Codebase Architecture)

```bash
/src
  ├── types.ts          # 核心类型接口声明（Rockets, Explosions, Particles, Battery）
  ├── i18n.ts           # 中英文双语互译本地化字典
  ├── sound.ts          # Web Audio API Chiptune 8-bit 声音合成管理器
  ├── App.tsx           # 主页面容器、控制舱 HUD 仪表盘与 localStorage 同步
  ├── main.tsx          # React 应用入口
  ├── index.css         # 全局样式导入、Inter + JetBrains Mono 字体绑定与美化
  └── components
      ├── GameCanvas.tsx  # HTML5 Canvas 物理引擎、碰撞判定、粒子系统及屏幕振动
      ├── GameUI.tsx      # 欢迎页面、暂停叠加卡、胜利/败战弹窗与过渡动画
      ├── LanguageSelector.tsx # 极光风格语言切换开关
      └── SoundToggle.tsx      # 8位复古声波静音按钮
```

---

## 🚀 启动与构建指南 (Setup & Deployment Instructions)

### 依赖安装
在项目根目录下，运行以下命令安装基础开发库（包含 React 19、Motion 动画库及 Lucide 图标集）：
```bash
npm install
```

### 启动开发服务器
启动本地开发调试服务器（热重载，默认绑定 `3000` 端口）：
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始捍卫新星！

### 生产环境打包
编译并打包出极度压缩的、符合生产交付标准的静态资源至 `dist/` 文件夹：
```bash
npm run build
```

---

## 👑 艺术与操作秘籍 (Tips for High Scores)
- **多发预判连爆**：火箭的移动速度各不相同，不要对着火箭头部直接开火。在火箭下落轨道的十字交叉处设伏，引爆单枚拦截弹能一次消灭多颗挤在一起的火箭！
- **保护中央发射塔**：中央炮台备弹最为充足（40发）。若中央炮台不幸瘫痪，防线火力将打折 50% 以上，务必最优先拦截落向中央发射塔的火箭。
- **弹药盈余换分**：当胜券在握时，保持理智冷静，不过度铺张导弹，剩余弹药在每轮结束能带给你丰厚的奖励分，是跨越 1000 分大关的重要捷径！

---

## 🚀 同步 GitHub 与 部署至 Vercel 指南 (GitHub & Vercel Deployment)

为了便于你将该游戏同步到个人 GitHub 仓库并自动部署到 Vercel 平台，请参照以下两个模块的指引：

### 第一步：将本地代码同步至 GitHub (Sync to GitHub)

若你在本地电脑（或导出 ZIP 源码后）：
1. **初始化本地 Git 仓库**（如未初始化）：
   ```bash
   git init
   git add .
   git commit -m "feat: init William Nova Defense"
   ```
2. **在 GitHub 上创建一个新的空白仓库**（不要勾选 Initialize this repository with a README）。
3. **关联远程仓库并推送到 GitHub**：
   ```bash
   # 请将 <YOUR_GITHUB_USERNAME> 和 <YOUR_REPO_NAME> 替换为你的真实账户和仓库名
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```

---

### 第二步：导入并一键部署至 Vercel (Deploy to Vercel)

Vercel 能够 100% 完美支持 React + Vite 静态打包项目的托管与自动化部署：

1. 打开并登录 [Vercel 官网](https://vercel.com/)。
2. 点击右上角的 **"Add New"** -> **"Project"**。
3. 在左侧导入选项中，授权并绑定你的 GitHub 账号，找到你刚刚推送的仓库并点击 **"Import"**。
4. **配置项目参数 (Configure Project)**：
   - **Framework Preset**（框架预设）：选择 **Vite**（Vercel 会自动识别并选用）。
   - **Root Directory**：保留默认的 `./`（即项目根目录）。
   - **Build and Output Settings**（打包及输出设置）：
     - Build Command: `npm run build` (或 `vite build`)
     - Output Directory: `dist`
     - Install Command: `npm install`
   *(上述设置 Vercel 均能自动读取识别，直接点击 "Deploy" 即可)*
5. 点击 **"Deploy"** 按钮，大约 30 秒内即可完成全球 CDN 构建部署！

#### 💡 SPA 路由重定向配置 (可选)
尽管本游戏是纯单页客户端 Canvas 游戏，不涉及前端子路由切换。如果你后续计划使用 React-Router 增加其它子页面，可以在根目录下新建一个 `vercel.json` 文件来配置路由重写，以防止刷新出现 404：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
配置完成后，每次你往 GitHub 提交 (`git push`) 代码时，Vercel 都会**全自动监听并自动触发新一轮的增量部署更新**。

