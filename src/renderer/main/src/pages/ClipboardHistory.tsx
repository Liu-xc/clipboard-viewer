import React, { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import type { ClipboardItem } from '../types';
import ClipboardItemList from '../components/ClipboardItemList';

const ClipboardHistory: React.FC = () => {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ClipboardHistory组件: useEffect开始执行');
    loadClipboardHistory();
    
    // 监听剪贴板变化
    const handleClipboardChange = (newItem: ClipboardItem) => {
      console.log('渲染进程接收到剪贴板变化事件:', newItem);
      console.log('渲染进程: 准备更新状态');
      setClipboardItems(prevItems => {
        console.log('渲染进程: 状态更新函数被调用, 当前项目数:', prevItems.length);
        return [newItem, ...prevItems];
      });
    };

    // 监听剪贴板历史更新
    const handleClipboardUpdate = (updatedItems: ClipboardItem[]) => {
      console.log('渲染进程接收到剪贴板历史更新事件:', updatedItems.length, '个项目');
      console.log('更新前的项目数量:', clipboardItems.length);
      console.log('最新项目的时间戳:', updatedItems[0]?.timestamp);
      
      // 确保按时间戳降序排列
      const sortedItems = [...updatedItems].sort((a, b) => b.timestamp - a.timestamp);
      console.log('排序后设置状态，最新项目ID:', sortedItems[0]?.id);
      
      setClipboardItems(sortedItems);
    };
    
    // 监听来自MarkdownViewer的剪贴板更新事件
    const handleClipboardUpdated = () => {
      loadClipboardHistory();
    };
    
    console.log('ClipboardHistory组件: 检查window.electronAPI是否存在:', !!window.electronAPI);
    if (window.electronAPI) {
      console.log('ClipboardHistory组件: 注册剪贴板事件监听器');
      window.electronAPI.onClipboardChanged(handleClipboardChange);
      window.electronAPI.onClipboardUpdate(handleClipboardUpdate);
      console.log('ClipboardHistory组件: 事件监听器注册完成');
    } else {
      console.error('ClipboardHistory组件: window.electronAPI不存在!');
    }
    
    window.addEventListener('clipboardUpdated', handleClipboardUpdated);
    
    return () => {
      console.log('ClipboardHistory组件: 清理事件监听器');
      if (window.electronAPI) {
        window.electronAPI.removeClipboardChangeListener();
      }
      window.removeEventListener('clipboardUpdated', handleClipboardUpdated);
    };
  }, []);

  const loadClipboardHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.electronAPI) {
        const response = await window.electronAPI.getClipboardHistory();
        if (response.success && response.data) {
          setClipboardItems(response.data);
        } else {
          setError(response.error || '获取剪贴板历史失败');
        }
      } else {
        // 在 web 环境中提供测试数据
        const mockData: ClipboardItem[] = [
          {
            id: 'test-image-1',
            content: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Test+Image',
            preview: '测试图片 (400x300)',
            type: 'image',
            timestamp: Date.now() - 1000 * 60 * 1,
            favorite: false,
            tags: ['图片', '测试']
          },
          {
            id: 'test-html-1',
            content: '<div style="padding: 20px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; border-radius: 10px; text-align: center;"><h2>HTML 内容示例</h2><p>这是一个包含样式的 HTML 片段</p><button style="background: white; color: #333; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">点击按钮</button></div>',
            preview: 'HTML 内容示例 - 包含样式和按钮',
            type: 'html',
            timestamp: Date.now() - 1000 * 60 * 1.5,
            favorite: false,
            tags: ['HTML', '样式']
          },
          {
            id: 'test-code-1',
            content: 'function calculateSum(a, b) {\n  return a + b;\n}\n\nconst result = calculateSum(5, 3);\nconsole.log(result);',
            preview: 'function calculateSum(a, b) {\n  return a + b;\n}\n\nconst result = calculateSum(5, 3);\nconsole.log(result);',
            type: 'code',
            timestamp: Date.now() - 1000 * 60 * 2,
            favorite: false,
            tags: ['代码', 'javascript']
          },
          {
            id: 'test-mermaid-1',
            content: 'graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]',
            preview: '流程图: 开始 → 处理 → 结束',
            type: 'mermaid',
            timestamp: Date.now() - 1000 * 60 * 5,
            favorite: false,
            tags: ['测试', 'mermaid']
          },
          {
            id: 'test-file-1',
            content: '/Users/test/documents/example.pdf',
            preview: 'example.pdf',
            type: 'file',
            timestamp: Date.now() - 1000 * 60 * 6,
            favorite: false,
            tags: ['文件', 'PDF']
          },
          {
            id: 'test-code-2',
            content: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))',
            preview: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))',
            type: 'code',
            timestamp: Date.now() - 1000 * 60 * 8,
            favorite: true,
            tags: ['代码', 'python']
          },
          {
            id: 'test-text-1',
            content: '# 这是一个标题\n\n这是一些普通文本内容。\n\n## 子标题\n\n- 列表项 1\n- 列表项 2\n- 列表项 3\n\n**粗体文本** 和 *斜体文本*',
            preview: '# 这是一个标题\n\n这是一些普通文本内容。',
            type: 'text',
            timestamp: Date.now() - 1000 * 60 * 10,
            favorite: true,
            tags: ['markdown']
          },
          {
            id: 'test-mermaid-2',
            content: 'pie title 数据分布\n    "类型A" : 42\n    "类型B" : 30\n    "类型C" : 28',
            preview: '饼图: 数据分布',
            type: 'mermaid',
            timestamp: Date.now() - 1000 * 60 * 15,
            favorite: false,
            tags: ['图表']
          }
        ];
        setClipboardItems(mockData);
      }
    } catch (error) {
      console.error('Failed to load clipboard history:', error);
      setError('加载剪贴板历史时发生错误');
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
          setClipboardItems(prev => 
            prev.map(prevItem => 
              prevItem.id === item.id 
                ? { ...prevItem, favorite: !prevItem.favorite }
                : prevItem
            )
          );
          
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





  const handleClearAll = async () => {
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.clearClipboardHistory();
        if (response.success) {
          setClipboardItems([]);
          
          notifications.show({
            title: '清除成功',
            message: '所有剪贴板历史已清除',
            color: 'green',
            autoClose: 2000
          });
        }
      }
    } catch (error) {
      console.error('Failed to clear clipboard history:', error);
      notifications.show({
        title: '清除失败',
        message: '清除剪贴板历史时发生错误',
        color: 'red',
        autoClose: 3000
      });
    }
  };

  const handleRefresh = () => {
    loadClipboardHistory();
  };

  return (
    <ClipboardItemList
      items={clipboardItems}
      title="剪贴板历史"
      searchPlaceholder="搜索剪贴板内容..."
      emptyText="暂无剪贴板历史"
      emptySubText="复制一些内容开始使用吧！"
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
      onCopy={handleCopyToClipboard}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDeleteItem}
      onClearAll={handleClearAll}
    />
  );
};

export default ClipboardHistory;