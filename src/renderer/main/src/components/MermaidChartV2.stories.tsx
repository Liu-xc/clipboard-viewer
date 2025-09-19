import type { Meta, StoryObj } from '@storybook/react';
import MermaidChartV2 from './MermaidChartV2';

const meta: Meta<typeof MermaidChartV2> = {
  title: 'Components/MermaidChartV2',
  component: MermaidChartV2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Mermaid diagram content'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PieChart: Story = {
  args: {
    content: `pie title Sample Data
    "Category A" : 42.96
    "Category B" : 50.05
    "Category C" : 10.01
    "Category D" : 5`,
  },
};

export const PieChartWithShowData: Story = {
  args: {
    content: `pie showData title Revenue Distribution
    "Product Sales" : 45
    "Services" : 30
    "Licensing" : 15
    "Other" : 10`,
  },
};

export const PetsAdoptedChart: Story = {
  args: {
    content: `pie title Pets adopted by volunteers
        "Dogs" : 386
        "Cats" : 85
        "Rats" : 15`,
  },
};

export const ProgrammingLanguages: Story = {
  args: {
    content: `pie title "Programming Languages"
    "JavaScript" : 45
    "Python" : 35
    "Java" : 20`,
  },
};

export const FlowChart: Story = {
  args: {
    content: `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`,
  },
};

export const SequenceDiagram: Story = {
  args: {
    content: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
  },
};