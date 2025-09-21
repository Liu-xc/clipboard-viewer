import React, { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import type { ClipboardItem } from '../types';
import ClipboardItemList from '../components/ClipboardItemList';

const Favorites: React.FC = () => {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Favorites组件: useEffect开始执行');
    loadFavorites();
    
    // 监听剪贴板变化
    const handleClipboardChange = (newItem: ClipboardItem) => {
      console.log('收藏夹页面接收到剪贴板变化事件:', newItem);
      // 只有当新项目是收藏项目时才添加到收藏夹列表
      if (newItem.favorite) {
        setClipboardItems(prevItems => {
          console.log('收藏夹页面: 状态更新函数被调用, 当前项目数:', prevItems.length);
          return [newItem, ...prevItems];
        });
      }
    };

    // 监听剪贴板历史更新
    const handleClipboardUpdate = (updatedItems: ClipboardItem[]) => {
      console.log('收藏夹页面接收到剪贴板历史更新事件:', updatedItems.length, '个项目');
      
      // 只保留收藏的项目
      const favoriteItems = updatedItems.filter(item => item.favorite);
      const sortedItems = [...favoriteItems].sort((a, b) => b.timestamp - a.timestamp);
      console.log('收藏夹页面排序后设置状态，收藏项目数:', sortedItems.length);
      
      setClipboardItems(sortedItems);
    };
    
    // 监听来自MarkdownViewer的剪贴板更新事件
    const handleClipboardUpdated = () => {
      loadFavorites();
    };
    
    console.log('Favorites组件: 检查window.electronAPI是否存在:', !!window.electronAPI);
    if (window.electronAPI) {
      console.log('Favorites组件: 注册剪贴板事件监听器');
      window.electronAPI.onClipboardChanged(handleClipboardChange);
      window.electronAPI.onClipboardUpdate(handleClipboardUpdate);
      console.log('Favorites组件: 事件监听器注册完成');
    } else {
      console.error('Favorites组件: window.electronAPI不存在!');
    }
    
    window.addEventListener('clipboardUpdated', handleClipboardUpdated);
    
    return () => {
      console.log('Favorites组件: 清理事件监听器');
      if (window.electronAPI) {
        window.electronAPI.removeClipboardChangeListener();
      }
      window.removeEventListener('clipboardUpdated', handleClipboardUpdated);
    };
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.electronAPI) {
        const response = await window.electronAPI.getClipboardHistory();
        if (response.success && response.data) {
          // 只保留收藏的项目
          const favoriteItems = response.data.filter(item => item.favorite);
          setClipboardItems(favoriteItems);
        } else {
          setError(response.error || '获取收藏夹失败');
        }
      } else {
        // 在 web 环境中提供测试数据
        const mockData: ClipboardItem[] = [
          {
            id: 'test-text-1',
            content: '# 这是一个标题\n\n这是一些普通文本内容。',
            preview: '# 这是一个标题\n\n这是一些普通文本内容。',
            type: 'text',
            timestamp: Date.now() - 1000 * 60 * 10,
            favorite: true,
            tags: ['markdown']
          }
        ];
        setClipboardItems(mockData);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setError('加载收藏夹时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (item: ClipboardItem) => {
    try {
      if (item.type === 'text') {
        await navigator.clipboard.writeText(item.content);
      } else if (item.type === 'image') {
        const response = await fetch(item.content);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
      }
      notifications.show({
        title: '复制成功',
        message: '内容已复制到剪贴板',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      notifications.show({
        title: '复制失败',
        message: '无法复制到剪贴板',
        color: 'red',
      });
    }
  };

  const handleToggleFavorite = async (item: ClipboardItem) => {
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.toggleFavorite(item.id);
        if (response.success) {
          // 如果取消收藏，从收藏夹列表中移除
          if (item.favorite) {
            setClipboardItems(prev => prev.filter(prevItem => prevItem.id !== item.id));
          } else {
            // 如果添加收藏，更新状态
            setClipboardItems(prev => 
              prev.map(prevItem => 
                prevItem.id === item.id 
                  ? { ...prevItem, favorite: !prevItem.favorite }
                  : prevItem
              )
            );
          }
          
          notifications.show({
            title: item.favorite ? '取消收藏' : '添加收藏',
            message: item.favorite ? '已从收藏夹移除' : '已添加到收藏夹',
            color: 'blue',
            autoClose: 2000
          });
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      notifications.show({
        title: '操作失败',
        message: '切换收藏状态时发生错误',
        color: 'red',
        autoClose: 3000
      });
    }
  };

  const handleDeleteItem = async (item: ClipboardItem) => {
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.removeClipboardItem(item.id);
        if (response.success) {
          setClipboardItems(prev => prev.filter(prevItem => prevItem.id !== item.id));
          
          notifications.show({
            title: '删除成功',
            message: '剪贴板项目已删除',
            color: 'green',
            autoClose: 2000
          });
        }
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      notifications.show({
        title: '删除失败',
        message: '删除剪贴板项目时发生错误',
        color: 'red',
        autoClose: 3000
      });
    }
  };





  return (
    <ClipboardItemList
      items={clipboardItems}
      title="收藏夹"
      searchPlaceholder="搜索收藏的内容..."
      emptyText="暂无收藏项目"
      emptySubText="在剪贴板历史中点击爱心图标来收藏项目"
      loading={loading}
      error={error}
      onRefresh={loadFavorites}
      onCopy={handleCopyToClipboard}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDeleteItem}
    />
  );
};

export default Favorites;