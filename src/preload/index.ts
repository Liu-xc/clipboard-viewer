import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../renderer/main/src/types';

// 创建安全的 IPC 通信桥梁
const electronAPI: ElectronAPI = {
  // 剪贴板相关
  getClipboardHistory: () => ipcRenderer.invoke('clipboard:getHistory'),
  copyToClipboard: (content) => ipcRenderer.invoke('clipboard:copyToClipboard', content),
  removeClipboardItem: (id) => ipcRenderer.invoke('clipboard:removeItem', id),
  toggleFavorite: (id) => ipcRenderer.invoke('clipboard:toggleFavorite', id),
  clearClipboardHistory: () => ipcRenderer.invoke('clipboard:clearHistory'),
  onClipboardUpdate: (callback) => {
    ipcRenderer.on('clipboard:update', (_, items) => callback(items));
  },
  onClipboardChanged: (callback) => {
    console.log('Preload: 注册clipboard:changed事件监听器');
    ipcRenderer.on('clipboard:changed', (_, item) => {
      console.log('Preload接收到clipboard:changed事件:', item);
      console.log('Preload: 准备调用回调函数');
      try {
        callback(item);
        console.log('Preload: 回调函数调用成功');
      } catch (error) {
        console.error('Preload: 回调函数调用失败:', error);
      }
    });
  },
  removeClipboardChangeListener: () => {
    ipcRenderer.removeAllListeners('clipboard:changed');
    ipcRenderer.removeAllListeners('clipboard:update');
  },

  // 窗口控制
  showMainWindow: () => ipcRenderer.invoke('mainWindow:show'),
  hideMainWindow: () => ipcRenderer.invoke('mainWindow:hide'),


  // 配置管理
  getConfig: () => ipcRenderer.invoke('app:getConfig'),
  updateConfig: (config) => ipcRenderer.invoke('app:updateConfig', config),
  onConfigUpdate: (callback) => {
    ipcRenderer.on('config:update', (_, config) => callback(config));
  },
  exportConfig: () => ipcRenderer.invoke('app:exportConfig'),
  importConfig: (configData) => ipcRenderer.invoke('app:importConfig', configData),

  // 应用控制
  quitApp: () => ipcRenderer.invoke('app:quit'),
  minimizeToTray: () => ipcRenderer.invoke('app:minimizeToTray'),

  // 系统操作
  openExternal: async (url: string) => {
    try {
      console.log('[Preload] Opening external URL in browser:', url);
      // 直接使用 window.open 在默认浏览器中打开链接
      window.open(url, '_blank');
      return { success: true };
    } catch (error) {
      console.error('[Preload] Error opening external URL:', error);
      throw error;
    }
  }
};

// 将 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 开发环境下的调试信息
if (process.env.NODE_ENV === 'development') {
  console.log('=== Preload script loaded ===');
  console.log('Available APIs:', Object.keys(electronAPI));
  console.log('Window location:', window.location.href);
  console.log('IpcRenderer available:', !!ipcRenderer);
  console.log('ElectronAPI.openExternal available:', typeof electronAPI.openExternal);
}