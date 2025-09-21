# Clipboard Viewer

一个功能强大的跨平台剪贴板管理工具，基于 Electron + React + TypeScript 构建。

## 功能特性

### 🎯 核心功能
- **实时剪贴板监控** - 自动捕获和保存剪贴板内容
- **多格式支持** - 支持文本、图片、文件等多种格式
- **智能搜索** - 快速搜索历史剪贴板内容
- **标签管理** - 为剪贴板项目添加自定义标签
- **收藏功能** - 收藏重要的剪贴板内容

### 🎨 用户界面
- **现代化设计** - 基于 Mantine UI 的精美界面
- **主题切换** - 支持浅色/深色/自动主题

- **响应式布局** - 适配不同屏幕尺寸

### ⚙️ 高级设置
- **全局快捷键** - 自定义快捷键快速打开
- **开机自启** - 系统启动时自动运行
- **智能通知** - 剪贴板更新提醒
- **数据管理** - 自动清理和数据导出

## 技术架构

### 前端技术栈
- **Electron** - 跨平台桌面应用框架
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Mantine** - 现代化 React 组件库
- **Vite** - 快速构建工具

### 后端服务
- **Node.js** - 运行时环境
- **SQLite** - 轻量级数据库
- **IPC 通信** - 进程间通信

### 项目结构
```
clipboard-viewer/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.ts         # 应用入口
│   │   ├── windowManager.ts # 窗口管理
│   │   ├── clipboard.ts     # 剪贴板服务
│   │   ├── storage.ts       # 数据存储
│   │   └── config.ts        # 配置管理
│   ├── preload/             # 预加载脚本
│   │   └── index.ts
│   └── renderer/            # 渲染进程
│       ├── main/            # 主窗口
│       │   ├── src/
│       │   │   ├── components/
│       │   │   ├── pages/
│       │   │   ├── hooks/
│       │   │   └── types/
│       │   └── index.html
│       
├── build/                   # 构建资源
├── dist/                    # 构建输出
└── package.json
```

## 开发指南

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 7.0.0（推荐使用 pnpm 作为包管理器）

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
# 启动开发服务器
pnpm run dev

# 或分别启动
pnpm run dev:main      # 主窗口开发服务器

pnpm run dev:electron  # Electron 开发模式
```

### 构建项目
```bash
# 构建所有组件
pnpm run build

# 分别构建
pnpm run build:main      # 构建主窗口

pnpm run build:electron  # 构建 Electron
```

### 打包应用
```bash
# 打包当前平台
pnpm run dist

# 打包所有平台
pnpm run dist:all

# 打包特定平台
pnpm run dist:mac
pnpm run dist:win
pnpm run dist:linux
```

## 使用说明

### 首次启动
1. 下载并安装应用
2. 首次启动会自动创建配置文件
3. 根据需要调整设置选项

### 基本操作
- **查看历史** - 在主窗口浏览剪贴板历史
- **搜索内容** - 使用搜索框快速查找
- **复制内容** - 点击项目重新复制到剪贴板
- **添加标签** - 右键菜单添加自定义标签
- **收藏项目** - 标记重要内容为收藏

### 快捷键
- `Cmd/Ctrl + Shift + V` - 打开主窗口（可自定义）
- `Cmd/Ctrl + F` - 搜索剪贴板内容
- `Cmd/Ctrl + ,` - 打开设置页面
- `Escape` - 关闭窗口



## 配置选项

### 通用设置
- 开机自启动
- 通知开关
- 最大历史记录数
- 主题选择



### 剪贴板设置
- 图片捕获开关
- 文件捕获开关
- 自动清理天数

### 快捷键设置
- 自定义全局快捷键
- 窗口操作快捷键

## 故障排除

### 常见问题

**Q: 应用无法启动**
A: 检查 Node.js 版本是否符合要求，尝试重新安装依赖

**Q: 剪贴板监控不工作**
A: 检查系统权限设置，确保应用有访问剪贴板的权限



**Q: 快捷键不生效**
A: 检查是否与其他应用的快捷键冲突，尝试更换快捷键组合

### 日志文件
应用日志保存在以下位置：
- **macOS**: `~/Library/Logs/clipboard-viewer/`
- **Windows**: `%USERPROFILE%\AppData\Roaming\clipboard-viewer\logs\`
- **Linux**: `~/.config/clipboard-viewer/logs/`

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 编写单元测试
- 更新相关文档

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 更新日志

### v1.0.0
- 初始版本发布
- 基础剪贴板监控功能
- 主窗口界面
- 搜索和标签功能
- 跨平台支持

---

如有问题或建议，请提交 [Issue](https://github.com/your-username/clipboard-viewer/issues)。