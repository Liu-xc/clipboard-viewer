// 剪贴板项目类型
export interface ClipboardItem {
  id: string;
  type: 'text' | 'image' | 'file' | 'html';
  content: string;
  preview: string;
  timestamp: number;
  favorite: boolean;
  tags: string[];
  size?: number;
}

// 应用配置类型
export interface AppConfig {
  maxItems: number;
  autoStart: boolean;
  hotkey: string;
  theme: 'light' | 'dark' | 'auto';
  autoCleanup: boolean;
  cleanupDays: number;
  floatingBall: {
    enabled: boolean;
    position: { x: number; y: number };
    size: number;
    opacity: number;
  };
}

// IPC 通信类型
export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Electron API 类型
export interface ElectronAPI {
  // 剪贴板相关
  getClipboardHistory: () => Promise<IPCResponse<ClipboardItem[]>>;
  onClipboardChanged: (callback: (item: ClipboardItem) => void) => void;
  removeClipboardChangeListener: () => void;
  
  // 窗口控制
  showMainWindow: () => Promise<void>;
  hideMainWindow: () => Promise<void>;
  toggleFloatingBall: () => Promise<void>;
  updateFloatingBallPosition: (x: number, y: number) => Promise<void>;
  
  // 配置管理
  getConfig: () => Promise<IPCResponse<AppConfig>>;
  setConfig: (config: Partial<AppConfig>) => Promise<IPCResponse<boolean>>;
  
  // 应用控制
  quitApp: () => Promise<void>;
  minimizeToTray: () => Promise<void>;
}

// 全局声明
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}