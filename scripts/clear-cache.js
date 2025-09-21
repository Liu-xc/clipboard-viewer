#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 递归删除目录
 * @param {string} dirPath - 要删除的目录路径
 */
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        removeDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    
    fs.rmdirSync(dirPath);
    console.log(`✅ 已删除目录: ${dirPath}`);
  } else {
    console.log(`⚠️  目录不存在: ${dirPath}`);
  }
}

/**
 * 清理 Vite 缓存
 */
function clearViteCache() {
  console.log('🧹 开始清理 Vite 缓存...');
  
  const projectRoot = path.resolve(__dirname, '..');
  const cacheDirectories = [
    path.join(projectRoot, 'node_modules', '.vite'),
    path.join(projectRoot, 'node_modules', '.vite', 'renderer'),
    path.join(projectRoot, 'node_modules', '.vite', 'renderer', 'deps'),
    path.join(projectRoot, 'dist')
  ];
  
  cacheDirectories.forEach(dir => {
    removeDir(dir);
  });
  
  console.log('✨ Vite 缓存清理完成!');
}

/**
 * 清理 npm/pnpm 缓存
 */
function clearPackageManagerCache() {
  console.log('🧹 清理包管理器缓存...');
  
  const { execSync } = require('child_process');
  
  try {
    // 检查是否使用 pnpm
    if (fs.existsSync(path.resolve(__dirname, '..', 'pnpm-lock.yaml'))) {
      console.log('📦 检测到 pnpm，清理 pnpm 缓存...');
      execSync('pnpm store prune', { stdio: 'inherit' });
    } else {
      console.log('📦 清理 npm 缓存...');
      execSync('npm cache clean --force', { stdio: 'inherit' });
    }
    console.log('✅ 包管理器缓存清理完成!');
  } catch (error) {
    console.error('❌ 清理包管理器缓存失败:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧹 Vite 缓存清理工具

用法:
  node scripts/clear-cache.js [选项]

选项:
  --vite-only    只清理 Vite 缓存
  --pm-only      只清理包管理器缓存
  --all          清理所有缓存 (默认)
  --help, -h     显示帮助信息

示例:
  node scripts/clear-cache.js
  node scripts/clear-cache.js --vite-only
  node scripts/clear-cache.js --pm-only
`);
    return;
  }
  
  if (args.includes('--vite-only')) {
    clearViteCache();
  } else if (args.includes('--pm-only')) {
    clearPackageManagerCache();
  } else {
    // 默认清理所有缓存
    clearViteCache();
    clearPackageManagerCache();
  }
  
  console.log('\n🎉 缓存清理完成! 现在可以重新启动开发服务器。');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  clearViteCache,
  clearPackageManagerCache,
  main
};