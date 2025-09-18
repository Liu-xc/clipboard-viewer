// 共享类型定义
export interface ClipboardItem {
  id: string;
  type: 'text' | 'image' | 'file' | 'html';
  content: string;
  timestamp: number;
  size?: number;
  preview?: string;
  favorite?: boolean;
  tags?: string[];
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageWidth?: number;
    imageHeight?: number;
    mimeType?: string;
  };
}

export interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoStart: boolean;
  showInTray: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  maxHistoryItems: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  hotkeys: {
    toggleMainWindow: string;
    toggleFloatingBall: string;
    clearHistory: string;
  };
  floatingBall: {
    enabled: boolean;
    position: { x: number; y: number };
    size: number;
    opacity: number;
    alwaysOnTop: boolean;
    clickThrough: boolean;
    autoHide: boolean;
    hideDelay: number;
  };
  mainWindow: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    alwaysOnTop: boolean;
    showInTaskbar: boolean;
  };
  clipboard: {
    watchImages: boolean;
    watchFiles: boolean;
    enableFileCapture: boolean;
    maxImageSize: number;
    excludeApps: string[];
    autoCleanup: boolean;
    cleanupDays: number;
  };
  privacy: {
    enablePasswordProtection: boolean;
    password?: string;
    autoLock: boolean;
    lockTimeout: number;
    excludeSensitiveApps: boolean;
    sensitiveApps: string[];
  };
}

export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// IPC 通道定义
export const IPC_CHANNELS = {
  // 剪贴板相关
  CLIPBOARD_GET_HISTORY: 'clipboard:get-history',
  CLIPBOARD_ADD_ITEM: 'clipboard:add-item',
  CLIPBOARD_DELETE_ITEM: 'clipboard:delete-item',
  CLIPBOARD_CLEAR_HISTORY: 'clipboard:clear-history',
  CLIPBOARD_COPY_ITEM: 'clipboard:copy-item',
  CLIPBOARD_SEARCH: 'clipboard:search',
  CLIPBOARD_EXPORT: 'clipboard:export',
  CLIPBOARD_IMPORT: 'clipboard:import',
  
  // 配置相关
  CONFIG_GET: 'config:get',
  CONFIG_UPDATE: 'config:update',
  CONFIG_RESET: 'config:reset',
  CONFIG_EXPORT: 'config:export',
  CONFIG_IMPORT: 'config:import',
  
  // 窗口相关
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_HIDE: 'window:hide',
  WINDOW_SHOW: 'window:show',
  WINDOW_TOGGLE_FLOATING_BALL: 'window:toggle-floating-ball',
  
  // 系统相关
  SYSTEM_GET_INFO: 'system:get-info',
  SYSTEM_OPEN_PATH: 'system:open-path',
  SYSTEM_SHOW_ITEM_IN_FOLDER: 'system:show-item-in-folder',
  
  // 事件
  EVENT_CLIPBOARD_CHANGED: 'event:clipboard-changed',
  EVENT_CONFIG_CHANGED: 'event:config-changed',
  EVENT_THEME_CHANGED: 'event:theme-changed'
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];