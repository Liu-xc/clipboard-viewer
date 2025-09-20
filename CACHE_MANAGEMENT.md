# Vite 缓存管理指南

本项目已集成了完整的 Vite 缓存管理解决方案，用于解决 `node_modules/.vite` 缓存过期导致前端拉取资源报 504 错误的问题。

## 🚀 快速开始

### 推荐使用方式

```bash
# 智能开发模式（推荐）- 自动检测缓存健康状态
pnpm run dev:smart

# 或者强制清理缓存后启动
pnpm run dev:clean
```

### 手动缓存管理

```bash
# 清理所有缓存
pnpm run clear-cache

# 只清理 Vite 缓存
pnpm run clear-cache:vite

# 只清理包管理器缓存
pnpm run clear-cache:pm

# 查看缓存清理帮助
pnpm run clear-cache:help
```

## 📋 可用脚本

| 脚本命令 | 描述 |
|---------|------|
| `pnpm run dev:smart` | 智能开发模式，自动检测缓存健康状态并在需要时清理 |
| `pnpm run dev:clean` | 强制清理缓存后启动开发服务器 |
| `pnpm run build:clean` | 强制清理缓存后构建项目 |
| `pnpm run clear-cache` | 清理所有缓存（Vite + 包管理器） |
| `pnpm run clear-cache:vite` | 只清理 Vite 缓存 |
| `pnpm run clear-cache:pm` | 只清理包管理器缓存 |
| `pnpm run clear-cache:help` | 显示缓存清理帮助信息 |

## 🔧 配置说明

### Vite 配置优化

项目中的两个 Vite 配置文件已经优化：

- `src/renderer/main/vite.config.ts` - 主渲染器配置
- `src/renderer/floating/vite.config.ts` - 浮动窗口配置

主要优化内容：

1. **独立缓存目录**：为每个渲染器设置独立的缓存目录
2. **强制重新构建**：通过环境变量 `CLEAR_CACHE=true` 控制
3. **依赖预构建**：明确指定需要预构建的依赖
4. **缓存策略**：优化缓存存储和读取策略

### 环境变量

- `CLEAR_CACHE=true` - 强制清理缓存并重新构建依赖

## 🛠️ 故障排除

### 常见问题

#### 1. 前端资源 504 错误

**症状**：开发服务器启动后，浏览器加载资源时出现 504 错误

**解决方案**：
```bash
# 方案 1：使用智能开发模式
pnpm run dev:smart

# 方案 2：手动清理缓存
pnpm run clear-cache && pnpm run dev

# 方案 3：强制清理缓存
CLEAR_CACHE=true pnpm run dev
```

#### 2. 缓存过期警告

**症状**：启动时看到缓存过期警告

**解决方案**：
```bash
# 智能开发模式会自动处理
pnpm run dev:smart

# 或手动清理
pnpm run clear-cache:vite
```

#### 3. 依赖更新后的问题

**症状**：更新依赖后出现模块解析错误

**解决方案**：
```bash
# 清理所有缓存
pnpm run clear-cache

# 重新安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

### 高级故障排除

#### 手动清理特定缓存

```bash
# 只清理主渲染器缓存
rm -rf node_modules/.vite/main

# 只清理浮动窗口缓存
rm -rf node_modules/.vite/floating

# 清理所有 Vite 缓存
rm -rf node_modules/.vite

# 清理构建输出
rm -rf dist
```

#### 强制重新构建

```bash
# 设置环境变量强制重新构建
export CLEAR_CACHE=true
pnpm run dev

# 或者一次性设置
CLEAR_CACHE=true pnpm run dev
```

## 🔍 缓存健康检查

智能开发模式 (`pnpm run dev:smart`) 会自动执行以下检查：

1. **缓存目录存在性检查**
2. **缓存文件完整性检查**
3. **缓存年龄检查**（超过 7 天自动清理）
4. **依赖变更检查**

## 📁 缓存目录结构

```
node_modules/
└── .vite/
    ├── main/           # 主渲染器缓存
    │   └── deps/       # 依赖预构建缓存
    └── floating/       # 浮动窗口缓存
        └── deps/       # 依赖预构建缓存
```

## 💡 最佳实践

1. **日常开发**：使用 `pnpm run dev:smart`，让系统自动管理缓存
2. **遇到问题**：首先尝试 `pnpm run dev:clean`
3. **依赖更新后**：运行 `pnpm run clear-cache` 清理所有缓存
4. **CI/CD 环境**：使用 `pnpm run build:clean` 确保干净构建
5. **定期维护**：每周运行一次 `pnpm run clear-cache` 清理过期缓存

## 🔄 自动化建议

可以在 `.gitignore` 中确保缓存目录被忽略：

```gitignore
# Vite 缓存
node_modules/.vite/

# 构建输出
dist/
```

## 📞 支持

如果遇到缓存相关问题：

1. 查看本文档的故障排除部分
2. 运行 `pnpm run clear-cache:help` 查看详细选项
3. 检查控制台输出的错误信息
4. 尝试完全清理后重新开始：
   ```bash
   pnpm run clear-cache
   rm -rf node_modules
   pnpm install
   pnpm run dev:smart
   ```