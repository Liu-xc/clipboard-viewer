import React, { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronRight, IconList, IconEye, IconEyeOff } from '@tabler/icons-react';
import { TableOfContentsItem } from '@shared/types';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  activeId?: string;
  onItemClick?: (anchor: string) => void;
  className?: string;
  collapsible?: boolean;
  showLevelIndicators?: boolean;
}

interface TOCItemProps {
  item: TableOfContentsItem;
  level: number;
  activeId?: string;
  onItemClick?: (anchor: string) => void;
  collapsible?: boolean;
  showLevelIndicators?: boolean;
}

const TOCItem: React.FC<TOCItemProps> = ({
  item,
  level,
  activeId,
  onItemClick,
  collapsible = true,
  showLevelIndicators = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeId === item.anchor;

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item.anchor);
    }
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getLevelStyles = (level: number) => {
    const baseStyles = 'transition-colors duration-200';
    const levelColors = {
      1: 'text-gray-900 font-semibold',
      2: 'text-gray-800 font-medium',
      3: 'text-gray-700',
      4: 'text-gray-600',
      5: 'text-gray-500',
      6: 'text-gray-400'
    };
    return `${baseStyles} ${levelColors[level as keyof typeof levelColors] || 'text-gray-400'}`;
  };

  const getIndentStyle = (level: number) => {
    return {
      paddingLeft: `${(level - 1) * 16 + 8}px`
    };
  };

  return (
    <div className="toc-item">
      <div
        className={`
          flex items-center py-1 px-2 rounded cursor-pointer group
          hover:bg-gray-100 transition-colors duration-200
          ${isActive ? 'bg-blue-50 border-l-2 border-blue-500' : ''}
          ${getLevelStyles(level)}
        `}
        style={getIndentStyle(level)}
        onClick={handleClick}
      >
        {/* 展开/折叠按钮 */}
        {hasChildren && collapsible && (
          <button
            onClick={toggleExpanded}
            className="mr-1 p-0.5 rounded hover:bg-gray-200 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <IconChevronDown size={16} />
            ) : (
              <IconChevronRight size={16} />
            )}
          </button>
        )}
        
        {/* 层级指示器 */}
        {showLevelIndicators && (
          <span className="mr-2 text-xs text-gray-400 font-mono min-w-[20px]">
            H{level}
          </span>
        )}
        
        {/* 标题文本 */}
        <span className="flex-1 truncate text-sm leading-relaxed">
          {item.title}
        </span>
        
        {/* 活跃状态指示器 */}
        {isActive && (
          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
        )}
      </div>
      
      {/* 子项目 */}
      {hasChildren && isExpanded && (
        <div className="toc-children">
          {item.children!.map((child) => (
            <TOCItem
              key={child.id}
              item={child}
              level={child.level}
              activeId={activeId}
              onItemClick={onItemClick}
              collapsible={collapsible}
              showLevelIndicators={showLevelIndicators}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  activeId,
  onItemClick,
  className = '',
  collapsible = true,
  showLevelIndicators = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);

  // 监听滚动，实现粘性定位效果
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsSticky(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!items || items.length === 0) {
    return (
      <div className={`toc-container ${className}`}>
        <div className="p-4 text-center text-gray-500 text-sm">
          <IconList size={32} className="mx-auto mb-2 opacity-50" />
          <p>No headings found</p>
        </div>
      </div>
    );
  }

  const handleItemClick = (anchor: string) => {
    if (onItemClick) {
      onItemClick(anchor);
    } else {
      // 默认行为：滚动到对应的标题
      const element = document.getElementById(anchor) || 
                    document.querySelector(`[data-anchor="${anchor}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const totalItems = items.reduce((count, item) => {
    const countChildren = (children: TableOfContentsItem[]): number => {
      return children.reduce((acc, child) => {
        return acc + 1 + (child.children ? countChildren(child.children) : 0);
      }, 0);
    };
    return count + 1 + (item.children ? countChildren(item.children) : 0);
  }, 0);

  return (
    <div className={`
      toc-container bg-white border border-gray-200 rounded-lg shadow-sm
      ${isSticky ? 'sticky top-4' : ''}
      ${className}
    `}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <IconList size={16} className="text-gray-600" />
          <h3 className="font-medium text-gray-900 text-sm">
            Table of Contents
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {totalItems}
          </span>
        </div>
        
        <button
          onClick={toggleVisibility}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label={isVisible ? 'Hide table of contents' : 'Show table of contents'}
        >
          {isVisible ? (
            <IconEyeOff size={16} className="text-gray-500" />
          ) : (
            <IconEye size={16} className="text-gray-500" />
          )}
        </button>
      </div>
      
      {/* 内容区域 */}
      {isVisible && (
        <div className="toc-content max-h-96 overflow-y-auto p-2">
          {items.map((item) => (
            <TOCItem
              key={item.id}
              item={item}
              level={item.level}
              activeId={activeId}
              onItemClick={handleItemClick}
              collapsible={collapsible}
              showLevelIndicators={showLevelIndicators}
            />
          ))}
        </div>
      )}
      
      {/* 底部信息 */}
      {isVisible && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Click to navigate</span>
            {collapsible && (
              <span>Click arrows to expand/collapse</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOfContents;

// 导出相关的hook，用于自动检测当前活跃的标题
export const useActiveHeading = (headings: TableOfContentsItem[]) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const anchor = entry.target.getAttribute('data-anchor') || 
                          entry.target.id;
            if (anchor) {
              setActiveId(anchor);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    // 观察所有标题元素
    const headingElements = headings.flatMap(heading => {
      const collectAnchors = (item: TableOfContentsItem): string[] => {
        const anchors = [item.anchor];
        if (item.children) {
          item.children.forEach(child => {
            anchors.push(...collectAnchors(child));
          });
        }
        return anchors;
      };
      return collectAnchors(heading);
    });

    headingElements.forEach(anchor => {
      const element = document.getElementById(anchor) || 
                     document.querySelector(`[data-anchor="${anchor}"]`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return activeId;
};