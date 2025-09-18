// 剪贴板历史记录类型定义
export interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  size?: number;
  preview?: string;
}

// Markdown相关类型定义
export interface MarkdownContent {
  id: string;
  content: string;
  title?: string;
  hasCodeBlocks: boolean;
  hasMermaidDiagrams: boolean;
  hasImages: boolean;
  wordCount: number;
  estimatedReadTime: number; // 预估阅读时间（分钟）
}

// 目录结构类型
export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number; // 1-6 对应 h1-h6
  anchor: string;
  children?: TableOfContentsItem[];
}

// Mermaid图表类型
export interface MermaidDiagram {
  id: string;
  type: 'flowchart' | 'sequence' | 'gantt' | 'pie' | 'gitgraph' | 'mindmap' | 'timeline' | 'other';
  content: string;
  title?: string;
}

// 代码块类型
export interface CodeBlock {
  id: string;
  language: string;
  content: string;
  filename?: string;
  lineNumbers?: boolean;
}

// Markdown渲染配置
export interface MarkdownRenderOptions {
  enableSyntaxHighlight: boolean;
  enableMermaid: boolean;
  enableMath: boolean;
  enableTableOfContents: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// 搜索和过滤类型
export interface SearchFilters {
  query: string;
  type?: ClipboardItem['type'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasMarkdown?: boolean;
}

// 应用状态类型
export interface AppState {
  clipboardItems: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  searchFilters: SearchFilters;
  markdownRenderOptions: MarkdownRenderOptions;
  isLoading: boolean;
  error: string | null;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 导出类型
export interface ExportOptions {
  format: 'markdown' | 'html' | 'pdf' | 'txt';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}