#!/usr/bin/env node
const path = require('path');
const { exec, spawn } = require('child_process');

class ElectronManager {
  constructor() {
    this.electronProcess = null;
    this.isShuttingDown = false;
    this.setupSignalHandlers();
  }

  setupSignalHandlers () {
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

  async handleExit (signal) {
    if (this.isShuttingDown) {
      console.log('🔄 正在关闭中，请稍候...');
      return;
    }

    this.isShuttingDown = true;
    console.log(`\n🛑 收到 ${signal} 信号，开始关闭 Electron 客户端...`);

    await this.stopElectron();
    console.log('✅ Electron 客户端已完全停止');
    process.exit(0);
  }

  async waitForFrontend () {
    console.log('⏳ 等待前端服务器就绪...');
    console.log('🔍 检查服务: http://localhost:3000 和 http://localhost:5174');

    return new Promise((resolve, reject) => {
      const waitOn = spawn('npx', ['wait-on', 'http://localhost:3000', 'http://localhost:5174'], {
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      waitOn.stdout.on('data', (data) => {
        output += data.toString();
        console.log('📡 wait-on:', data.toString().trim());
      });

      waitOn.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log('⚠️  wait-on stderr:', data.toString().trim());
      });

      waitOn.on('close', (code) => {
        if (code === 0) {
          console.log('✅ 前端服务器已就绪');
          resolve();
        } else {
          console.error('❌ 等待前端服务器超时或失败');
          console.error('📝 输出:', output);
          console.error('📝 错误输出:', errorOutput);
          reject(new Error(`wait-on 退出码: ${code}`));
        }
      });

      waitOn.on('error', (error) => {
        console.error('❌ wait-on 执行错误:', error);
        console.error('📝 错误详情:', error.message);
        reject(error);
      });
    });
  }

  async startElectron () {
    try {
      console.log('🚀 启动 Electron 客户端...');

      this.electronProcess = spawn('pnpm', ['run', 'dev:electron'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        detached: false
      });

      this.electronProcess.on('close', (code, signal) => {
        console.log(`📱 Electron 进程退出 (代码: ${code}, 信号: ${signal})`);
        if (!this.isShuttingDown) {
          console.log('🔄 Electron 意外退出，开始清理...');
          this.handleExit('electron-exit');
        }
      });

      this.electronProcess.on('error', (error) => {
        console.error('❌ Electron 启动错误:', error);
        this.handleExit('electron-error');
      });

      console.log(`✅ Electron 客户端已启动 (PID: ${this.electronProcess.pid})`);

    } catch (error) {
      console.error('❌ 启动 Electron 失败:', error);
      throw error;
    }
  }

  async stopElectron () {
    if (!this.electronProcess) {
      console.log('📱 Electron 进程未运行');
      return;
    }

    console.log('🛑 正在停止 Electron 进程...');

    try {
      // 优雅关闭
      this.electronProcess.kill('SIGTERM');

      // 直接监听进程关闭事件
      await new Promise((resolve) => {
        if (this.electronProcess) {
          this.electronProcess.on('close', () => {
            console.log('✅ Electron 进程已关闭');
            resolve();
          });
        } else {
          resolve();
        }
      });

      // 清理相关进程
      await this.cleanupElectronProcesses();

    } catch (error) {
      console.error('❌ 停止 Electron 进程时出错:', error);
      console.error('📝 错误详情:', error.message);
      console.error('📝 错误堆栈:', error.stack);
    }

    this.electronProcess = null;
  }

  async cleanupElectronProcesses () {
    console.log('🧹 清理 Electron 相关进程...');

    const cleanupCommands = [
      // 清理 Electron 进程
      "pkill -f 'electron'",
      "pkill -f 'Electron'",
      // 清理可能残留的 Node 进程
      "pkill -f 'dev:electron'"
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

  cleanup () {
    if (this.electronProcess && !this.electronProcess.killed) {
      this.electronProcess.kill('SIGKILL');
    }
  }

  async start () {
    try {
      console.log('🎯 Electron 客户端管理器启动');
      console.log('📝 注意：请确保前端服务器已启动 (pnpm run dev:renderer && pnpm run dev:floating)');

      // 等待前端服务器就绪
      await this.waitForFrontend();

      // 启动 Electron
      await this.startElectron();

      console.log('\n🎉 Electron 客户端管理器运行中...');
      console.log('💡 按 Ctrl+C 退出并自动清理进程');

    } catch (error) {
      console.error('❌ 启动失败:', error);
      process.exit(1);
    }
  }
}

// 启动管理器
if (require.main === module) {
  const manager = new ElectronManager();
  manager.start();
}

module.exports = ElectronManager;