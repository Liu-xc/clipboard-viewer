import { app } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { AppConfig } from '../shared/types';

const DEFAULT_CONFIG: AppConfig = {
  theme: 'light',
  language: 'zh-CN',
  autoStart: false,
  showInTray: true,
  minimizeToTray: true,
  closeToTray: false,
  maxHistoryItems: 100,
  enableNotifications: true,
  enableSounds: true,
  privacy: {
    enablePasswordProtection: false,
    autoLock: false,
    lockTimeout: 300,
    excludeSensitiveApps: true,
    sensitiveApps: []
  },
  hotkeys: {
    toggleMainWindow: 'CommandOrControl+Shift+V',
    toggleFloatingBall: 'CommandOrControl+Shift+B',
    clearHistory: 'CommandOrControl+Shift+C'
  },
  floatingBall: {
    enabled: true,
    position: { x: 100, y: 100 },
    opacity: 0.8,
    size: 60,
    alwaysOnTop: true,
    clickThrough: false,
    autoHide: false,
    hideDelay: 3000
  },
  mainWindow: {
    width: 1200,
    height: 800,
    alwaysOnTop: false,
    showInTaskbar: true
  },
  clipboard: {
    watchImages: true,
    watchFiles: true,
    enableFileCapture: true,
    maxImageSize: 10 * 1024 * 1024, // 10MB
    excludeApps: [],
    autoCleanup: true,
    cleanupDays: 30
  }
};

export class ConfigService {
  private configDir: string;
  private configFile: string;
  private config: AppConfig;

  constructor() {
    this.configDir = path.join(app.getPath('userData'), 'clipboard-viewer');
    this.configFile = path.join(this.configDir, 'config.json');
    this.config = { ...DEFAULT_CONFIG };
  }

  async initialize() {
    try {
      // 确保配置目录存在
      await fs.mkdir(this.configDir, { recursive: true });

      // 加载配置
      await this.loadConfig();

      // console.log('Config initialized:', this.config);
    } catch (error) {
      console.error('Error initializing config:', error);
    }
  }

  private async loadConfig() {
    try {
      const data = await fs.readFile(this.configFile, 'utf-8');
      const loadedConfig = JSON.parse(data);

      // 合并默认配置和加载的配置
      this.config = this.mergeConfig(DEFAULT_CONFIG, loadedConfig);

      // 验证配置
      this.validateConfig();
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error('Error loading config:', error);
      }
      // 文件不存在或格式错误，使用默认配置
      this.config = { ...DEFAULT_CONFIG };
      await this.saveConfig();
    }
  }

  private mergeConfig(defaultConfig: AppConfig, loadedConfig: any): AppConfig {
    const merged = { ...defaultConfig };

    // 递归合并对象
    const mergeObjects = (target: any, source: any) => {
      for (const key in source) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          mergeObjects(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    mergeObjects(merged, loadedConfig);
    return merged;
  }

  private validateConfig() {
    // 验证数值范围
    if (this.config.maxHistoryItems < 10) {
      this.config.maxHistoryItems = 10;
    } else if (this.config.maxHistoryItems > 1000) {
      this.config.maxHistoryItems = 1000;
    }

    if (this.config.floatingBall.opacity < 0.1) {
      this.config.floatingBall.opacity = 0.1;
    } else if (this.config.floatingBall.opacity > 1) {
      this.config.floatingBall.opacity = 1;
    }

    if (this.config.floatingBall.size < 40) {
      this.config.floatingBall.size = 40;
    } else if (this.config.floatingBall.size > 100) {
      this.config.floatingBall.size = 100;
    }

    if (this.config.mainWindow.width < 400) {
      this.config.mainWindow.width = 400;
    }

    if (this.config.mainWindow.height < 300) {
      this.config.mainWindow.height = 300;
    }

    if (this.config.clipboard.cleanupDays < 1) {
      this.config.clipboard.cleanupDays = 1;
    } else if (this.config.clipboard.cleanupDays > 365) {
      this.config.clipboard.cleanupDays = 365;
    }

    // 验证主题
    if (!['light', 'dark', 'auto'].includes(this.config.theme)) {
      this.config.theme = 'light';
    }
  }

  private async saveConfig() {
    try {
      const data = {
        ...this.config,
        lastUpdated: Date.now(),
        version: '1.0.0'
      };

      await fs.writeFile(this.configFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    try {
      // 深度合并更新
      this.config = this.mergeConfig(this.config, updates);

      // 验证配置
      this.validateConfig();

      // 保存到文件
      await this.saveConfig();
    } catch (error) {
      console.error('Error updating config:', error);
    }
  }

  async resetConfig(): Promise<void> {
    try {
      this.config = { ...DEFAULT_CONFIG };
      await this.saveConfig();
    } catch (error) {
      console.error('Error resetting config:', error);
    }
  }

  // 获取特定配置项
  getTheme(): AppConfig['theme'] {
    return this.config.theme;
  }

  getAutoStart(): boolean {
    return this.config.autoStart;
  }

  getMaxHistoryItems(): number {
    return this.config.maxHistoryItems;
  }

  getNotificationsEnabled(): boolean {
    return this.config.enableNotifications;
  }

  getHotkey(): any {
    return this.config.hotkeys;
  }

  getFloatingBallConfig(): AppConfig['floatingBall'] {
    return { ...this.config.floatingBall };
  }

  getMainWindowConfig(): AppConfig['mainWindow'] {
    return { ...this.config.mainWindow };
  }

  getClipboardConfig(): AppConfig['clipboard'] {
    return { ...this.config.clipboard };
  }

  // 更新特定配置项
  async setTheme(theme: AppConfig['theme']): Promise<void> {
    await this.updateConfig({ theme });
  }

  async setAutoStart(autoStart: boolean): Promise<void> {
    await this.updateConfig({ autoStart });
  }

  async setMaxHistoryItems(maxHistoryItems: number): Promise<void> {
    await this.updateConfig({ maxHistoryItems });
  }

  async setNotificationsEnabled(enableNotifications: boolean): Promise<void> {
    await this.updateConfig({ enableNotifications });
  }

  async setHotkey(hotkey: any): Promise<void> {
    await this.updateConfig({ hotkeys: hotkey });
  }

  async updateFloatingBallConfig(updates: Partial<AppConfig['floatingBall']>): Promise<void> {
    await this.updateConfig({
      floatingBall: { ...this.config.floatingBall, ...updates }
    });
  }

  async updateMainWindowConfig(updates: Partial<AppConfig['mainWindow']>): Promise<void> {
    await this.updateConfig({
      mainWindow: { ...this.config.mainWindow, ...updates }
    });
  }

  async updateClipboardConfig(updates: Partial<AppConfig['clipboard']>): Promise<void> {
    await this.updateConfig({
      clipboard: { ...this.config.clipboard, ...updates }
    });
  }

  // 导出和导入配置
  async exportConfig(): Promise<string> {
    return JSON.stringify(this.config, null, 2);
  }

  async importConfig(configJson: string): Promise<boolean> {
    try {
      const importedConfig = JSON.parse(configJson);
      await this.updateConfig(importedConfig);
      return true;
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  }

  // 获取配置文件路径（用于备份等）
  getConfigPath(): string {
    return this.configFile;
  }

  // 检查配置是否为默认值
  isDefaultConfig(): boolean {
    return JSON.stringify(this.config) === JSON.stringify(DEFAULT_CONFIG);
  }
}