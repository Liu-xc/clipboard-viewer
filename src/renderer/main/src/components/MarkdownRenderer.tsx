import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { MarkdownContent, MarkdownRenderOptions } from '@shared/types';
import MermaidChartV2 from './MermaidChartV2';
import { CodeBlock } from '../../../../components/CodeBlock';
import { detectMermaid } from '../../../../utils/markdownUtils';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  options?: Partial<MarkdownRenderOptions>;
  className?: string;
}

const defaultOptions: MarkdownRenderOptions = {
  enableSyntaxHighlight: true,
  enableMermaid: true,
  enableMath: false,
  enableTableOfContents: true,
  theme: 'auto'
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  options = {},
  className = ''
}) => {
  const renderOptions = useMemo(() => ({
    ...defaultOptions,
    ...options
  }), [options]);

  const components = useMemo(() => ({
    // 自定义代码块渲染
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        // 检查是否是Mermaid图表
        if (language === 'mermaid' && renderOptions.enableMermaid) {
          return (
            <MermaidChartV2
              content={String(children).replace(/\n$/, '')}
              className="my-4"
            />
          );
        }
        
        // 普通代码块
        if (renderOptions.enableSyntaxHighlight) {
          return (
            <CodeBlock
              language={language}
              content={String(children).replace(/\n$/, '')}
              className="my-4"
            />
          );
        }
      }
      
      // 行内代码
      return (
        <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
          {children}
        </code>
      );
    },
    
    // 自定义标题渲染，添加锚点
    h1: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h1 id={id} className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h2 id={id} className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h3 id={id} className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h4 id={id} className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h5 id={id} className="text-base font-semibold mt-3 mb-2 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ children, ...props }: any) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h6 id={id} className="text-sm font-semibold mt-3 mb-2 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h6>
      );
    },
    
    // 自定义段落样式
    p: ({ children, ...props }: any) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    
    // 自定义列表样式
    ul: ({ children, ...props }: any) => (
      <ul className="mb-4 ml-6 list-disc text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="mb-4 ml-6 list-decimal text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="mb-1" {...props}>
        {children}
      </li>
    ),
    
    // 自定义表格样式
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 dark:border-gray-600" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }: any) => (
      <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" {...props}>
        {children}
      </td>
    ),
    
    // 自定义引用样式
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2" {...props}>
        {children}
      </blockquote>
    ),
    
    // 自定义链接样式
    a: ({ children, href, ...props }: any) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    
    // 自定义分割线样式
    hr: ({ ...props }: any) => (
      <hr className="my-8 border-gray-300 dark:border-gray-600" {...props} />
    ),
    
    // 自定义图片样式
    img: ({ src, alt, ...props }: any) => (
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg shadow-md my-4"
        loading="lazy"
        {...props}
      />
    )
  }), [renderOptions]);

  // 检测是否为纯 mermaid 内容
  const isPureMermaid = useMemo(() => detectMermaid(content), [content]);

  // 如果是纯 mermaid 内容，直接渲染 MermaidChartV2
  if (isPureMermaid && renderOptions.enableMermaid) {
    return (
      <div className={`markdown-renderer ${className}`}>
        <MermaidChartV2
          content={content}
          className="my-4"
        />
      </div>
    );
  }

  return (
    <div className={`markdown-renderer prose prose-lg max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={renderOptions.enableSyntaxHighlight ? [rehypeHighlight] : []}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;