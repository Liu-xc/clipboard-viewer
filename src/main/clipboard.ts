import { clipboard, nativeImage } from 'electron';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { StorageService } from './storage';
import type { ClipboardItem } from '../shared/types';

export class ClipboardService extends EventEmitter {
  private storageService: StorageService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastClipboardContent: string = '';
  private isMonitoring: boolean = false;

  constructor(storageService: StorageService) {
    super();
    this.storageService = storageService;
  }

  async initialize() {
    // 获取当前剪贴板内容作为初始状态
    this.lastClipboardContent = clipboard.readText();
  }

  startMonitoring(interval: number = 1000) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkClipboardChange();
    }, interval);

    console.log('Clipboard monitoring started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Clipboard monitoring stopped');
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  private async checkClipboardChange() {
    try {
      const currentContent = clipboard.readText();
      console.log('检查剪贴板变化, 当前内容长度:', currentContent.length);
      
      // 检查内容是否发生变化
      console.log('上次内容长度:', this.lastClipboardContent.length, '当前内容是否不同:', currentContent !== this.lastClipboardContent, '当前内容是否非空:', currentContent.trim() !== '');
      if (currentContent !== this.lastClipboardContent && currentContent.trim() !== '') {
        this.lastClipboardContent = currentContent;
        
        // 创建剪贴板项目
        const clipboardItem = await this.createClipboardItem(currentContent);
        
        // 保存到存储
        await this.storageService.addClipboardItem(clipboardItem);
        
        // 发出变化事件
        console.log('准备发出clipboardChanged事件:', clipboardItem);
        this.emit('clipboardChanged', clipboardItem);
        console.log('已发出clipboardChanged事件');
        
        console.log('Clipboard changed:', clipboardItem.preview);
      }
    } catch (error) {
      console.error('Error checking clipboard change:', error);
    }
  }

  private async createClipboardItem(content: string): Promise<ClipboardItem> {
    const id = this.generateId(content);
    const timestamp = Date.now();
    const type = this.detectContentType(content);
    const preview = this.generatePreview(content, type);
    const size = Buffer.byteLength(content, 'utf8');

    return {
      id,
      type,
      content,
      preview,
      timestamp,
      favorite: false,
      tags: [],
      size
    };
  }

  private generateId(content: string): string {
    return crypto.createHash('md5').update(content + Date.now()).digest('hex');
  }

  private detectContentType(content: string): ClipboardItem['type'] {
    // 检查是否是 HTML
    if (content.includes('<') && content.includes('>')) {
      return 'html';
    }
    
    // 检查是否是文件路径
    if (content.match(/^[a-zA-Z]:\\|^\//) && content.includes('.')) {
      return 'file';
    }
    
    // 检查是否是图片（base64 或 URL）
    if (content.startsWith('data:image/') || content.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i)) {
      return 'image';
    }
    
    // 默认为文本
    return 'text';
  }

  private generatePreview(content: string, type: ClipboardItem['type']): string {
    const maxLength = 100;
    
    switch (type) {
      case 'html':
        // 移除 HTML 标签，只保留文本内容
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return textContent.length > maxLength 
          ? textContent.substring(0, maxLength) + '...'
          : textContent;
      
      case 'file':
        // 提取文件名
        const fileName = content.split(/[\\/]/).pop() || content;
        return `文件: ${fileName}`;
      
      case 'image':
        return '图片内容';
      
      case 'text':
      default:
        return content.length > maxLength 
          ? content.substring(0, maxLength) + '...'
          : content;
    }
  }

  // 手动获取当前剪贴板内容
  getCurrentClipboardContent(): ClipboardItem | null {
    try {
      const content = clipboard.readText();
      if (content.trim() === '') {
        return null;
      }
      
      const type = this.detectContentType(content);
      const preview = this.generatePreview(content, type);
      
      return {
        id: this.generateId(content),
        type,
        content,
        preview,
        timestamp: Date.now(),
        favorite: false,
        tags: [],
        size: Buffer.byteLength(content, 'utf8')
      };
    } catch (error) {
      console.error('Error getting current clipboard content:', error);
      return null;
    }
  }

  // 设置剪贴板内容
  setClipboardContent(content: string, type: ClipboardItem['type'] = 'text') {
    try {
      switch (type) {
        case 'image':
          if (content.startsWith('data:image/')) {
            const image = nativeImage.createFromDataURL(content);
            clipboard.writeImage(image);
          } else {
            clipboard.writeText(content);
          }
          break;
        
        case 'html':
          clipboard.writeHTML(content);
          break;
        
        case 'text':
        case 'file':
        default:
          clipboard.writeText(content);
          break;
      }
      
      // 更新最后的剪贴板内容，避免触发变化检测
      this.lastClipboardContent = clipboard.readText();
    } catch (error) {
      console.error('Error setting clipboard content:', error);
    }
  }

  // 清空剪贴板
  clearClipboard() {
    clipboard.clear();
    this.lastClipboardContent = '';
  }


}