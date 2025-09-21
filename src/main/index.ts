import { app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, globalShortcut, shell } from 'electron';
import * as path from 'path';

// 扩展 app 对象以包含 isQuitting 属性
(app as any).isQuitting = false;
import { WindowManager } from './windowManager';
import { ClipboardService } from './clipboard';
import { ConfigService } from './config';
import { StorageService } from './storage';

const isDev = process.env.NODE_ENV === 'development';

class ClipboardViewerApp {
  private windowManager: WindowManager;
  private clipboardService: ClipboardService;
  private storageService: StorageService;
  private configService: ConfigService;
  private tray: Tray | null = null;

  constructor() {
    this.storageService = new StorageService();
    this.configService = new ConfigService();
    this.windowManager = new WindowManager(this.configService);
    this.clipboardService = new ClipboardService(this.storageService);
  }

  async initialize() {
    // 确保只有一个实例运行
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return;
    }

    // 设置应用事件监听
    this.setupAppEvents();

    // 设置 IPC 处理器
    this.setupIPCHandlers();

    // 等待应用准备就绪
    await app.whenReady();

    // 创建系统托盘
    this.createTray();

    // 初始化服务
    await this.configService.initialize();
    await this.storageService.initialize(); // 添加StorageService初始化
    await this.clipboardService.initialize();

    // 创建窗口
    await this.windowManager.createMainWindow();

    // 开始监听剪贴板
    this.clipboardService.startMonitoring();

