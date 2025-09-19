import type { Meta, StoryObj } from '@storybook/react';
import MermaidChartV2 from './MermaidChartV2';

const meta: Meta<typeof MermaidChartV2> = {
  title: 'Components/MermaidChart',
  component: MermaidChartV2,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A component for rendering Mermaid diagrams with error handling and responsive design.'
      }
    }
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'The Mermaid diagram content'
    },
    title: {
      control: 'text',
      description: 'Optional title for the diagram'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof MermaidChartV2>;

const flowchartContent = `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix issue]
    E --> B
    C --> F[End]`;

const sequenceContent = `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Login request
    Frontend->>Backend: Authenticate
    Backend->>Database: Check credentials
    Database-->>Backend: User data
    Backend-->>Frontend: Auth token
    Frontend-->>User: Login success`;

const ganttContent = `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research           :done,    des1, 2024-01-01,2024-01-05
    Requirements       :done,    des2, 2024-01-06,2024-01-10
    Design             :active,  des3, 2024-01-11,2024-01-20
    section Development
    Frontend           :         dev1, 2024-01-21,2024-02-15
    Backend            :         dev2, 2024-01-25,2024-02-20
    Testing            :         test, 2024-02-16,2024-02-28`;

const pieContent = `pie title Programming Languages Usage
    "JavaScript" : 35
    "TypeScript" : 25
    "Python" : 20
    "Java" : 10
    "Others" : 10`;

const gitGraphContent = `gitgraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    commit`;

const mindmapContent = `mindmap
  root((Web Development))
    Frontend
      React
        Components
        Hooks
        State Management
      Vue
      Angular
    Backend
      Node.js
        Express
        Fastify
      Python
        Django
        Flask
      Database
        SQL
        NoSQL`;

const complexFlowchartContent = `flowchart LR
    subgraph "User Interface"
        A[Login Page]
        B[Dashboard]
        C[Settings]
    end
    
    subgraph "API Layer"
        D[Authentication API]
        E[User API]
        F[Data API]
    end
    
    subgraph "Database"
        G[(Users)]
        H[(Sessions)]
        I[(Application Data)]
    end
    
    A --> D
    B --> E
    B --> F
    C --> E
    
    D --> G
    D --> H
    E --> G
    F --> I
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#fff3e0
    style D fill:#fce4ec
    style E fill:#fce4ec
    style F fill:#fce4ec`;

const invalidContent = `invalid mermaid syntax
this should cause an error
{{{ broken`;

export const Flowchart: Story = {
  args: {
    content: flowchartContent,
    title: 'Simple Flowchart'
  }
};

export const SequenceDiagram: Story = {
  args: {
    content: sequenceContent,
    title: 'User Authentication Flow'
  }
};

export const GanttChart: Story = {
  args: {
    content: ganttContent,
    title: 'Project Timeline'
  }
};

export const PieChart: Story = {
  args: {
    content: pieContent,
    title: 'Technology Stack'
  }
};

export const GitGraph: Story = {
  args: {
    content: gitGraphContent,
    title: 'Git Workflow'
  }
};

export const Mindmap: Story = {
  args: {
    content: mindmapContent,
    title: 'Web Development Concepts'
  }
};

export const ComplexFlowchart: Story = {
  args: {
    content: complexFlowchartContent,
    title: 'System Architecture'
  }
};

export const WithoutTitle: Story = {
  args: {
    content: flowchartContent
  }
};

export const WithCustomClass: Story = {
  args: {
    content: pieContent,
    title: 'Styled Chart',
    className: 'border-2 border-purple-300 shadow-lg'
  }
};

export const ErrorState: Story = {
  args: {
    content: invalidContent,
    title: 'Invalid Mermaid Syntax'
  }
};

export const EmptyContent: Story = {
  args: {
    content: '',
    title: 'Empty Diagram'
  }
};

export const LoadingState: Story = {
  args: {
    content: complexFlowchartContent,
    title: 'Complex Diagram (Loading Demo)'
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the loading state while rendering complex diagrams.'
      }
    }
  }
};