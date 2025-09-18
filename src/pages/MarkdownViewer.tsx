import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconDownload, IconShare, IconClock, IconFileText, IconList, IconEye, IconEyeOff, IconMenu, IconX, IconHash } from '@tabler/icons-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import TableOfContents from '../components/TableOfContents';
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
        // 这里应该从实际的数据源获取剪贴板项目
        // 暂时使用模拟数据
        const mockItem: ClipboardItem = {
          id,
          content: '# Sample Markdown\n\nThis is a sample markdown content for testing.',
          timestamp: Date.now(),
          type: 'text'
        };
        
        setClipboardItem(mockItem);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading markdown content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Loading Content
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <IconArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮和标题 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {directTitle || markdownContent?.title || 'Markdown Viewer'}
                </h1>
                {clipboardItem && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                    <IconClock size={14} />
                    <span>{formatTime(clipboardItem.timestamp)}</span>
                    {markdownContent && (
                      <>
                        <span>•</span>
                        <IconFileText size={14} />
                        <span>{markdownContent.wordCount} words</span>
                        <span>•</span>
                        <span>{markdownContent.estimatedReadTime} min read</span>
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-2">
              {/* 目录切换 */}
              {tableOfContents.length > 0 && (
                <button
                  onClick={() => setShowToc(!showToc)}
                  className={`p-2 rounded-lg transition-colors ${
                    showToc
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title="Toggle table of contents"
                >
                  <IconMenu size={18} />
                </button>
              )}

              {/* 原始内容切换 */}
              <button
                onClick={() => setShowRawContent(!showRawContent)}
                className={`p-2 rounded-lg transition-colors ${
                  showRawContent
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                title={showRawContent ? 'Show rendered' : 'Show raw content'}
              >
                {showRawContent ? <IconEye size={18} /> : <IconEyeOff size={18} />}
              </button>

              {/* 分享按钮 */}
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Share"
              >
                <IconShare size={18} />
              </button>

              {/* 导出菜单 */}
              <div className="relative group">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <IconDownload size={18} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('markdown')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Export as Markdown
                    </button>
                    <button
                      onClick={() => handleExport('html')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Export as HTML
                    </button>
                    <button
                      onClick={() => handleExport('txt')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Export as Text
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 目录侧边栏 */}
          {showToc && tableOfContents.length > 0 && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents
                  items={tableOfContents}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
            </aside>
          )}

          {/* 主要内容 */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              {showRawContent ? (
                /* 原始内容显示 */
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Raw Content
                    </h3>
                    <button
                      onClick={() => {
                        if (clipboardItem) {
                          navigator.clipboard.writeText(clipboardItem.content);
                        }
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Copy Raw
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                    {clipboardItem?.content}
                  </pre>
                </div>
              ) : (
                /* 渲染的Markdown内容 */
                <div className="p-6">
                  {clipboardItem && (
                    <MarkdownRenderer
                      content={clipboardItem.content}
                      options={renderOptions}
                    />
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MarkdownViewer;