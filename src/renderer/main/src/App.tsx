import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, Group, Text, ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMoon, IconSun, IconClipboard } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import Sidebar from './components/Sidebar';
import ClipboardHistory from './pages/ClipboardHistory';
import MarkdownViewer from '../../../pages/MarkdownViewer';
import MermaidTest from '../../../pages/MermaidTest';
import Favorites from './pages/Favorites';


import type { AppConfig } from './types';

function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  // 键盘快捷键：Cmd+B (Mac) 或 Ctrl+B (Windows/Linux) 切换导航栏
  useHotkeys([
    ['mod+B', () => setCollapsed(!collapsed)]
  ]);

  useEffect(() => {
    // 初始化应用
    initializeApp();
    
    // 监听配置变化
    const handleConfigUpdate = (newConfig: AppConfig) => {
      setConfig(newConfig);
    };
    
    // 注册 IPC 监听器
    if (window.electronAPI) {
      window.electronAPI.onConfigUpdate(handleConfigUpdate);
    }
    
    return () => {
      // 清理监听器
      if (window.electronAPI) {
        // 这里应该有移除监听器的方法，但当前 API 设计中没有
        // 在实际项目中应该添加 removeListener 方法
      }
    };
  }, []);

  const initializeApp = async () => {
    try {
      if (window.electronAPI) {
        // 获取初始配置
        const response = await window.electronAPI.getConfig();
        if (response.success && response.data) {
          setConfig(response.data);
          
          // 根据配置设置主题
          if (response.data.theme === 'dark') {
            if (colorScheme !== 'dark') {
              toggleColorScheme();
            }
          } else if (response.data.theme === 'light') {
            if (colorScheme !== 'light') {
              toggleColorScheme();
            }
          }
        }
        
        notifications.show({
          title: '欢迎使用剪贴板查看器',
          message: '应用已成功启动',
          color: 'green',
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      notifications.show({
        title: '初始化失败',
        message: '应用初始化时发生错误',
        color: 'red',
        autoClose: 5000
      });
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    toggleColorScheme();
    
    // 保存主题设置到配置
    if (window.electronAPI && config) {
      try {
        await window.electronAPI.updateConfig({ theme: newTheme });
      } catch (error) {
        console.error('Failed to save theme setting:', error);
      }
    }
  };



  return (
    <AppShell
      header={{ height: 40 }}
      navbar={{
        width: collapsed ? 60 : 200,
        breakpoint: 'xs',
        collapsed: { desktop: false, mobile: false }
      }}
      padding="md"
    >
      <AppShell.Header>
        <div style={{ 
          position: 'relative', 
          height: '100%', 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center',
          padding: '0 16px'
        }}>
          {/* 居中的标题 */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1
          }}>
            <IconClipboard 
              size={18} 
              style={{ 
                color: 'var(--mantine-color-blue-6)',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                flexShrink: 0
              }} 
            />
            <Text 
              size="md" 
              fw={700}
              style={{ 
                letterSpacing: '0.2px',
                background: 'linear-gradient(135deg, var(--mantine-color-gray-9) 0%, var(--mantine-color-gray-7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                whiteSpace: 'nowrap'
              }}
            >
              剪贴板查看器
            </Text>
          </div>
          
          {/* 右侧操作按钮组 */}
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 2
          }}>
            <Tooltip label={colorScheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
              <ActionIcon
                variant="subtle"
                size="md"
                onClick={handleThemeToggle}
                style={{ 
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px'
                }}
              >
                {colorScheme === 'dark' ? (
                  <IconSun size={14} />
                ) : (
                  <IconMoon size={14} />
                )}
              </ActionIcon>
            </Tooltip>
            

            

          </div>
        </div>
      </AppShell.Header>

      <AppShell.Navbar p={collapsed ? "xs" : "md"}>
        <Sidebar expanded={!collapsed} onToggleExpand={() => setCollapsed(!collapsed)} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/history" replace />} />
          <Route path="/history" element={<ClipboardHistory />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/markdown/:id" element={<MarkdownViewer />} />
          <Route path="/mermaid-test" element={<MermaidTest />} />

          <Route path="*" element={<Navigate to="/history" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;