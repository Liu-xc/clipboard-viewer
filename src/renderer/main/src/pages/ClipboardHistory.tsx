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
  IconClipboard
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { ClipboardItem } from '../types';

const ClipboardHistory: React.FC = () => {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClipboardHistory();
    
    // 监听剪贴板更新
    const handleClipboardUpdate = (items: ClipboardItem[]) => {
      setClipboardItems(items);
    };
    
    if (window.electronAPI) {
      window.electronAPI.onClipboardUpdate(handleClipboardUpdate);
    }
    
    return () => {
      // 清理监听器
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
        const response = await window.electronAPI.copyToClipboard(item.content);
        if (response.success) {
          notifications.show({
            title: '复制成功',
            message: '内容已复制到剪贴板',
            color: 'green',
            autoClose: 2000
          });
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
      default:
        return null;
    }
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

  const filteredItems = clipboardItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.content.toLowerCase().includes(query) ||
      item.preview.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const renderClipboardItem = (item: ClipboardItem) => {
    return (
      <Card key={item.id} shadow="sm" padding="md" radius="md" className="clipboard-item">
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            {getTypeIcon(item.type)}
            <Badge variant="light" size="sm">
              {item.type === 'text' ? '文本' : 
               item.type === 'image' ? '图片' :
               item.type === 'file' ? '文件' : '代码'}
            </Badge>
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
                <ActionIcon variant="subtle" size="sm">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconCopy size={14} />}
                  onClick={() => handleCopyToClipboard(item)}
                >
                  复制
                </Menu.Item>
                <Menu.Item
                  leftSection={item.favorite ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
                  onClick={() => handleToggleFavorite(item)}
                >
                  {item.favorite ? '取消收藏' : '添加收藏'}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTag size={14} />}
                >
                  添加标签
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => handleDeleteItem(item)}
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
          ) : (
            <Text size="sm" lineClamp={3}>
              {item.preview}
            </Text>
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
    <Container size="md" py="md">
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