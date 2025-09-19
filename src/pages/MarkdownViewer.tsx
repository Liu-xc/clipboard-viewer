import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Group, ActionIcon, Tooltip, Button, Menu, Text, LoadingOverlay, Alert, Grid, Paper, Title, Stack, Anchor, Code, TypographyStylesProvider } from '@mantine/core';
import { IconDownload, IconShare, IconClock, IconFileText, IconMenu2, IconEye, IconEyeOff } from '@tabler/icons-react';
import { MarkdownRenderer } from '../renderer/main/src/components/MarkdownRenderer';
import TableOfContents from '../renderer/main/src/components/TableOfContents';
import PageHeader from '../renderer/main/src/components/PageHeader';
import { ClipboardItem, MarkdownContent, MarkdownRenderOptions } from '../../shared/types';
import { detectMarkdown, parseMarkdownContent, generateTableOfContents } from '../utils/markdownUtils';

interface MarkdownViewerProps {
  // 可选的直接传入内容，用于预览模式
  content?: string;
  title?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content: directContent,
  title: directTitle
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 状态管理
  const [clipboardItem, setClipboardItem] = useState<ClipboardItem | null>(null);
  const [markdownContent, setMarkdownContent] = useState<MarkdownContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(true);
  const [showRawContent, setShowRawContent] = useState(false);
  const [renderOptions, setRenderOptions] = useState<MarkdownRenderOptions>({
    enableSyntaxHighlight: true,
    enableMermaid: true,
    enableMath: false,
    enableTableOfContents: true,
    theme: 'auto'
  });

  // 获取剪贴板项目数据
  useEffect(() => {
    const loadClipboardItem = async () => {
      if (directContent) {
        // 直接使用传入的内容
        const mockItem: ClipboardItem = {
          id: 'preview',
          content: directContent,
          timestamp: Date.now(),
          type: 'text'
        };
        setClipboardItem(mockItem);
        setIsLoading(false);
        return;
      }

      if (!id) {
        setError('No item ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // 从实际的数据源获取剪贴板项目
        if (window.electronAPI) {
          const response = await window.electronAPI.getClipboardHistory();
          if (response.success && response.data) {
            const item = response.data.find(item => item.id === id);
            if (item) {
              setClipboardItem(item);
            } else {
              setError('未找到指定的剪贴板项目');
            }
          } else {
            setError(response.error || '获取剪贴板历史失败');
          }
        } else {
          setError('无法访问剪贴板API');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clipboard item');
      } finally {
        setIsLoading(false);
      }
    };

    loadClipboardItem();
  }, [id, directContent]);

  // 解析Markdown内容
  useEffect(() => {
    if (!clipboardItem) return;

    try {
      const isMarkdown = detectMarkdown(clipboardItem.content);
      if (!isMarkdown) {
        setError('Content is not valid Markdown');
        return;
      }

      const parsed = parseMarkdownContent(clipboardItem.content);
      setMarkdownContent(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse Markdown content');
    }
  }, [clipboardItem]);

  // 生成目录
  const tableOfContents = useMemo(() => {
    if (!markdownContent || !renderOptions.enableTableOfContents) return [];
    return generateTableOfContents(markdownContent.content);
  }, [markdownContent, renderOptions.enableTableOfContents]);

  // 导出功能
  const handleExport = (format: 'markdown' | 'html' | 'txt') => {
    if (!clipboardItem) return;

    let content = clipboardItem.content;
    let mimeType = 'text/plain';
    let extension = 'txt';

    switch (format) {
      case 'markdown':
        mimeType = 'text/markdown';
        extension = 'md';
        break;
      case 'html':
        // 这里可以将markdown转换为HTML
        content = `<!DOCTYPE html>\n<html>\n<head>\n<title>${directTitle || 'Markdown Document'}</title>\n</head>\n<body>\n${content}\n</body>\n</html>`;
        mimeType = 'text/html';
        extension = 'html';
        break;
      case 'txt':
      default:
        // 移除markdown语法，保留纯文本
        content = content.replace(/[#*`_~\[\]()]/g, '');
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${directTitle || 'markdown-document'}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 分享功能
  const handleShare = async () => {
    if (!clipboardItem) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: directTitle || 'Markdown Document',
          text: clipboardItem.content.substring(0, 200) + '...',
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(window.location.href);
        // 这里可以显示一个提示
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
        <Text ta="center" c="dimmed">加载Markdown内容中...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="加载内容失败" mb="md">
          {error}
        </Alert>
        <Group justify="center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xs">
      <PageHeader
        title={directTitle || markdownContent?.title || 'Markdown查看器'}
        subtitle={
          clipboardItem ? (
            <Group gap="xs" c="dimmed">
              <IconClock size={14} />
              <Text size="sm">{formatTime(clipboardItem.timestamp)}</Text>
              {markdownContent && (
                <>
                  <Text size="sm">•</Text>
                  <IconFileText size={14} />
                  <Text size="sm">{markdownContent.wordCount} 字</Text>
                  <Text size="sm">•</Text>
                  <Text size="sm">{markdownContent.estimatedReadTime} 分钟阅读</Text>
                </>
              )}
            </Group>
          ) : undefined
        }

        rightSection={
          <Group gap="xs">
            {tableOfContents.length > 0 && (
              <Tooltip label="切换目录">
                <ActionIcon
                  variant={showToc ? "filled" : "subtle"}
                  onClick={() => setShowToc(!showToc)}
                >
                  <IconMenu2 size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            
            <Tooltip label={showRawContent ? "显示渲染内容" : "显示原始内容"}>
              <ActionIcon
                variant={showRawContent ? "filled" : "subtle"}
                onClick={() => setShowRawContent(!showRawContent)}
              >
                {showRawContent ? <IconEye size={16} /> : <IconEyeOff size={16} />}
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="分享">
              <ActionIcon
                variant="subtle"
                onClick={handleShare}
              >
                <IconShare size={16} />
              </ActionIcon>
            </Tooltip>
            
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Tooltip label="导出">
                  <ActionIcon variant="subtle">
                    <IconDownload size={16} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconFileText size={14} />}
                  onClick={() => handleExport('markdown')}
                >
                  导出为 Markdown
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileText size={14} />}
                  onClick={() => handleExport('html')}
                >
                  导出为 HTML
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileText size={14} />}
                  onClick={() => handleExport('txt')}
                >
                  导出为文本
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        }
      />

      {/* 主要内容区域 */}
      <Grid gutter="lg" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {/* 目录侧边栏 */}
        {showToc && tableOfContents.length > 0 && (
          <Grid.Col span={3}>
            <Paper withBorder p="md" style={{ position: 'sticky', top: '1rem', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
              <Title order={4} size="sm" mb="md">
                目录
              </Title>
              <Stack gap="xs">
                {tableOfContents.map((item, index) => (
                  <Anchor
                    key={index}
                    href={`#${item.id}`}
                    size="sm"
                    style={{
                      paddingLeft: `${(item.level - 1) * 12}px`,
                      fontWeight: item.level === 1 ? 600 : 400
                    }}
                  >
                    {item.text}
                  </Anchor>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
        )}

        {/* 主要内容 */}
        <Grid.Col span={showToc && tableOfContents.length > 0 ? 9 : 12}>
          <Paper withBorder p="xl" style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
            {showRawContent ? (
              <Code block>
                {clipboardItem?.content || directContent}
              </Code>
            ) : (
              <MarkdownRenderer
                content={clipboardItem?.content || directContent || ''}
                options={renderOptions}
              />
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default MarkdownViewer;