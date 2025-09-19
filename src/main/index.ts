import { app, BrowserWindow, ipcMain, globalShortcut, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
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
    await this.clipboardService.initialize();
    
    // 创建窗口
    await this.windowManager.createMainWindow();
    await this.windowManager.createFloatingBall();
    
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

    app.on('before-quit', () => {
      this.clipboardService.stopMonitoring();
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
        this.clipboardService.setClipboardContent(content);
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

    ipcMain.handle('floatingBall:toggle', () => {
      try {
        this.windowManager.toggleFloatingBall();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('floatingBall:updatePosition', (_, position) => {
      if (position && typeof position === 'object' && 'x' in position && 'y' in position) {
        this.windowManager.updateFloatingBallPosition(position.x, position.y);
      } else {
        console.error('Invalid position parameter:', position);
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
      app.quit();
    });

    ipcMain.handle('app:minimizeToTray', () => {
      this.windowManager.hideMainWindow();
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
      {
        label: '切换悬浮球',
        click: () => this.windowManager.toggleFloatingBall()
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => app.quit()
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Clipboard Viewer');
    
    // 双击托盘图标显示主窗口
    this.tray.on('double-click', () => {
      this.windowManager.showMainWindow();
    });
  }
}

// 创建并初始化应用
const clipboardApp = new ClipboardViewerApp();
clipboardApp.initialize().catch(console.error);

// 导出应用实例（用于测试）
export default clipboardApp;