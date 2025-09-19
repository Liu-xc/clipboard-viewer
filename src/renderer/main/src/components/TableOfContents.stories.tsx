import type { Meta, StoryObj } from '@storybook/react';
import TableOfContents from './TableOfContents';
import { TableOfContentsItem } from '@shared/types';

const meta: Meta<typeof TableOfContents> = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A hierarchical table of contents component with collapsible sections and active item tracking.'
      }
    }
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of table of contents items'
    },
    activeId: {
      control: 'text',
      description: 'ID of the currently active item'
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether sections can be collapsed'
    },
    showLevelIndicators: {
      control: 'boolean',
      description: 'Whether to show heading level indicators (H1, H2, etc.)'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof TableOfContents>;

const simpleItems: TableOfContentsItem[] = [
  {
    id: 'intro',
    title: 'Introduction',
    anchor: 'introduction',
    level: 1
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    anchor: 'getting-started',
    level: 1
  },
  {
    id: 'features',
    title: 'Features',
    anchor: 'features',
    level: 1
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    anchor: 'conclusion',
    level: 1
  }
];

const nestedItems: TableOfContentsItem[] = [
  {
    id: 'overview',
    title: 'Overview',
    anchor: 'overview',
    level: 1,
    children: [
      {
        id: 'what-is-it',
        title: 'What is it?',
        anchor: 'what-is-it',
        level: 2
      },
      {
        id: 'why-use-it',
        title: 'Why use it?',
        anchor: 'why-use-it',
        level: 2
      }
    ]
  },
  {
    id: 'installation',
    title: 'Installation',
    anchor: 'installation',
    level: 1,
    children: [
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        anchor: 'prerequisites',
        level: 2
      },
      {
        id: 'npm-install',
        title: 'NPM Installation',
        anchor: 'npm-install',
        level: 2,
        children: [
          {
            id: 'global-install',
            title: 'Global Installation',
            anchor: 'global-install',
            level: 3
          },
          {
            id: 'local-install',
            title: 'Local Installation',
            anchor: 'local-install',
            level: 3
          }
        ]
      },
      {
        id: 'yarn-install',
        title: 'Yarn Installation',
        anchor: 'yarn-install',
        level: 2
      }
    ]
  },
  {
    id: 'usage',
    title: 'Usage',
    anchor: 'usage',
    level: 1,
    children: [
      {
        id: 'basic-usage',
        title: 'Basic Usage',
        anchor: 'basic-usage',
        level: 2
      },
      {
        id: 'advanced-usage',
        title: 'Advanced Usage',
        anchor: 'advanced-usage',
        level: 2,
        children: [
          {
            id: 'configuration',
            title: 'Configuration',
            anchor: 'configuration',
            level: 3
          },
          {
            id: 'customization',
            title: 'Customization',
            anchor: 'customization',
            level: 3,
            children: [
              {
                id: 'themes',
                title: 'Themes',
                anchor: 'themes',
                level: 4
              },
              {
                id: 'plugins',
                title: 'Plugins',
                anchor: 'plugins',
                level: 4
              }
            ]
          }
        ]
      }
    ]
  }
];

const longTitlesItems: TableOfContentsItem[] = [
  {
    id: 'very-long-title',
    title: 'This is a very long title that should demonstrate how the component handles text overflow and wrapping in the table of contents',
    anchor: 'very-long-title',
    level: 1
  },
  {
    id: 'another-long-title',
    title: 'Another extremely long title that contains multiple words and should test the truncation behavior',
    anchor: 'another-long-title',
    level: 2
  },
  {
    id: 'short',
    title: 'Short',
    anchor: 'short',
    level: 1
  },
  {
    id: 'medium-length-title',
    title: 'Medium length title example',
    anchor: 'medium-length-title',
    level: 2
  }
];

const deepNestedItems: TableOfContentsItem[] = [
  {
    id: 'level1',
    title: 'Level 1 Heading',
    anchor: 'level1',
    level: 1,
    children: [
      {
        id: 'level2',
        title: 'Level 2 Heading',
        anchor: 'level2',
        level: 2,
        children: [
          {
            id: 'level3',
            title: 'Level 3 Heading',
            anchor: 'level3',
            level: 3,
            children: [
              {
                id: 'level4',
                title: 'Level 4 Heading',
                anchor: 'level4',
                level: 4,
                children: [
                  {
                    id: 'level5',
                    title: 'Level 5 Heading',
                    anchor: 'level5',
                    level: 5,
                    children: [
                      {
                        id: 'level6',
                        title: 'Level 6 Heading',
                        anchor: 'level6',
                        level: 6
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const Simple: Story = {
  args: {
    items: simpleItems
  }
};

export const Nested: Story = {
  args: {
    items: nestedItems
  }
};

export const WithActiveItem: Story = {
  args: {
    items: nestedItems,
    activeId: 'basic-usage'
  }
};

export const NonCollapsible: Story = {
  args: {
    items: nestedItems,
    collapsible: false
  }
};

export const WithoutLevelIndicators: Story = {
  args: {
    items: nestedItems,
    showLevelIndicators: false
  }
};

export const LongTitles: Story = {
  args: {
    items: longTitlesItems
  }
};

export const DeepNesting: Story = {
  args: {
    items: deepNestedItems
  }
};

export const EmptyState: Story = {
  args: {
    items: []
  }
};

export const WithCustomClass: Story = {
  args: {
    items: simpleItems,
    className: 'border-2 border-green-300 shadow-lg'
  }
};

export const InteractiveDemo: Story = {
  args: {
    items: nestedItems,
    activeId: 'configuration',
    onItemClick: (anchor: string) => {
      console.log('Clicked item:', anchor);
      // In a real app, this would scroll to the element
      alert(`Navigating to: ${anchor}`);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the interactive behavior when clicking on table of contents items.'
      }
    }
  }
};