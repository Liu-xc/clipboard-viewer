import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import PageHeader from './PageHeader';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    title: {
      control: 'text',
      description: '页面标题',
    },
    subtitle: {
      control: 'text',
      description: '页面副标题（可选）',
    },
    onBack: {
      action: 'back clicked',
      description: '返回按钮点击回调',
    },
    rightSection: {
      control: false,
      description: '右侧操作区域',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

// 基础用法
export const Default: Story = {
  args: {
    title: '剪贴板查看器',
    onBack: action('back-clicked'),
  },
};

// 带副标题
export const WithSubtitle: Story = {
  args: {
    title: 'Markdown 文档',
    subtitle: '查看和编辑 Markdown 内容',
    onBack: action('back-clicked'),
  },
};

// 带右侧操作按钮
export const WithRightSection: Story = {
  args: {
    title: '文档页面',
    subtitle: '查看和管理文档内容',
    onBack: action('back-clicked'),
    rightSection: (
      <>
        <Button
          variant="light"
          leftSection={<IconDownload size={16} />}
          onClick={action('download-clicked')}
        >
          导出
        </Button>
      </>
    ),
  },
};

// 长标题测试
export const LongTitle: Story = {
  args: {
    title: '这是一个非常长的页面标题，用来测试标题过长时的显示效果',
    subtitle: '这也是一个比较长的副标题，用来测试副标题的换行和显示效果',
    onBack: action('back-clicked'),
    rightSection: (
      <Button onClick={action('action-clicked')}>操作</Button>
    ),
  },
};

// 无回调函数（使用默认导航）
export const WithoutCallback: Story = {
  args: {
    title: '默认导航',
    subtitle: '点击返回按钮将使用默认的 navigate(-1)',
  },
};