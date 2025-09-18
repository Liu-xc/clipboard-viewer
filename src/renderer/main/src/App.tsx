import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell, Burger, Group, Text, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconSettings, IconMoon, IconSun } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import Sidebar from './components/Sidebar';
import ClipboardHistory from './pages/ClipboardHistory';
import Settings from './pages/Settings';
import type { AppConfig } from './types';

function App() {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [config, setConfig] = useState<AppConfig | null>(null);

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

  const handleSettingsClick = () => {
    // 导航到设置页面的逻辑将在路由中处理
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={600}>
              剪贴板查看器
            </Text>
          </Group>
          
          <Group>
            <Tooltip label={colorScheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={handleThemeToggle}
              >
                {colorScheme === 'dark' ? (
                  <IconSun size={18} />
                ) : (
                  <IconMoon size={18} />
                )}
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="设置">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={handleSettingsClick}
              >
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<ClipboardHistory />} />
          <Route path="/history" element={<ClipboardHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;