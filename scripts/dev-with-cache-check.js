#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { clearViteCache } = require('./clear-cache');

/**
 * 检查缓存是否过期或损坏
 */
function checkCacheHealth() {
  console.log('🔍 检查 Vite 缓存健康状态...');
  
  const projectRoot = path.resolve(__dirname, '..');
  const cacheDirectories = [
    path.join(projectRoot, 'node_modules', '.vite', 'main'),
    path.join(projectRoot, 'node_modules', '.vite', 'floating')
  ];
  
  let needsCacheClean = false;
  
  // 检查缓存目录是否存在且不为空
  cacheDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        console.log(`⚠️  缓存目录为空: ${dir}`);
        needsCacheClean = true;
      } else {
        // 检查缓存文件的修改时间
        const stats = fs.statSync(dir);
        const now = new Date();
        const cacheAge = now - stats.mtime;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
        
        if (cacheAge > maxAge) {
          console.log(`⚠️  缓存过期 (${Math.floor(cacheAge / (24 * 60 * 60 * 1000))} 天): ${dir}`);
          needsCacheClean = true;
        }
      }
    } else {
      console.log(`ℹ️  缓存目录不存在: ${dir}`);
    }
  });
  
  return needsCacheClean;
}

/**
 * 检查是否有环境变量强制清理缓存
 */
function shouldForceClearCache() {
  return process.env.CLEAR_CACHE === 'true' || process.argv.includes('--clear-cache');
}

/**
 * 启动开发服务器
 */
function startDevServer() {
  console.log('🚀 启动开发服务器...');
  
  // 设置环境变量
  const env = { ...process.env };
  if (shouldForceClearCache()) {
    env.CLEAR_CACHE = 'true';
  }
  
  // 使用 npm run dev 启动
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env,
    shell: true
  });
  
  // 处理进程退出
  devProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ 开发服务器退出，代码: ${code}`);
      
      // 如果是 504 错误相关，建议清理缓存
      if (code === 1) {
        console.log('\n💡 提示: 如果遇到 504 错误，请尝试运行:');
        console.log('   npm run dev:clean');
        console.log('   或者');
        console.log('   npm run clear-cache && npm run dev');
      }
    }
  });
  
  // 处理中断信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止开发服务器...');
    devProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    devProcess.kill('SIGTERM');
  });
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 智能开发服务器启动器

用法:
  node scripts/dev-with-cache-check.js [选项]

选项:
  --clear-cache    强制清理缓存后启动
  --skip-check     跳过缓存健康检查
  --help, -h       显示帮助信息

环境变量:
  CLEAR_CACHE=true 强制清理缓存

示例:
  node scripts/dev-with-cache-check.js
  node scripts/dev-with-cache-check.js --clear-cache
  CLEAR_CACHE=true node scripts/dev-with-cache-check.js
`);
    return;
  }
  
  console.log('🎯 智能开发服务器启动器');
  console.log('=' .repeat(50));
  
  // 检查是否需要清理缓存
  let needsCacheClean = false;
  
  if (shouldForceClearCache()) {
    console.log('🧹 检测到强制清理缓存标志');
    needsCacheClean = true;
  } else if (!args.includes('--skip-check')) {
    needsCacheClean = checkCacheHealth();
  }
  
  // 清理缓存（如果需要）
  if (needsCacheClean) {
    console.log('\n🧹 正在清理缓存...');
    clearViteCache();
    console.log('✅ 缓存清理完成\n');
  } else {
    console.log('✅ 缓存状态良好\n');
  }
  
  // 启动开发服务器
  startDevServer();
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkCacheHealth,
  shouldForceClearCache,
  startDevServer,
  main
};