import { BrowserWindow, screen, globalShortcut } from 'electron';
import * as path from 'path';
const windowStateKeeper = require('electron-window-state');
import { ConfigService } from './config';

const isDev = process.env.NODE_ENV === 'development';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private floatingBallWindow: BrowserWindow | null = null;
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  async createMainWindow(): Promise<BrowserWindow> {
    // 获取配置中保存的窗口尺寸
    const config = await this.configService.getConfig();
    
    // 恢复窗口状态，优先使用配置中的尺寸
    const mainWindowState = windowStateKeeper({
      defaultWidth: config.mainWindow.width || 1000,
      defaultHeight: config.mainWindow.height || 700
    });

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      resizable: true, // 确保窗口可以调整大小
      show: false,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload/preload/index.js'),
        webSecurity: !isDev,
        allowRunningInsecureContent: isDev,
        // 开发模式下禁用所有缓存
        ...(isDev && {
          additionalArguments: [
            '--disable-http-cache',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-dev-shm-usage'
          ]
        })
      }
    });

    // 管理窗口状态
    mainWindowState.manage(this.mainWindow);

    // 设置防抖保存窗口大小的定时器
    let resizeTimeout: NodeJS.Timeout;
    
    // 监听窗口大小变化事件
    this.mainWindow.on('resize', () => {
      // 清除之前的定时器
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // 设置防抖，500ms 后保存窗口大小
      resizeTimeout = setTimeout(async () => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          const [width, height] = this.mainWindow.getSize();
          try {
            await this.configService.updateMainWindowConfig({ width, height });
            console.log(`窗口大小已保存: ${width}x${height}`);
          } catch (error) {
            console.error('保存窗口大小失败:', error);
          }
        }
      }, 500);
    });

    // 加载主窗口内容
    if (isDev) {
      await this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      console.log('加载主窗口内容:', path.join(__dirname, '../../renderer/main/index.html'));
      await this.mainWindow.loadFile(path.join(__dirname, '../../renderer/main/index.html'));
    }

    // 窗口准备好后显示
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // 开发模式下添加强制刷新机制
    if (isDev) {
      this.setupDevRefreshMechanism();
    }

    // 窗口关闭时隐藏而不是销毁
    this.mainWindow.on('close', (event) => {
      if (!this.mainWindow?.isDestroyed()) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    return this.mainWindow;
  }

  async createFloatingBall(): Promise<BrowserWindow> {
    const config = await this.configService.getConfig();
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    // 默认位置在右下角
    const defaultX = width - config.floatingBall.size - 20;
    const defaultY = height - config.floatingBall.size - 20;

    // 窗口大小比悬浮球稍大，留出拖动区域
    const windowSize = config.floatingBall.size + 20; // 增加20px的拖动区域
    
    this.floatingBallWindow = new BrowserWindow({
      width: windowSize,
      height: windowSize,
      x: config.floatingBall.position.x || defaultX,
      y: config.floatingBall.position.y || defaultY,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: true,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: true,
      show: config.floatingBall.enabled,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload/preload/index.js'),
        webSecurity: !isDev,
        // 开发模式下禁用所有缓存
        ...(isDev && {
          additionalArguments: [
            '--disable-http-cache',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-dev-shm-usage'
          ]
        })
      }
    });

    // 设置窗口透明度
    this.floatingBallWindow.setOpacity(config.floatingBall.opacity);

    // 加载悬浮球内容
    if (isDev) {
      await this.floatingBallWindow.loadURL('http://localhost:5174');
    } else {
      console.log('加载悬浮球内容:', path.join(__dirname, '../../renderer/floating/index.html'));
      await this.floatingBallWindow.loadFile(path.join(__dirname, '../../renderer/floating/index.html'));
    }

    // 移除主进程的点击事件监听，让渲染进程处理所有鼠标事件

    // 保存位置变化
    this.floatingBallWindow.on('moved', async () => {
      if (this.floatingBallWindow) {
        const [x, y] = this.floatingBallWindow.getPosition();
        // Update floating ball position in config
        const config = await this.configService.getConfig();
        await this.configService.updateFloatingBallConfig({ position: { x, y } });
      }
    });

    return this.floatingBallWindow;
  }

  showMainWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  hideMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.hide();
    }
  }

  toggleFloatingBall() {
    if (this.floatingBallWindow) {
      if (this.floatingBallWindow.isVisible()) {
        this.floatingBallWindow.hide();
      } else {
        this.floatingBallWindow.show();
      }
    }
  }

  sendToMainWindow(channel: string, ...args: any[]) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log('主进程发送事件到渲染进程:', channel, args);
      this.mainWindow.webContents.send(channel, ...args);
    } else {
      console.log('主窗口不存在或已销毁，无法发送事件:', channel);
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getFloatingBallWindow(): BrowserWindow | null {
    return this.floatingBallWindow;
  }

  // 更新悬浮球位置
  updateFloatingBallPosition(x: number, y: number) {
    if (this.floatingBallWindow && !this.floatingBallWindow.isDestroyed()) {
      // 验证参数并取整
      const validX = typeof x === 'number' && !isNaN(x) ? Math.round(x) : 0;
      const validY = typeof y === 'number' && !isNaN(y) ? Math.round(y) : 0;
      
      console.log(`Setting floating ball position: x=${validX}, y=${validY}`);
      this.floatingBallWindow.setPosition(validX, validY);
    }
  }

  // 窗口吸边辅助方法
  snapFloatingBallToEdge(currentPosition: { x: number; y: number }, ballSize: number): { x: number; y: number } {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const snapThreshold = 50; // 吸边阈值

    let newX = currentPosition.x;
    let newY = currentPosition.y;

    // 左右边缘吸附
    if (currentPosition.x < snapThreshold) {
      newX = 0;
    } else if (currentPosition.x > screenWidth - ballSize - snapThreshold) {
      newX = screenWidth - ballSize;
    }

    // 上下边缘吸附
    if (currentPosition.y < snapThreshold) {
      newY = 0;
    } else if (currentPosition.y > screenHeight - ballSize - snapThreshold) {
      newY = screenHeight - ballSize;
    }

    return { x: newX, y: newY };
  }

  destroyAllWindows() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.destroy();
    }
    if (this.floatingBallWindow && !this.floatingBallWindow.isDestroyed()) {
      this.floatingBallWindow.destroy();
    }
  }

  // 开发模式下的强制刷新机制
  private setupDevRefreshMechanism() {
    if (!isDev) return;

    // 注册快捷键 Cmd+R 强制刷新主窗口
    globalShortcut.register('CommandOrControl+R', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        console.log('强制刷新主窗口');
        this.mainWindow.reload();
      }
    });

    // 注册快捷键 Cmd+Shift+R 强制刷新并清除缓存
    globalShortcut.register('CommandOrControl+Shift+R', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        console.log('强制刷新主窗口并清除缓存');
        this.mainWindow.webContents.session.clearCache();
        this.mainWindow.reload();
      }
    });

    // 监听webContents的did-fail-load事件，自动重试
    if (this.mainWindow) {
      this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.log('页面加载失败，尝试重新加载:', errorDescription);
        setTimeout(() => {
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.reload();
          }
        }, 1000);
      });
    }
  }
}