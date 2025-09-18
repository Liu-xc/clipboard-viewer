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
    // 恢复窗口状态
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1000,
      defaultHeight: 700
    });

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      show: false,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload/preload/index.js'),
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    });

    // 管理窗口状态
    mainWindowState.manage(this.mainWindow);

    // 加载主窗口内容
    if (isDev) {
      await this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      await this.mainWindow.loadFile(path.join(__dirname, '../../renderer/main/index.html'));
    }

    // 窗口准备好后显示
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

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

    this.floatingBallWindow = new BrowserWindow({
      width: config.floatingBall.size,
      height: config.floatingBall.size,
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
      focusable: false,
      show: config.floatingBall.enabled,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload/preload/index.js'),
        webSecurity: true
      }
    });

    // 设置窗口透明度
    this.floatingBallWindow.setOpacity(config.floatingBall.opacity);

    // 加载悬浮球内容
    if (isDev) {
      await this.floatingBallWindow.loadURL('http://localhost:5174');
    } else {
      await this.floatingBallWindow.loadFile(path.join(__dirname, '../../renderer/floating/index.html'));
    }

    // 点击悬浮球显示主窗口
    this.floatingBallWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'mouseDown' && (input as any).button === 'left') {
        this.showMainWindow();
      }
    });

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

  destroyAllWindows() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.destroy();
    }
    if (this.floatingBallWindow && !this.floatingBallWindow.isDestroyed()) {
      this.floatingBallWindow.destroy();
    }
  }
}