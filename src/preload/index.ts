import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../renderer/main/src/types';

// 创建安全的 IPC 通信桥梁
const electronAPI: ElectronAPI = {
  // 剪贴板相关
  getClipboardHistory: () => ipcRenderer.invoke('clipboard:getHistory'),
  onClipboardChanged: (callback) => {
    ipcRenderer.on('clipboard:changed', (_, item) => callback(item));
  },
  removeClipboardChangeListener: () => {
    ipcRenderer.removeAllListeners('clipboard:changed');
  },
  
  // 窗口控制
  showMainWindow: () => ipcRenderer.invoke('mainWindow:show'),
  hideMainWindow: () => ipcRenderer.invoke('mainWindow:hide'),
  toggleFloatingBall: () => ipcRenderer.invoke('floatingBall:toggle'),
  
  // 配置管理
  getConfig: () => ipcRenderer.invoke('app:getConfig'),
  setConfig: (config) => ipcRenderer.invoke('app:setConfig', config),
  
  // 应用控制
  quitApp: () => ipcRenderer.invoke('app:quit'),
  minimizeToTray: () => ipcRenderer.invoke('app:minimizeToTray')
};

// 将 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 开发环境下的调试信息
if (process.env.NODE_ENV === 'development') {
  console.log('Preload script loaded successfully');
}