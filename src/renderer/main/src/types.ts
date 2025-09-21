import type { ClipboardItem, AppConfig, IpcResponse } from '../../../shared/types';

// Electron API 接口定义
export interface ElectronAPI {
  // 剪贴板相关
  getClipboardHistory: () => Promise<IpcResponse<ClipboardItem[]>>;
  copyToClipboard: (content: string) => Promise<IpcResponse<boolean>>;
  removeClipboardItem: (id: string) => Promise<IpcResponse<boolean>>;
  toggleFavorite: (id: string) => Promise<IpcResponse<boolean>>;
  clearClipboardHistory: () => Promise<IpcResponse<boolean>>;
  onClipboardUpdate: (callback: (items: ClipboardItem[]) => void) => void;
  onClipboardChanged: (callback: (item: ClipboardItem) => void) => void;
  removeClipboardChangeListener: () => void;
  
  // 窗口控制
  showMainWindow: () => Promise<IpcResponse<boolean>>;
  hideMainWindow: () => Promise<IpcResponse<boolean>>;

  
  // 配置管理
  getConfig: () => Promise<IpcResponse<AppConfig>>;
  updateConfig: (config: Partial<AppConfig>) => Promise<IpcResponse<boolean>>;
  onConfigUpdate: (callback: (config: AppConfig) => void) => void;
  exportConfig: () => Promise<IpcResponse<string>>;
  importConfig: (configData: string) => Promise<IpcResponse<boolean>>;
  
  // 应用控制
  quitApp: () => Promise<IpcResponse<boolean>>;
  minimizeToTray: () => Promise<IpcResponse<boolean>>;
  
  // 系统操作
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export type { ClipboardItem, AppConfig, IpcResponse };