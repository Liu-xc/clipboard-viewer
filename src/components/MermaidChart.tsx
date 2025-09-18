import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

export interface MermaidDiagram {
  type: 'flowchart' | 'sequence' | 'gantt' | 'pie' | 'gitgraph' | 'mindmap' | 'timeline' | 'other';
  content: string;
  title?: string;
}

interface MermaidChartProps {
  content: string;
  title?: string;
  className?: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ content, title, className = '' }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagramId] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // 初始化 Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      pie: {
        displayLegend: true,
        legendPosition: 'bottom',
        legendTextWrap: false
      },
      themeVariables: {
        pieOuterStrokeWidth: '2px',
        pieSectionTextSize: '14px',
        pieLegendTextSize: '14px'
      }
    });

    const renderDiagram = async () => {
      if (!elementRef.current || !content.trim()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 清空容器
        elementRef.current.innerHTML = '';

        // 验证和渲染 - 使用 Mermaid v11 API
        const parseResult = await mermaid.parse(content);
        if (!parseResult) {
          throw new Error('Invalid Mermaid syntax');
        }
        
        // 渲染图表
        const { svg } = await mermaid.render(diagramId, content);
        
        if (elementRef.current) {
          elementRef.current.innerHTML = svg;
        }
        
        // 添加响应式样式和图例修复
        const svgElement = elementRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.display = 'block';
          svgElement.style.margin = '0 auto';
            
          // 强制显示所有图例和文本元素
          const allTextElements = svgElement.querySelectorAll('text, .legend, g[class*="legend"], g[class*="pie"] text');
          allTextElements.forEach(element => {
            const el = element as HTMLElement;
            if (el.style) {
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              el.style.display = 'block';
              el.style.fill = 'currentColor';
            }
            el.removeAttribute('hidden');
          });
            
          // 延迟处理图例，确保 DOM 完全渲染
          setTimeout(() => {
            // 基于测试结果，Mermaid v11 的图例结构已经正确生成
            // 主要问题可能是样式覆盖，所以我们重点处理样式
            
            // 1. 处理所有图例相关的组元素
            const allGroups = svgElement.querySelectorAll('g');
            allGroups.forEach(group => {
              const groupEl = group as HTMLElement;
              // 确保所有组元素都可见
              groupEl.style.visibility = 'visible';
              groupEl.style.opacity = '1';
              groupEl.style.display = 'block';
              groupEl.removeAttribute('hidden');
            });
            
            // 2. 处理所有文本元素，确保图例文本可见
            const allTexts = svgElement.querySelectorAll('text');
            allTexts.forEach(text => {
              const textEl = text as HTMLElement;
              const textContent = text.textContent || '';
              
              // 为所有文本设置基本样式
              textEl.style.visibility = 'visible';
              textEl.style.opacity = '1';
              textEl.style.display = 'block';
              textEl.removeAttribute('hidden');
              
              // 为图例文本（非百分比标签）设置更明显的样式
              if (textContent && !textContent.includes('%') && !textContent.includes('title')) {
                textEl.style.fill = '#333';
                textEl.style.fontSize = '14px';
                textEl.style.fontWeight = '500';
              } else if (textContent.includes('%')) {
                // 饼图切片标签
                textEl.style.fill = '#666';
                textEl.style.fontSize = '12px';
              }
            });
            
            // 3. 特别处理可能的图例容器
            const possibleLegendContainers = svgElement.querySelectorAll('g[class*="legend"], g.legend, g[transform*="translate"]');
            possibleLegendContainers.forEach(container => {
              const containerEl = container as HTMLElement;
              containerEl.style.visibility = 'visible';
              containerEl.style.opacity = '1';
              containerEl.style.display = 'block';
              containerEl.removeAttribute('hidden');
              
              // 处理容器内的所有子元素
              const children = container.querySelectorAll('*');
              children.forEach(child => {
                const childEl = child as HTMLElement;
                childEl.style.visibility = 'visible';
                childEl.style.opacity = '1';
                childEl.style.display = 'block';
                childEl.removeAttribute('hidden');
              });
            });
          }, 150);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [content]);

  // 检测图表类型
  const detectDiagramType = (content: string): MermaidDiagram['type'] => {
    const trimmed = content.trim().toLowerCase();
    
    if (trimmed.startsWith('graph') || trimmed.startsWith('flowchart')) {
      return 'flowchart';
    }
    if (trimmed.startsWith('sequencediagram') || trimmed.includes('participant')) {
      return 'sequence';
    }
    if (trimmed.startsWith('gantt')) {
      return 'gantt';
    }
    if (trimmed.startsWith('pie')) {
      return 'pie';
    }
    if (trimmed.startsWith('gitgraph')) {
      return 'gitgraph';
    }
    if (trimmed.startsWith('mindmap')) {
      return 'mindmap';
    }
    if (trimmed.startsWith('timeline')) {
      return 'timeline';
    }
    
    return 'other';
  };

  const diagramType = detectDiagramType(content);

  if (error) {
    return (
      <div className={`mermaid-error border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 rounded-lg p-4 ${className}`}>
        {title && (
          <h4 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-300">
            {title}
          </h4>
        )}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Mermaid Diagram Error
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
            <details className="mt-2">
              <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:text-red-800 dark:hover:text-red-200">
                Show diagram source
              </summary>
              <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded border overflow-x-auto">
                <code>{content}</code>
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mermaid-chart border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
      {title && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {diagramType} diagram
          </p>
        </div>
      )}
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Rendering diagram...</span>
            </div>
          </div>
        ) : (
          <div 
            ref={elementRef} 
            className="mermaid-container overflow-x-auto"
            style={{ 
              minHeight: '100px',
              color: 'inherit'
            }}
          />
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {diagramType} • Mermaid
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const svgElement = elementRef.current?.querySelector('svg');
                if (svgElement) {
                  const svgData = new XMLSerializer().serializeToString(svgElement);
                  const blob = new Blob([svgData], { type: 'image/svg+xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mermaid-diagram-${diagramType}.svg`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Download as SVG"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidChart;
export { MermaidChart };