#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const ElectronManager = require('./dev-electron-managed');

// 进程管理
class ProcessManager {
  constructor() {
    this.frontendProcesses = new Map();
    this.electronManager = null;
    this.isShuttingDown = false;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    // 监听退出信号
    process.on('SIGINT', () => this.handleExit('SIGINT'));
    process.on('SIGTERM', () => this.handleExit('SIGTERM'));
    process.on('exit', () => this.cleanup());
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('❌ 未捕获的异常:', error);
      this.handleExit('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ 未处理的Promise拒绝:', reason);
      this.handleExit('unhandledRejection');
    });
  }

  async handleExit(signal) {
    if (this.isShuttingDown) {
      console.log('🔄 正在关闭中，请稍候...');
      return;
    }
    
    this.isShuttingDown = true;
    console.log(`\n🛑 收到 ${signal} 信号，开始关闭所有进程...`);
    
    await this.closeAllProcesses();
    console.log('✅ 所有进程已停止');
    process.exit(0);
  }

  startFrontendProcess(name, command, args, options = {}) {
    console.log(`🚀 启动前端服务 ${name}...`);
    
    const process = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      stdio: options.stdio || 'inherit',
      detached: false,
      ...options
    });
    
    this.frontendProcesses.set(name, {
      process,
      name,
      startTime: Date.now()
    });
    
    process.on('close', (code, signal) => {
      console.log(`📦 前端服务 ${name} 退出 (代码: ${code}, 信号: ${signal})`);
      this.frontendProcesses.delete(name);
    });
    
    process.on('error', (error) => {
      console.error(`❌ 前端服务 ${name} 错误:`, error);
      this.frontendProcesses.delete(name);
    });
    
    console.log(`✅ 前端服务 ${name} 已启动 (PID: ${process.pid})`);
    return process;
  }

  async terminateFrontendProcess(name, processInfo, timeout = 5000) {
    const { process: proc } = processInfo;
    
    if (!proc || proc.killed) {
      console.log(`📦 前端服务 ${name} 已经终止`);
      return;
    }
    
    console.log(`🛑 正在终止前端服务 ${name} (PID: ${proc.pid})...`);
    
    try {
      // 首先尝试优雅关闭
      proc.kill('SIGTERM');
      
      // 等待进程退出
      const exitPromise = new Promise((resolve) => {
        proc.on('exit', resolve);
      });
      
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log(`⚠️  前端服务 ${name} 在 ${timeout}ms 内未退出，强制终止...`);
          if (!proc.killed) {
            proc.kill('SIGKILL');
          }
          resolve();
        }, timeout);
      });
      
      await Promise.race([exitPromise, timeoutPromise]);
      
    } catch (error) {
      console.error(`❌ 终止前端服务 ${name} 时出错:`, error);
      try {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      } catch (killError) {
        console.error(`❌ 强制终止前端服务 ${name} 失败:`, killError);
      }
    }
  }

  async clearPorts(ports) {
    console.log('🧹 清理端口占用...');
    
    for (const port of ports) {
      try {
        const { spawn } = require('child_process');
        await new Promise((resolve) => {
          const lsof = spawn('lsof', ['-ti', `:${port}`], { stdio: 'pipe' });
          let pids = '';
          
          lsof.stdout.on('data', (data) => {
            pids += data.toString();
          });
          
          lsof.on('close', (code) => {
            if (code === 0 && pids.trim()) {
              const pidList = pids.trim().split('\n').filter(pid => pid);
              pidList.forEach(pid => {
                try {
                  process.kill(parseInt(pid), 'SIGKILL');
                  console.log(`✅ 已清理端口 ${port} 的进程 (PID: ${pid})`);
                } catch (error) {
                  // 进程可能已经不存在
                }
              });
            } else {
              console.log(`🔌 端口 ${port} 未被占用或已清理`);
            }
            resolve();
          });
          
          lsof.on('error', () => resolve());
        });
      } catch (error) {
        console.error(`❌ 清理端口 ${port} 时出错:`, error);
      }
    }
  }

  async closeAllProcesses() {
    console.log('🛑 开始关闭所有进程...');
    
    // 关闭 Electron 管理器
    if (this.electronManager) {
      console.log('🔄 关闭 Electron 管理器...');
      await this.electronManager.stopElectron();
      this.electronManager = null;
    }
    
    // 并行终止所有前端进程
    const terminationPromises = [];
    
    for (const [name, processInfo] of this.frontendProcesses) {
      terminationPromises.push(this.terminateFrontendProcess(name, processInfo));
    }
    
    // 等待所有前端进程终止
    await Promise.all(terminationPromises);
    
    // 清理端口
    await this.clearPorts([5173, 3000, 8080, 8081]);
    
    // 额外的进程清理
    await this.cleanupProcesses();
    
    this.frontendProcesses.clear();
    console.log('✅ 所有进程已关闭');
  }

  async cleanupProcesses() {
    console.log('🧹 执行额外的进程清理...');
    
    const cleanupCommands = [
      // 清理可能残留的 Vite 进程
      "pkill -f 'vite'",
      "pkill -f 'dev:renderer'",

      // 清理 Node 进程
      "pkill -f 'node.*5173'",
      
    ];
    
    for (const cmd of cleanupCommands) {
      try {
        await new Promise((resolve) => {
          exec(cmd, (error) => {
            // 忽略错误，因为进程可能已经不存在
            resolve();
          });
        });
      } catch (error) {
        // 忽略清理错误
      }
    }
  }

  // 获取进程状态
  getStatus() {
    const status = {};
    for (const [name, info] of this.frontendProcesses) {
      status[name] = {
        pid: info.process.pid,
        running: !info.process.killed,
        uptime: Date.now() - info.startTime
      };
    }
    return status;
  }
}

// 主函数
async function main() {
  const manager = new ProcessManager();
  
  console.log('🚀 启动完整开发环境 (前端 + 客户端)...');
  console.log('💡 按 Ctrl+C 退出并自动清理所有进程\n');
  
  try {
    // 启动前端服务
    console.log('📦 启动前端服务...');
    
    manager.startFrontendProcess(
      'renderer',
      'pnpm',
      ['run', 'dev:renderer'],
      {
        stdio: 'inherit'
      }
    );
    

    
    // 等待前端服务就绪，然后启动 Electron
    console.log('⏳ 等待前端服务就绪...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // 给前端服务一些启动时间
    
    console.log('📱 启动 Electron 客户端管理器...');
    manager.electronManager = new ElectronManager();
    await manager.electronManager.start();
    
    // 定期显示状态
    setInterval(() => {
      const status = manager.getStatus();
      if (Object.keys(status).length > 0) {
        const runningProcesses = Object.keys(status).length;
        if (runningProcesses > 0) {
          console.log(`\n📊 [状态] 运行中的前端服务: ${Object.keys(status).join(', ')}`);
        }
      }
    }, 30000); // 每30秒显示一次状态
    
  } catch (error) {
    console.error('❌ 启动进程时发生错误:', error);
    await manager.closeAllProcesses();
    process.exit(1);
  }
}

// 启动应用
if (require.main === module) {
  main().catch(error => {
    console.error('应用启动失败:', error);
    process.exit(1);
  });
}

module.exports = { ProcessManager };