import React from 'react';
import { NavLink, Stack, Text, Badge, Group } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconClipboard,
  IconSettings,
  IconHeart,
  IconPhoto,
  IconFile,
  IconCode
} from '@tabler/icons-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      label: '全部历史',
      icon: <IconClipboard size={18} />,
      path: '/history'
    },
    {
      label: '收藏夹',
      icon: <IconHeart size={18} />,
      path: '/favorites'
    },
    {
      label: '图片',
      icon: <IconPhoto size={18} />,
      path: '/images'
    },
    {
      label: '文件',
      icon: <IconFile size={18} />,
      path: '/files'
    },
    {
      label: '代码',
      icon: <IconCode size={18} />,
      path: '/code'
    },
    {
      label: '设置',
      icon: <IconSettings size={18} />,
      path: '/settings'
    }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500} c="dimmed" mb="xs">
        导航
      </Text>
      
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          label={
            <Group justify="space-between" w="100%">
              <Text size="sm">{item.label}</Text>
              {item.badge && (
                <Badge size="xs" variant="light">
                  {item.badge}
                </Badge>
              )}
            </Group>
          }
          leftSection={item.icon}
          active={location.pathname === item.path}
          onClick={() => handleNavClick(item.path)}
          style={{
            borderRadius: '8px',
            marginBottom: '4px'
          }}
        />
      ))}
      
      <Text size="xs" c="dimmed" mt="md" ta="center">
        剪贴板查看器 v1.0.0
      </Text>
    </Stack>
  );
};

export default Sidebar;