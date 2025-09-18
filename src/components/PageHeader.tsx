import React from 'react';
import { Group, Title, ActionIcon, Tooltip } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSection?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightSection
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <Group justify="space-between" mb="lg">
      <Group>
        <Tooltip label="返回">
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={handleBack}
            color="gray"
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
        </Tooltip>
        <div>
          <Title order={2}>{title}</Title>
          {subtitle && (
            <Title order={4} c="dimmed" fw={400}>
              {subtitle}
            </Title>
          )}
        </div>
      </Group>
      {rightSection && (
        <Group>
          {rightSection}
        </Group>
      )}
    </Group>
  );
};

export default PageHeader;