import { app } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { ClipboardItem } from '../shared/types';

export class StorageService {
  private dataDir: string;
  private historyFile: string;
  private clipboardHistory: ClipboardItem[] = [];
  private maxItems: number = 100;

  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'clipboard-viewer');
    this.historyFile = path.join(this.dataDir, 'history.json');
  }

  async initialize() {
    try {
      // 确保数据目录存在
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // 加载历史记录
      await this.loadHistory();
      
      console.log(`Storage initialized. Loaded ${this.clipboardHistory.length} items.`);
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  private async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8');
      const parsed = JSON.parse(data);
      
      if (parsed.items && Array.isArray(parsed.items)) {
        this.clipboardHistory = parsed.items;
        
        // 按时间戳排序（最新的在前）
        this.clipboardHistory.sort((a, b) => b.timestamp - a.timestamp);
        
        // 限制数量
        if (this.clipboardHistory.length > this.maxItems) {
          this.clipboardHistory = this.clipboardHistory.slice(0, this.maxItems);
          await this.saveHistory();
        }
      }
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error('Error loading history:', error);
      }
      // 文件不存在或格式错误，使用空数组
      this.clipboardHistory = [];
    }
  }

  private async saveHistory() {
    try {
      const data = {
        items: this.clipboardHistory,
        lastUpdated: Date.now(),
        version: '1.0.0'
      };
      
      await fs.writeFile(this.historyFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async addClipboardItem(item: ClipboardItem): Promise<void> {
    try {
      // 检查是否已存在相同内容的项目
      const existingIndex = this.clipboardHistory.findIndex(
        existing => existing.content === item.content
      );
      
      if (existingIndex !== -1) {
        // 如果存在，移除旧的并添加新的到顶部
        this.clipboardHistory.splice(existingIndex, 1);
      }
      
      // 添加到顶部
      this.clipboardHistory.unshift(item);
      
      // 限制数量
      if (this.clipboardHistory.length > this.maxItems) {
        this.clipboardHistory = this.clipboardHistory.slice(0, this.maxItems);
      }
      
      // 保存到文件
      await this.saveHistory();
    } catch (error) {
      console.error('Error adding clipboard item:', error);
    }
  }

  async getClipboardHistory(): Promise<ClipboardItem[]> {
    return [...this.clipboardHistory];
  }

  async getClipboardItem(id: string): Promise<ClipboardItem | null> {
    return this.clipboardHistory.find(item => item.id === id) || null;
  }

  async removeClipboardItem(id: string): Promise<boolean> {
    try {
      const index = this.clipboardHistory.findIndex(item => item.id === id);
      if (index !== -1) {
        this.clipboardHistory.splice(index, 1);
        await this.saveHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing clipboard item:', error);
      return false;
    }
  }

  async updateClipboardItem(id: string, updates: Partial<ClipboardItem>): Promise<boolean> {
    try {
      const index = this.clipboardHistory.findIndex(item => item.id === id);
      if (index !== -1) {
        this.clipboardHistory[index] = { ...this.clipboardHistory[index], ...updates };
        await this.saveHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating clipboard item:', error);
      return false;
    }
  }

  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const item = this.clipboardHistory.find(item => item.id === id);
      if (item) {
        item.favorite = !item.favorite;
        await this.saveHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  async addTag(id: string, tag: string): Promise<boolean> {
    try {
      const item = this.clipboardHistory.find(item => item.id === id);
      if (item) {
        if (!item.tags) item.tags = [];
        if (!item.tags.includes(tag)) {
          item.tags.push(tag);
        }
        await this.saveHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding tag:', error);
      return false;
    }
  }

  async removeTag(id: string, tag: string): Promise<boolean> {
    try {
      const item = this.clipboardHistory.find(item => item.id === id);
      if (item) {
        if (item.tags) {
          const tagIndex = item.tags.indexOf(tag);
          if (tagIndex > -1) {
            item.tags.splice(tagIndex, 1);
          }
        }
        await this.saveHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing tag:', error);
      return false;
    }
  }

  async searchClipboardHistory(query: string): Promise<ClipboardItem[]> {
    const lowerQuery = query.toLowerCase();
    return this.clipboardHistory.filter(item => 
      item.content.toLowerCase().includes(lowerQuery) ||
      (item.preview && item.preview.toLowerCase().includes(lowerQuery)) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  async getFavorites(): Promise<ClipboardItem[]> {
    return this.clipboardHistory.filter(item => item.favorite);
  }

  async getByType(type: ClipboardItem['type']): Promise<ClipboardItem[]> {
    return this.clipboardHistory.filter(item => item.type === type);
  }

  async clearHistory(): Promise<void> {
    try {
      this.clipboardHistory = [];
      await this.saveHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  async cleanupOldItems(days: number): Promise<number> {
    try {
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      const initialCount = this.clipboardHistory.length;
      
      // 保留收藏的项目，即使它们很旧
      this.clipboardHistory = this.clipboardHistory.filter(
        item => item.timestamp > cutoffTime || item.favorite
      );
      
      const removedCount = initialCount - this.clipboardHistory.length;
      
      if (removedCount > 0) {
        await this.saveHistory();
      }
      
      return removedCount;
    } catch (error) {
      console.error('Error cleaning up old items:', error);
      return 0;
    }
  }

  setMaxItems(maxItems: number) {
    this.maxItems = maxItems;
    
    // 如果当前项目数超过新的限制，截断数组
    if (this.clipboardHistory.length > maxItems) {
      this.clipboardHistory = this.clipboardHistory.slice(0, maxItems);
      this.saveHistory();
    }
  }

  getStats() {
    const totalItems = this.clipboardHistory.length;
    const favoriteItems = this.clipboardHistory.filter(item => item.favorite).length;
    const typeStats = this.clipboardHistory.reduce((stats, item) => {
      stats[item.type] = (stats[item.type] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    return {
      totalItems,
      favoriteItems,
      typeStats,
      oldestItem: this.clipboardHistory[this.clipboardHistory.length - 1]?.timestamp,
      newestItem: this.clipboardHistory[0]?.timestamp
    };
  }
}