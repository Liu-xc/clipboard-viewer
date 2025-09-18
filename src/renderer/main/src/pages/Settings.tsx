import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Text,
  Switch,
  Select,
  NumberInput,
  Slider,
  Button,
  Divider,
  Alert,
  TextInput,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import {
  IconSettings,
  IconPalette,
  IconBell,
  IconKeyboard,
  IconCircle,
  IconWindow,
  IconClipboard,
  IconRefresh,
  IconDownload,
  IconUpload,
  IconTrash
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { AppConfig } from '../types';
import PageHeader from '../components/PageHeader';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      if (window.electronAPI) {
        const response = await window.electronAPI.getConfig();
        if (response.success && response.data) {
          setConfig(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      notifications.show({
        title: '加载失败',
        message: '无法加载应用配置',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (updates: Partial<AppConfig>) => {
    try {
      setSaving(true);
      
      if (window.electronAPI && config) {
        const newConfig = { ...config, ...updates };
        const response = await window.electronAPI.updateConfig(updates);
        
        if (response.success) {
          setConfig(newConfig);
          notifications.show({
            title: '保存成功',
            message: '设置已保存',
            color: 'green',
            autoClose: 2000
          });
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      notifications.show({
        title: '保存失败',
        message: '保存设置时发生错误',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfig = async () => {
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.resetConfig();
        if (response.success) {
          await loadConfig();
          notifications.show({
            title: '重置成功',
            message: '设置已重置为默认值',
            color: 'green'
          });
        }
      }
    } catch (error) {
      console.error('Failed to reset config:', error);
      notifications.show({
        title: '重置失败',
        message: '重置设置时发生错误',
        color: 'red'
      });
    }
  };

  const handleExportConfig = async () => {
    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.exportConfig();
        if (response.success && response.data) {
          // 创建下载链接
          const blob = new Blob([response.data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `clipboard-viewer-config-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          notifications.show({
            title: '导出成功',
            message: '配置文件已下载',
            color: 'green'
          });
        }
      }
    } catch (error) {
      console.error('Failed to export config:', error);
      notifications.show({
        title: '导出失败',
        message: '导出配置时发生错误',
        color: 'red'
      });
    }
  };

  if (loading || !config) {
    return (
      <Container size="md" py="xl">
        <Text>加载设置中...</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="md">
      <Stack gap="lg">
        <PageHeader
          title="应用设置"
          actions={
            <Group>
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={loadConfig}
              >
                刷新
              </Button>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                onClick={handleExportConfig}
              >
                导出配置
              </Button>
            </Group>
          }
        />

        {/* 外观设置 */}
        <Card shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <IconPalette size={20} />
            <Text fw={500}>外观设置</Text>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>主题</Text>
                <Text size="xs" c="dimmed">选择应用的外观主题</Text>
              </div>
              <Select
                value={config.theme}
                onChange={(value) => value && saveConfig({ theme: value as AppConfig['theme'] })}
                data={[
                  { value: 'light', label: '浅色' },
                  { value: 'dark', label: '深色' },
                  { value: 'auto', label: '跟随系统' }
                ]}
                w={120}
              />
            </Group>
          </Stack>
        </Card>

        {/* 通用设置 */}
        <Card shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <IconSettings size={20} />
            <Text fw={500}>通用设置</Text>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>开机自启</Text>
                <Text size="xs" c="dimmed">系统启动时自动运行应用</Text>
              </div>
              <Switch
                checked={config.autoStart}
                onChange={(event) => saveConfig({ autoStart: event.currentTarget.checked })}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>启用通知</Text>
                <Text size="xs" c="dimmed">显示剪贴板更新通知</Text>
              </div>
              <Switch
                checked={config.enableNotifications}
                onChange={(event) => saveConfig({ enableNotifications: event.currentTarget.checked })}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>最大历史记录数</Text>
                <Text size="xs" c="dimmed">保存的剪贴板项目数量上限</Text>
              </div>
              <NumberInput
                value={config.maxHistoryItems}
                onChange={(value) => typeof value === 'number' && saveConfig({ maxHistoryItems: value })}
                min={10}
                max={1000}
                step={10}
                w={100}
              />
            </Group>
          </Stack>
        </Card>

        {/* 快捷键设置 */}
        <Card shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <IconKeyboard size={20} />
            <Text fw={500}>快捷键设置</Text>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>全局快捷键</Text>
                <Text size="xs" c="dimmed">打开剪贴板查看器的快捷键</Text>
              </div>
              <TextInput
                value={config.hotkey}
                onChange={(event) => saveConfig({ hotkey: event.currentTarget.value })}
                placeholder="CommandOrControl+Shift+V"
                w={200}
              />
            </Group>
          </Stack>
        </Card>

        {/* 悬浮球设置 */}
        <Card shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <IconCircle size={20} />
            <Text fw={500}>悬浮球设置</Text>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>启用悬浮球</Text>
                <Text size="xs" c="dimmed">显示桌面悬浮球</Text>
              </div>
              <Switch
                checked={config.floatingBall.enabled}
                onChange={(event) => saveConfig({
                  floatingBall: { ...config.floatingBall, enabled: event.currentTarget.checked }
                })}
              />
            </Group>
            
            {config.floatingBall.enabled && (
              <>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>透明度</Text>
                    <Text size="sm" c="dimmed">{Math.round(config.floatingBall.opacity * 100)}%</Text>
                  </Group>
                  <Slider
                    value={config.floatingBall.opacity}
                    onChange={(value) => saveConfig({
                      floatingBall: { ...config.floatingBall, opacity: value }
                    })}
                    min={0.1}
                    max={1}
                    step={0.1}
                    marks={[
                      { value: 0.1, label: '10%' },
                      { value: 0.5, label: '50%' },
                      { value: 1, label: '100%' }
                    ]}
                  />
                </div>
                
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>大小</Text>
                    <Text size="sm" c="dimmed">{config.floatingBall.size}px</Text>
                  </Group>
                  <Slider
                    value={config.floatingBall.size}
                    onChange={(value) => saveConfig({
                      floatingBall: { ...config.floatingBall, size: value }
                    })}
                    min={40}
                    max={100}
                    step={5}
                    marks={[
                      { value: 40, label: '40px' },
                      { value: 60, label: '60px' },
                      { value: 80, label: '80px' },
                      { value: 100, label: '100px' }
                    ]}
                  />
                </div>
              </>
            )}
          </Stack>
        </Card>

        {/* 主窗口设置 */}
        <Card shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <IconWindow size={20} />
            <Text fw={500}>主窗口设置</Text>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>窗口置顶</Text>
                <Text size="xs" c="dimmed">主窗口始终显示在最前面</Text>
              </div>
              <Switch
                checked={config.mainWindow.alwaysOnTop}
                onChange={(event) => saveConfig({
                  mainWindow: { ...config.mainWindow, alwaysOnTop: event.currentTarget.checked }
                })}
              />
            </Group>
            
            <Group>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500} mb="xs">窗口宽度</Text>
                <NumberInput
                  value={config.mainWindow.width}
                  onChange={(value) => typeof value === 'number' && saveConfig({
                    mainWindow: { ...config.mainWindow, width: value }
                  })}
                  min={400}
                  max={2000}
                  step={50}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500} mb="xs">窗口高度</Text>
                <NumberInput
                  value={config.mainWindow.height}
                  onChange={(value) => typeof value === 'number' && saveConfig({
                    mainWindow: { ...config.mainWindow, height: value }
                  })}
                  min={300}
                  max={1500}
                  step={50}
                />
              </div>
            </Group>
          </Stack>
        </Card>

        {/* 剪贴板设置 */}
        <Card shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <IconClipboard size={20} />
            <Text fw={500}>剪贴板设置</Text>
          </Group>
          
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>启用图片捕获</Text>
                <Text size="xs" c="dimmed">自动保存剪贴板中的图片</Text>
              </div>
              <Switch
                checked={config.clipboard.enableImageCapture}
                onChange={(event) => saveConfig({
                  clipboard: { ...config.clipboard, enableImageCapture: event.currentTarget.checked }
                })}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>启用文件捕获</Text>
                <Text size="xs" c="dimmed">自动保存剪贴板中的文件路径</Text>
              </div>
              <Switch
                checked={config.clipboard.enableFileCapture}
                onChange={(event) => saveConfig({
                  clipboard: { ...config.clipboard, enableFileCapture: event.currentTarget.checked }
                })}
              />
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>自动清理天数</Text>
                <Text size="xs" c="dimmed">自动删除指定天数前的记录</Text>
              </div>
              <NumberInput
                value={config.clipboard.autoCleanupDays}
                onChange={(value) => typeof value === 'number' && saveConfig({
                  clipboard: { ...config.clipboard, autoCleanupDays: value }
                })}
                min={1}
                max={365}
                step={1}
                w={100}
              />
            </Group>
          </Stack>
        </Card>

        {/* 危险操作 */}
        <Card shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <IconTrash size={20} color="red" />
            <Text fw={500} c="red">危险操作</Text>
          </Group>
          
          <Alert color="orange" mb="md">
            以下操作不可撤销，请谨慎操作
          </Alert>
          
          <Group>
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleResetConfig}
              loading={saving}
            >
              重置所有设置
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
};

export default Settings;