import React from 'react';
import { NavLink, Stack, Text, Badge, Group, ActionIcon, Tooltip } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconClipboard,
  IconHeart,
  IconChevronRight,
  IconChevronLeft
} from '@tabler/icons-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
}

interface SidebarProps {
  expanded: boolean;
  onToggleExpand: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggleExpand }) => {
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
    }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <Stack gap="xs" h="100%" style={{ padding: expanded ? '0' : '4px' }}>
      {/* 展开/收起按钮 */}
      <ActionIcon
        variant="subtle"
        size="sm"
        onClick={onToggleExpand}
        style={{
          alignSelf: expanded ? 'flex-end' : 'center',
          marginBottom: '8px',
          width: expanded ? '28px' : '32px',
          height: expanded ? '28px' : '32px'
        }}
      >
        {expanded ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
      </ActionIcon>

      {navItems.map((item) => (
        expanded ? (
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
        ) : (
          <Tooltip key={item.path} label={item.label} position="right">
            <ActionIcon
              variant={location.pathname === item.path ? 'filled' : 'subtle'}
              size="lg"
              onClick={() => handleNavClick(item.path)}
              style={{
                borderRadius: '8px',
                marginBottom: '4px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {item.icon}
            </ActionIcon>
          </Tooltip>
        )
      ))}
    </Stack>
  );
};

export default Sidebar;