import React, { useState, useEffect, useCallback } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconClipboard, IconClipboardData } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface FloatingBallConfig {
  enabled: boolean;
  opacity: number;
  size: number;
  position: { x: number; y: number };
}

const App: React.FC = () => {
  const [config, setConfig] = useState<FloatingBallConfig>({
    enabled: true,
    opacity: 0.8,
    size: 60,
    position: { x: 100, y: 100 }
  });
  // 移除拖动状态，现在由CSS的-webkit-app-region: drag处理
  const [hasNewClipboard, setHasNewClipboard] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        if (window.electronAPI) {
          const response = await window.electronAPI.getConfig();
          if (response.success && response.data) {
            setConfig(response.data.floatingBall);
            setTheme(response.data.theme);
          }
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
  }, []);

  // 监听剪贴板变化
  useEffect(() => {
    const handleClipboardChange = () => {
      setHasNewClipboard(true);
      // 3秒后清除新剪贴板标识
      setTimeout(() => setHasNewClipboard(false), 3000);
    };

    if (window.electronAPI) {
      // 监听剪贴板变化事件
      window.electronAPI.onClipboardChange?.(handleClipboardChange);
    }

    return () => {
      // 清理监听器
      if (window.electronAPI?.removeClipboardListener) {
        window.electronAPI.removeClipboardListener(handleClipboardChange);
      }
    };
  }, []);

  // 处理点击事件
  const handleClick = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.showMainWindow();
        if (!response.success) {
          notifications.show({
            title: '错误',
            message: '无法打开主窗口',
            color: 'red'
          });
        }
      }
    } catch (error) {
      console.error('Failed to show main window:', error);
      notifications.show({
        title: '错误',
        message: '打开主窗口时发生错误',
        color: 'red'
      });
    }
  }, []);

  // 移除所有拖动相关的事件处理，现在由CSS的-webkit-app-region: drag处理窗口拖动

  // 获取主题类名
  const getThemeClass = () => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light';
    }
    return `theme-${theme}`;
  };

  // 如果悬浮球被禁用，不渲染任何内容
  if (!config.enabled) {
    return null;
  }

  return (
    <Tooltip
      label="点击打开剪贴板查看器"
      position="top"
      withArrow
      openDelay={1000}
    >
      <div
        className={`floating-ball ${getThemeClass()} ${hasNewClipboard ? 'pulse' : ''}`}
        style={{
          width: config.size,
          height: config.size,
          opacity: config.opacity,
          cursor: 'pointer'
        }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="剪贴板查看器悬浮球"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <ActionIcon
          variant="transparent"
          size={config.size * 0.6}
          className="floating-ball-icon"
          style={{ pointerEvents: 'none' }}
        >
          {hasNewClipboard ? (
            <IconClipboardData size={config.size * 0.4} />
          ) : (
            <IconClipboard size={config.size * 0.4} />
          )}
        </ActionIcon>
      </div>
    </Tooltip>
  );
};

export default App;