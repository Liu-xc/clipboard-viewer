import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { MarkdownContent, MarkdownRenderOptions } from '../../../../../shared/types';
import { detectMermaid } from '../../../../utils/markdownUtils';
import { useMantineColorScheme, Modal, Image } from '@mantine/core';
import '@uiw/react-md-editor/markdown-editor.css';
import './MarkdownRenderer.css';
import { getCodeString } from 'rehype-rewrite';
import mermaid from 'mermaid';
import { notifications } from '@mantine/notifications';

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
  
  // 图片全屏预览状态
  const [imageModalOpened, setImageModalOpened] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');



  // 生成随机ID用于mermaid图表
  const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
  
  // 自定义链接组件，点击时在浏览器中打开
  const CustomLink = useCallback(({ href, children, ...props }: any) => {
    const handleClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      
      console.log('CustomLink clicked:', { href, hasElectronAPI: !!window.electronAPI });
      
      if (!href) {
        console.warn('CustomLink: href is empty');
        notifications.show({
          title: '链接错误',
          message: '链接地址为空',
          color: 'orange'
        });
        return;
      }
      
      // 检查是否在 Electron 环境中以及 openExternal 方法是否可用
      if (!window.electronAPI || typeof window.electronAPI.openExternal !== 'function') {
        console.warn('CustomLink: electronAPI or openExternal not available');
        // 在非 Electron 环境中（如 Storybook）或方法不可用时，使用 window.open
        window.open(href, '_blank');
        notifications.show({
          title: '链接已打开',
          message: '在新标签页中打开链接（fallback模式）',
          color: 'blue'
        });
        return;
      }
      
      try {
        console.log('====== CustomLink: calling electronAPI.openExternal with:', window.electronAPI.openExternal);
        const result = await window.electronAPI.openExternal(href);
        console.log('CustomLink: openExternal result:', result);
        
        if (result && result.success) {
          notifications.show({
            title: '链接已打开',
            message: '已在默认浏览器中打开链接',
            color: 'green'
          });
        } else if (result && !result.success) {
          throw new Error(result.error || '未知错误');
        }
      } catch (error) {
        console.error('CustomLink: openExternal failed:', error);
        notifications.show({
          title: '打开链接失败',
          message: `无法在浏览器中打开链接: ${error}`,
          color: 'red'
        });
      }
    };
    
    return (
      <a 
        href={href} 
        onClick={handleClick}
        style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
        {...props}
      >
        {children}
      </a>
    );
  }, []);
  
  // 自定义图片组件，点击时全屏预览
  const CustomImage = useCallback(({ src, alt, ...props }: any) => {
    const handleImageClick = () => {
      if (src) {
        setSelectedImage(src);
        setImageModalOpened(true);
      }
    };
    
    return (
      <img 
        src={src} 
        alt={alt}
        onClick={handleImageClick}
        style={{ cursor: 'pointer', maxWidth: '100%', height: 'auto' }}
        {...props}
      />
    );
  }, []);

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

  // 使用useRef来保持H1过滤状态
  const firstH1FoundRef = useRef(false);
  
  // 重置H1过滤状态当内容改变时
  useEffect(() => {
    firstH1FoundRef.current = false;
  }, [content]);

  // 配置 @uiw/react-md-editor 的预览选项
  const previewOptions = useMemo(() => {
    return {
      components: {
        code: Code,
        a: CustomLink,
        img: CustomImage
      },
      rehypeRewrite: (node: any, index: number, parent: any) => {
        // 过滤掉第一个H1标题，避免与PageHeader重复
        if (node.tagName === 'h1') {
          if (!firstH1FoundRef.current) {
            firstH1FoundRef.current = true;
            // 完全移除第一个H1标题 - 返回false来移除节点
            return false;
          }
        }
        
        // 处理mermaid代码块
        if (node.tagName === 'code' && parent && parent.tagName === 'pre') {
          const className = node.properties?.className;
          if (className && className.includes('language-mermaid')) {
            // 让自定义Code组件处理mermaid渲染
          }
        }
      }
    };
    }, [Code, CustomLink, CustomImage, content]);

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
    <>
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
      
      {/* 图片全屏预览模态框 */}
      <Modal
        opened={imageModalOpened}
        onClose={() => setImageModalOpened(false)}
        size="xl"
        centered
        withCloseButton={false}
        padding={0}
        styles={{
          content: {
            backgroundColor: 'transparent',
          },
          body: {
            padding: 0,
          }
        }}
      >
        <Image
          src={selectedImage}
          alt="全屏预览"
          fit="contain"
          style={{
            maxHeight: '90vh',
            maxWidth: '90vw',
            cursor: 'pointer'
          }}
          onClick={() => setImageModalOpened(false)}
        />
      </Modal>
    </>
  );
};

export default MarkdownRenderer;