import React, { useState } from 'react';
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
  Alert,
  SimpleGrid,
  SegmentedControl,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import Masonry from 'react-masonry-css';
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
  IconEye,
  IconList,
  IconLayoutGrid,
  IconTrashX,
  IconAlertTriangle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import type { ClipboardItem } from '../types';
import { detectMarkdown, wrapAsCodeBlock } from '../../../../utils/markdownUtils';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ClipboardItemListProps {
  items: ClipboardItem[];
  title: string;
  searchPlaceholder?: string;
  emptyIcon?: React.ReactNode;
  emptyText?: string;
  emptySubText?: string;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCopy?: (item: ClipboardItem) => void;
  onToggleFavorite?: (item: ClipboardItem) => void;
  onDelete?: (item: ClipboardItem) => void;
  onClearAll?: () => void;
  showViewModeToggle?: boolean;
}

const ClipboardItemList: React.FC<ClipboardItemListProps> = ({
  items,
  title,
  searchPlaceholder = '搜索剪贴板内容...',
  emptyIcon = <IconClipboard size={48} color="gray" />,
  emptyText = '暂无剪贴板历史',
  emptySubText,
  loading = false,
  error = null,
  onRefresh,
  onCopy,
  onToggleFavorite,
  onDelete,
  onClearAll,
  showViewModeToggle = true
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'list'>('masonry');

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

  const filteredItems = items
    .filter(item => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleCardClick = (item: ClipboardItem) => {
    // 所有类型都可以跳转到 markdown 页面
    navigate(`/markdown/${item.id}`);
  };

  const renderClipboardItem = (item: ClipboardItem) => {
    return (
      <Card 
        key={item.id} 
        shadow="sm" 
        padding="md" 
        radius="md" 
        className="clipboard-item"
        style={{ cursor: 'pointer' }}
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
                    onCopy?.(item);
                  }}
                >
                  复制
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEye size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewMarkdown(item);
                  }}
                >
                  {item.type === 'mermaid' ? '查看图表' : 
                   item.type === 'file' ? '查看 Markdown' : 
                   item.type === 'code' ? '查看代码' : 
                   item.type === 'image' ? '查看图片' :
                   item.type === 'html' ? '查看 HTML' : '查看内容'}
                </Menu.Item>
                {onToggleFavorite && (
                  <Menu.Item
                    leftSection={item.favorite ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item);
                    }}
                  >
                    {item.favorite ? '取消收藏' : '添加收藏'}
                  </Menu.Item>
                )}
                <Menu.Item
                  leftSection={<IconTag size={14} />}
                  onClick={(e) => e.stopPropagation()}
                >
                  添加标签
                </Menu.Item>
                {onDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      删除
                    </Menu.Item>
                  </>
                )}
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
            <div style={{ maxHeight: '120px', overflow: 'hidden' }}>
              <MarkdownRenderer 
                content={wrapAsCodeBlock(item.preview)} 
                options={{ 
                  enableSyntaxHighlight: true,
                  enableMermaid: false,
                  enableMath: false,
                  enableTableOfContents: false
                }}
                className="text-sm"
              />
            </div>
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
          <Text>加载中...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="加载失败">
          {error}
          {onRefresh && (
            <Button
              variant="light"
              size="sm"
              mt="md"
              leftSection={<IconRefresh size={16} />}
              onClick={onRefresh}
            >
              重试
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xs">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>{title}</Title>
          <Group gap="md">
            {showViewModeToggle && (
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as 'grid' | 'masonry' | 'list')}
                data={[
                  {
                    label: (
                      <Center style={{ gap: 10 }}>
                        <IconLayoutGrid size={16} />
                        <span>瀑布流</span>
                      </Center>
                    ),
                    value: 'masonry',
                  },
                  {
                    label: (
                      <Center style={{ gap: 10 }}>
                        <IconLayoutGrid size={16} />
                        <span>网格</span>
                      </Center>
                    ),
                    value: 'grid',
                  },
                  {
                    label: (
                      <Center style={{ gap: 10 }}>
                        <IconList size={16} />
                        <span>列表</span>
                      </Center>
                    ),
                    value: 'list',
                  },
                ]}
              />
            )}
            {onRefresh && (
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={onRefresh}
              >
                刷新
              </Button>
            )}
            {onClearAll && items.length > 0 && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrashX size={16} />}
                onClick={() => {
                  modals.openConfirmModal({
                    title: '确认清除所有数据',
                    children: (
                      <Stack gap="md">
                        <Group gap="sm">
                          <IconAlertTriangle size={20} color="orange" />
                          <Text size="sm">
                            此操作将永久删除所有剪贴板历史记录，无法恢复。
                          </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          确定要继续吗？
                        </Text>
                      </Stack>
                    ),
                    labels: { confirm: '确认删除', cancel: '取消' },
                    confirmProps: { color: 'red' },
                    onConfirm: onClearAll,
                  });
                }}
              >
                清除所有
              </Button>
            )}
          </Group>
        </Group>
        
        <TextInput
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          className="search-input"
        />
        
        {filteredItems.length === 0 ? (
          <Center h={200}>
            <Stack align="center" gap="md">
              {emptyIcon}
              <Text c="dimmed">
                {searchQuery ? '没有找到匹配的剪贴板项目' : emptyText}
              </Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea h={600} style={{ padding: '0 8px' }}>
            {viewMode === 'list' ? (
              <Stack gap="md" style={{ padding: '8px 0' }}>
                {filteredItems.map(renderClipboardItem)}
              </Stack>
            ) : viewMode === 'grid' ? (
              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                  md: 3,
                  lg: 4
                }}
                spacing="md"
                style={{ padding: '8px 0' }}
              >
                {filteredItems.map(renderClipboardItem)}
              </SimpleGrid>
            ) : (
              <Masonry
                breakpointCols={{
                  default: 4,
                  1200: 3,
                  768: 2,
                  480: 1
                }}
                className="masonry-grid"
                columnClassName="masonry-grid-column"
              >
                {filteredItems.map(renderClipboardItem)}
              </Masonry>
            )}
          </ScrollArea>
        )}
      </Stack>
    </Container>
  );
};

export default ClipboardItemList;