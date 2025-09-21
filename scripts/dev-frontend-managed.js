const { spawn, exec } = require('child_process');
const path = require('path');

class FrontendManager {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
    
    // 绑定信号处理
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('exit', () => this.cleanup());
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async startProcess(command, name) {
    return new Promise((resolve, reject) => {
      this.log(`启动 ${name}...`);
      
      const child = spawn('pnpm', ['run', command], {
        cwd: process.cwd(),
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      child.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[${name}] ${output}`);
        }
      });

      child.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('ExperimentalWarning')) {
          console.log(`[${name}] ${output}`);
        }
      });

      child.on('error', (error) => {
        this.log(`${name} 启动失败: ${error.message}`, 'error');
        reject(error);
      });

      child.on('close', (code) => {
        if (!this.isShuttingDown) {
          this.log(`${name} 意外退出，退出码: ${code}`, 'warn');
        }
      });

      // 等待一段时间确保进程启动
      setTimeout(() => {
        if (child.pid) {
          this.processes.push({ child, name, command });
          this.log(`${name} 启动成功 (PID: ${child.pid})`);
          resolve(child);
        } else {
          reject(new Error(`${name} 启动失败`));
        }
      }, 2000);
    });
  }

  async killPort(port) {
    return new Promise((resolve) => {
      // 使用多种方式强制清理端口
      const commands = [
        `lsof -ti:${port} | xargs kill -9`,
        `pkill -f "vite.*${port}"`,
        `pkill -f "localhost:${port}"`
      ];
      
      let completed = 0;
      commands.forEach(cmd => {
        exec(cmd, (error) => {
          completed++;
          if (completed === commands.length) {
            this.log(`强制清理端口 ${port}`);
            // 等待端口释放
            setTimeout(resolve, 1000);
          }
        });
      });
    });
  }

  async checkPortFree(port) {
    return new Promise((resolve) => {
      exec(`lsof -ti:${port}`, (error, stdout) => {
        const isFree = !stdout.trim();
        resolve(isFree);
      });
    });
  }

  async waitForPortFree(port, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
      const isFree = await this.checkPortFree(port);
      if (isFree) {
        this.log(`端口 ${port} 已释放`);
        return true;
      }
      this.log(`等待端口 ${port} 释放... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    this.log(`端口 ${port} 仍被占用，强制继续`, 'warn');
    return false;
  }

  async cleanup() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    this.log('清理进程和端口...');

    // 终止所有子进程
    for (const { child, name } of this.processes) {
      if (child && child.pid && !child.killed) {
        try {
          process.kill(child.pid, 'SIGTERM');
          this.log(`终止 ${name} (PID: ${child.pid})`);
        } catch (error) {
          this.log(`终止 ${name} 失败: ${error.message}`, 'warn');
        }
      }
    }

    // 清理端口
    await this.killPort(3000);
    await this.killPort(3002);
    await this.killPort(5174);
    await this.killPort(5175);

    this.log('前端开发服务器已停止');
  }

  async shutdown(signal) {
    this.log(`收到 ${signal} 信号，正在关闭前端开发服务器...`);
    await this.cleanup();
    process.exit(0);
  }

  async start() {
    try {
      this.log('启动前端开发服务器管理器...');
      
      // 强制清理可能占用的端口
      this.log('清理端口占用...');
      await this.killPort(3000);
      await this.killPort(3002);
      await this.killPort(5174);
      await this.killPort(5175);
      
      // 等待端口完全释放
      await this.waitForPortFree(3000);
      await this.waitForPortFree(3002);
      await this.waitForPortFree(5174);
      await this.waitForPortFree(5175);
      
      // 启动前端服务器
      this.log('启动前端服务器...');
      await this.startProcess('dev:renderer', 'Renderer Server');
      
      // 等待一段时间再启动第二个服务器
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.startProcess('dev:floating', 'Floating Server');
      
      this.log('所有前端服务器启动完成！');
      this.log('按 Ctrl+C 停止所有服务器');
      
      // 保持进程运行
      process.stdin.resume();
      
    } catch (error) {
      this.log(`启动失败: ${error.message}`, 'error');
      await this.cleanup();
      process.exit(1);
    }
  }
}

// 启动管理器
const manager = new FrontendManager();
manager.start();