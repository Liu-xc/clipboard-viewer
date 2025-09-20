import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  TextInput,
  Group,
  Button,
  Stack,
  Text,
  Card,
  Badge,
  ActionIcon,
  Menu,
  Image,
  Code,
  Tooltip,
  ScrollArea,
  Loader,
  Center,
  Alert
} from '@mantine/core';
import {
  IconSearch,
  IconHeart,
  IconHeartFilled,
  IconCopy,
  IconTrash,
  IconDots,
  IconTag,
  IconPhoto,
  IconFile,
  IconCode,
  IconRefresh,
  IconClipboard,
  IconMarkdown,
  IconEye
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import type { ClipboardItem } from '../types';
import { detectMarkdown } from '../../../../utils/markdownUtils';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const ClipboardHistory: React.FC = () => {
  const navigate = useNavigate();
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
            id: 'test-mermaid-1',
            content: 'graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]',
            preview: '流程图: 开始 → 处理 → 结束',
            type: 'mermaid',
            timestamp: Date.now() - 1000 * 60 * 5,
            favorite: false,
            tags: ['测试', 'mermaid']
          },
          {
            id: 'test-text-1',
            content: '# 这是一个标题\n\n这是一些普通文本内容。',
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
      if (window.electronAPI) {
        console.log('开始复制到剪贴板:', item.id);
        const response = await window.electronAPI.copyToClipboard(item.content);
        if (response.success) {
          console.log('复制成功，等待事件更新历史记录');
          notifications.show({
            title: '复制成功',
            message: '内容已复制到剪贴板',
            color: 'green',
            autoClose: 2000
          });
          // 移除手动调用loadClipboardHistory，依赖主进程事件更新
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      notifications.show({
        title: '复制失败',
        message: '复制到剪贴板时发生错误',
        color: 'red',
        autoClose: 3000
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

  const getTypeIcon = (type: ClipboardItem['type']) => {
    switch (type) {
      case 'image':
        return <IconPhoto size={16} />;
      case 'file':
        return <IconFile size={16} />;
      case 'code':
        return <IconCode size={16} />;
      case 'mermaid':
        return <IconMarkdown size={16} />;
      default:
        return null;
    }
  };

  const handleViewMarkdown = (item: ClipboardItem) => {
    navigate(`/markdown/${item.id}`);
  };

  const isMarkdown = (item: ClipboardItem) => {
    return item.type === 'text' && detectMarkdown(item.content);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
      return '刚刚';
    } else if (diffMins < 60) {
      return `${diffMins} 分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小时前`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const filteredItems = clipboardItems
    .filter(item => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp); // 按时间戳降序排列，最新的在前

  const handleCardClick = (item: ClipboardItem) => {
    if (item.type === 'text' || item.type === 'mermaid' || item.type === 'file') {
      navigate(`/markdown/${item.id}`);
    }
  };

  const renderClipboardItem = (item: ClipboardItem) => {
    return (
      <Card 
        key={item.id} 
        shadow="sm" 
        padding="md" 
        radius="md" 
        className="clipboard-item"
        style={{ cursor: (item.type === 'text' || item.type === 'mermaid' || item.type === 'file') ? 'pointer' : 'default' }}
        onClick={() => handleCardClick(item)}
      >
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            {getTypeIcon(item.type)}
            <Badge variant="light" size="sm">
              {item.type === 'text' ? '文本' : 
               item.type === 'image' ? '图片' :
               item.type === 'file' ? '文件' :
               item.type === 'mermaid' ? 'Mermaid' : '代码'}
            </Badge>
            {isMarkdown(item) && (
              <Badge variant="light" size="sm" color="blue" leftSection={<IconMarkdown size={12} />}>
                Markdown
              </Badge>
            )}
            {item.type === 'mermaid' && (
              <Badge variant="light" size="sm" color="green" leftSection={<IconMarkdown size={12} />}>
                图表
              </Badge>
            )}
            {item.favorite && (
              <IconHeartFilled size={14} color="red" />
            )}
          </Group>
          
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {formatTimestamp(item.timestamp)}
            </Text>
            
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon 
                  variant="subtle" 
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconCopy size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyToClipboard(item);
                  }}
                >
                  复制
                </Menu.Item>
                {(isMarkdown(item) || item.type === 'mermaid' || item.type === 'file') && (
                  <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMarkdown(item);
                    }}
                  >
                    {item.type === 'mermaid' ? '查看图表' : item.type === 'file' ? '查看 Markdown' : '查看 Markdown'}
                  </Menu.Item>
                )}
                <Menu.Item
                  leftSection={item.favorite ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(item);
                  }}
                >
                  {item.favorite ? '取消收藏' : '添加收藏'}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTag size={14} />}
                  onClick={(e) => e.stopPropagation()}
                >
                  添加标签
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item);
                  }}
                >
                  删除
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
        
        <div style={{ marginBottom: '8px' }}>
          {item.type === 'image' && item.preview ? (
            <Image
              src={item.preview}
              alt="剪贴板图片"
              className="image-preview"
              fit="contain"
              height={120}
            />
          ) : item.type === 'code' ? (
            <Code block className="code-block">
              {item.preview}
            </Code>
          ) : item.type === 'text' ? (
            <div style={{ maxHeight: '120px', overflow: 'hidden' }}>
              <MarkdownRenderer 
                content={item.preview} 
                options={{ 
                  enableSyntaxHighlight: false,
                  enableMermaid: false,
                  enableMath: false,
                  enableTableOfContents: false
                }}
                className="text-sm"
              />
            </div>
          ) : (
            <div style={{ maxHeight: '120px', overflow: 'hidden' }}>
              <MarkdownRenderer 
                content={item.preview ?? ''} 
                options={{ 
                  enableSyntaxHighlight: false,
                  enableMermaid: item.type === 'mermaid',
                  enableMath: false,
                  enableTableOfContents: false
                }}
                className="text-sm"
              />
            </div>
          )}
        </div>
        
        {item.tags.length > 0 && (
          <Group gap="xs" mt="xs">
            {item.tags.map((tag, index) => (
              <Badge key={index} variant="outline" size="xs">
                {tag}
              </Badge>
            ))}
          </Group>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>加载剪贴板历史...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="加载失败">
          {error}
          <Button
            variant="light"
            size="sm"
            mt="md"
            leftSection={<IconRefresh size={16} />}
            onClick={loadClipboardHistory}
          >
            重试
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xs">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>剪贴板历史</Title>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={loadClipboardHistory}
          >
            刷新
          </Button>
        </Group>
        
        <TextInput
          placeholder="搜索剪贴板内容..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          className="search-input"
        />
        
        {filteredItems.length === 0 ? (
          <Center h={200}>
            <Stack align="center" gap="md">
              <IconClipboard size={48} color="gray" />
              <Text c="dimmed">
                {searchQuery ? '没有找到匹配的剪贴板项目' : '暂无剪贴板历史'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea h={600}>
            <Stack gap="md">
              {filteredItems.map(renderClipboardItem)}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Container>
  );
};

export default ClipboardHistory;