    // 监听剪贴板变化
    this.clipboardService.on('clipboardChanged', (item) => {
      console.log('主进程接收到clipboardChanged事件:', item);
      this.windowManager.sendToMainWindow('clipboard:changed', item);
    });
  }

  private setupAppEvents() {
    app.on('window-all-closed', () => {
      // 在 macOS 上，保持应用运行即使所有窗口都关闭了
      if (process.platform !== 'darwin') {
        this.clipboardService.stopMonitoring();
        app.quit();
      }
    });

    app.on('activate', async () => {
      // 在 macOS 上，当点击 dock 图标时重新创建窗口
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.windowManager.createMainWindow();
      } else {
        this.windowManager.showMainWindow();
      }

      // 确保剪贴板监听在激活时重新启动
      if (!this.clipboardService.isMonitoringActive()) {
        this.clipboardService.startMonitoring();
      }
    });

    app.on('second-instance', () => {
      // 当尝试运行第二个实例时，聚焦到主窗口
      this.windowManager.showMainWindow();
    });

    app.on('before-quit', (event) => {
      // 设置应用退出标志
      (app as any).isQuitting = true;
      this.windowManager.setAppQuitting(true);

      // 停止剪贴板监听
      this.clipboardService.stopMonitoring();

      // 清理托盘
      if (this.tray && !this.tray.isDestroyed()) {
        this.tray.destroy();
        this.tray = null;
      }

      // 清理全局快捷键
      globalShortcut.unregisterAll();
    });

    app.on('will-quit', () => {
      this.clipboardService.stopMonitoring();
    });
  }

  private setupIPCHandlers() {
    // 剪贴板相关
    ipcMain.handle('clipboard:getHistory', async () => {
      try {
        const history = await this.storageService.getClipboardHistory();
        return { success: true, data: history };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('clipboard:copyToClipboard', async (_, content) => {
      try {
        // 设置剪贴板内容
        this.clipboardService.setClipboardContent(content);

        // 创建剪贴板项目并添加到历史记录
        const clipboardItem = await this.clipboardService.createClipboardItem(content);
        await this.storageService.addClipboardItem(clipboardItem);

        // 通知所有窗口更新历史记录
        const history = await this.storageService.getClipboardHistory();
        this.windowManager.sendToMainWindow('clipboard:update', history);

        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('clipboard:removeItem', async (_, id) => {
      try {
        await this.storageService.removeClipboardItem(id);
        // 通知所有窗口更新
        const history = await this.storageService.getClipboardHistory();
        this.windowManager.sendToMainWindow('clipboard:update', history);
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('clipboard:toggleFavorite', async (_, id) => {
      try {
        await this.storageService.toggleFavorite(id);
        // 通知所有窗口更新
        const history = await this.storageService.getClipboardHistory();
        this.windowManager.sendToMainWindow('clipboard:update', history);
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('clipboard:clearHistory', async () => {
      try {
        await this.storageService.clearHistory();
        // 通知所有窗口更新
        this.windowManager.sendToMainWindow('clipboard:update', []);
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // 窗口控制
    ipcMain.handle('mainWindow:show', () => {
      try {
        this.windowManager.showMainWindow();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('mainWindow:hide', () => {
      try {
        this.windowManager.hideMainWindow();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });



    // 配置管理
    ipcMain.handle('app:getConfig', async () => {
      try {
        const config = await this.configService.getConfig();
        return { success: true, data: config };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('app:updateConfig', async (_, config) => {
      try {
        await this.configService.updateConfig(config);
        // 通知所有窗口配置更新
        const newConfig = await this.configService.getConfig();
        this.windowManager.sendToMainWindow('config:update', newConfig);
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('config:export', async () => {
      try {
        const config = await this.configService.getConfig();
        return { success: true, data: JSON.stringify(config, null, 2) };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('config:import', async (_, configData) => {
      try {
        const config = JSON.parse(configData);
        await this.configService.updateConfig(config);
        // 通知所有窗口配置更新
        const newConfig = await this.configService.getConfig();
        this.windowManager.sendToMainWindow('config:update', newConfig);
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // 应用控制
    ipcMain.handle('app:quit', () => {
      this.quitApp();
    });

    ipcMain.handle('app:minimizeToTray', () => {
      this.windowManager.hideMainWindow();
    });

    // 系统操作
    ipcMain.handle('shell:openExternal', async (_, url: string) => {
      try {
        const parsedUrl = new URL(url);

        // 只允许 http/https 协议
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Only HTTP/HTTPS URLs are allowed');
        }

        console.log('主进程: 正在打开外部URL:', url);
        await shell.openExternal(url);
        console.log('主进程: 外部URL打开成功');
        return { success: true };
      } catch (error) {
        console.error('主进程: 打开外部URL失败:', error);
        return { success: false, error: (error as Error).message };
      }
    });
  }

  private createTray() {
    // 创建托盘图标
    const trayIcon = nativeImage.createFromPath(
      path.join(__dirname, isDev ? '../../assets' : '../assets', 'tray-icon.png')
    );

    this.tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => this.windowManager.showMainWindow()
      },

      { type: 'separator' },
      {
        label: '退出',
        click: () => this.quitApp()
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Clipboard Viewer');

    // 双击托盘图标显示主窗口
    this.tray.on('double-click', () => {
      this.windowManager.showMainWindow();
    });
  }

  private async quitApp() {
    // 设置退出标志，通知窗口管理器应用正在退出
    this.windowManager.setAppQuitting(true);

    // 设置应用退出标志
    (app as any).isQuitting = true;

    // 如果是开发模式，停止开发服务器进程
    if (isDev) {
      await this.stopDevServer();
    }

    // 退出应用，before-quit 事件会处理清理逻辑
    app.quit();
  }

  private async stopDevServer() {
    try {
      console.log('正在停止开发服务器...');

      // 查找并终止开发服务器进程
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      // 扩展端口检查范围，包括常见的开发服务器端口
      const ports = [3000, 5173, 8080, 8081];

      // 1. 首先终止占用端口的进程
      for (const port of ports) {
        try {
          // 在macOS上查找占用指定端口的进程
          const { stdout } = await execAsync(`lsof -ti:${port}`);
          const pids = stdout.trim().split('\n').filter((pid: string) => pid);

          for (const pid of pids) {
            if (pid) {
              console.log(`终止端口 ${port} 上的进程 ${pid}`);
              try {
                process.kill(parseInt(pid), 'SIGTERM');
                // 等待进程优雅退出
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 检查进程是否还在运行，如果是则强制终止
                try {
                  process.kill(parseInt(pid), 0); // 检查进程是否存在
                  console.log(`强制终止进程 ${pid}`);
                  process.kill(parseInt(pid), 'SIGKILL');
                } catch {
                  // 进程已经终止
                  console.log(`进程 ${pid} 已成功终止`);
                }
              } catch (error) {
                console.log(`终止进程 ${pid} 失败:`, (error as Error).message);
              }
            }
          }
        } catch (error) {
          // 端口未被占用或查找失败，继续处理下一个端口
          console.log(`端口 ${port} 未被占用或查找失败:`, (error as Error).message);
        }
      }

      // 2. 查找并终止所有相关的node进程
      try {
        console.log('查找相关的开发进程...');
        const keywords = ['vite', 'electron', 'wait-on', 'dev-server', 'webpack'];

        for (const keyword of keywords) {
          try {
            // 查找包含关键词的node进程
            const { stdout } = await execAsync(`ps aux | grep "${keyword}" | grep -v grep | awk '{print $2}'`);
            const pids = stdout.trim().split('\n').filter((pid: string) => pid && !isNaN(parseInt(pid)));

            for (const pid of pids) {
              if (pid && parseInt(pid) !== process.pid) { // 不要终止当前进程
                console.log(`终止包含 "${keyword}" 的进程 ${pid}`);
                try {
                  process.kill(parseInt(pid), 'SIGTERM');
                  await new Promise(resolve => setTimeout(resolve, 500));

                  // 检查并强制终止
                  try {
                    process.kill(parseInt(pid), 0);
                    process.kill(parseInt(pid), 'SIGKILL');
                  } catch {
                    // 进程已终止
                  }
                } catch (error) {
                  console.log(`终止进程 ${pid} 失败:`, (error as Error).message);
                }
              }
            }
          } catch (error) {
            console.log(`查找 "${keyword}" 进程失败:`, (error as Error).message);
          }
        }
      } catch (error) {
        console.log('查找相关进程时出错:', (error as Error).message);
      }

      // 3. 尝试终止整个进程组（如果有的话）
      try {
        // 查找当前应用的子进程
        const { stdout } = await execAsync(`pgrep -P ${process.pid}`);
        const childPids = stdout.trim().split('\n').filter((pid: string) => pid);

        for (const pid of childPids) {
          if (pid) {
            console.log(`终止子进程 ${pid}`);
            try {
              process.kill(parseInt(pid), 'SIGTERM');
              await new Promise(resolve => setTimeout(resolve, 500));

              try {
                process.kill(parseInt(pid), 0);
                process.kill(parseInt(pid), 'SIGKILL');
              } catch {
                // 进程已终止
              }
            } catch (error) {
              console.log(`终止子进程 ${pid} 失败:`, (error as Error).message);
            }
          }
        }
      } catch (error) {
        console.log('查找子进程失败:', (error as Error).message);
      }

      console.log('开发服务器停止完成');
    } catch (error) {
      console.error('停止开发服务器时出错:', error);
      // 不阻止应用退出，继续执行退出流程
    }
  }
}

// 创建并初始化应用
const clipboardApp = new ClipboardViewerApp();
clipboardApp.initialize().catch(console.error);

// 导出应用实例（用于测试）
export default clipboardApp;