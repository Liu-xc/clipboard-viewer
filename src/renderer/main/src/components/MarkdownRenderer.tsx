import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { MarkdownContent, MarkdownRenderOptions } from '../../../../../shared/types';
import { detectMermaid } from '../../../../utils/markdownUtils';
import { useMantineColorScheme } from '@mantine/core';
import '@uiw/react-md-editor/markdown-editor.css';
import './MarkdownRenderer.css';
import { getCodeString } from 'rehype-rewrite';
import mermaid from 'mermaid';

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
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const renderOptions = useMemo(() => ({
    ...defaultOptions,
    ...options
  }), [options]);



  // 生成随机ID用于mermaid图表
  const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);

  // 自定义代码块组件，支持mermaid渲染
  const Code = useCallback(({ inline, children = [], className, ...props }: any) => {
    const demoid = useRef(`dome${randomid()}`);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const isMermaid = className && /^language-mermaid/.test(className.toLocaleLowerCase());
    const code = getCodeString(props.node?.children || children);

    const reRender = async () => {
      if (container && isMermaid && renderOptions.enableMermaid) {
        try {
          const str = await mermaid.render(demoid.current, code);
          container.innerHTML = str.svg;
        } catch (error) {
          container.innerHTML = `<pre style="color: red;">${error}</pre>`;
        }
      }
    };

    useEffect(() => {
      reRender();
    }, [container, code, isMermaid]);

    const refElement = useCallback((node: HTMLDivElement) => {
      if (node !== null) {
        setContainer(node);
      }
    }, []);

    if (isMermaid && renderOptions.enableMermaid) {
      return (
        <div ref={refElement} className="my-4">
          <code id={demoid.current} style={{ display: 'none' }}>
            {code}
          </code>
        </div>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }, [renderOptions.enableMermaid]);

  // 配置 @uiw/react-md-editor 的预览选项
  const previewOptions = useMemo(() => {
    return {
      components: {
        code: Code
      },
      rehypeRewrite: (node: any, index: number, parent: any) => {
        // 处理mermaid代码块
        if (node.tagName === 'code' && parent && parent.tagName === 'pre') {
          const className = node.properties?.className;
          if (className && className.includes('language-mermaid')) {
            // 让自定义Code组件处理mermaid渲染
          }
        }
      }
    };
  }, [Code]);

  // 初始化mermaid，根据主题动态设置
  useEffect(() => {
    if (renderOptions.enableMermaid) {
      const mermaidTheme = theme === 'dark' ? 'dark' : 'default';
      mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme,
        securityLevel: 'loose'
      });
    }
  }, [renderOptions.enableMermaid, theme]);

  return (
    <div className={`markdown-renderer ${className}`} data-color-mode={theme}>
      <MDEditor.Markdown 
        source={content} 
        style={{ 
          whiteSpace: 'pre-wrap',
          backgroundColor: 'transparent',
          color: 'inherit'
        }}
        components={previewOptions.components}
        rehypeRewrite={previewOptions.rehypeRewrite}
      />
    </div>
  );
};

export default MarkdownRenderer;