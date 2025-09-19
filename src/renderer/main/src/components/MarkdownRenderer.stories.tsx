import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownRenderer } from './MarkdownRenderer';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Components/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A component for rendering Markdown content with syntax highlighting and custom styling.'
      }
    }
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'The markdown content to render'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

const basicMarkdown = `# Hello World

This is a **basic** markdown example with *italic* text and \`inline code\`.

## Features

- Lists work great
- So do **bold** items
- And *italic* ones too

### Code Block

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

> This is a blockquote
> with multiple lines

[Link to example](https://example.com)`;

const complexMarkdown = `# Advanced Markdown Features

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & Unordered |
| Code | ✅ | Syntax highlighting |
| Links | ✅ | Internal & External |

## Code Examples

### TypeScript
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

const user: User = {
  id: 1,
  name: 'John Doe'
};
\`\`\`

### Python
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## Nested Lists

1. First item
   - Nested item
   - Another nested item
     - Deep nested item
2. Second item
   1. Numbered nested
   2. Another numbered

## Emphasis

**Bold text** and *italic text* and ***bold italic***.

~~Strikethrough~~ text.

## Blockquotes

> This is a blockquote
> 
> With multiple paragraphs
> 
> > And nested quotes

## Horizontal Rule

---

That's all folks!`;

const codeHeavyMarkdown = `# Code Documentation

## Installation

\`\`\`bash
npm install @storybook/react
pnpm add -D storybook
\`\`\`

## Configuration

\`\`\`json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
\`\`\`

## React Component

\`\`\`tsx
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="content">
        {children}
      </div>
    </div>
  );
};
\`\`\`

## CSS Styles

\`\`\`css
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.card h2 {
  margin-top: 0;
  color: #333;
}
\`\`\``;

export const Basic: Story = {
  args: {
    content: basicMarkdown
  }
};

export const Complex: Story = {
  args: {
    content: complexMarkdown
  }
};

export const CodeHeavy: Story = {
  args: {
    content: codeHeavyMarkdown
  }
};

export const SimpleText: Story = {
  args: {
    content: 'This is just plain text without any markdown formatting.'
  }
};

export const EmptyContent: Story = {
  args: {
    content: ''
  }
};

export const WithCustomClass: Story = {
  args: {
    content: basicMarkdown,
    className: 'border-2 border-blue-300 rounded-lg p-4'
  }
};

export const ListsAndQuotes: Story = {
  args: {
    content: `# Lists and Quotes Demo

## Unordered Lists

- First item
- Second item
  - Nested item
  - Another nested
    - Deep nested
- Third item

## Ordered Lists

1. Step one
2. Step two
   1. Sub-step A
   2. Sub-step B
3. Step three

## Mixed Lists

1. First numbered
   - Bullet point
   - Another bullet
2. Second numbered
   - More bullets

## Blockquotes

> "The best way to predict the future is to invent it."
> 
> — Alan Kay

> This is a longer blockquote that spans multiple lines
> and demonstrates how the component handles longer quoted text
> with proper formatting and styling.

## Task Lists

- [x] Completed task
- [ ] Pending task
- [ ] Another pending task`
  }
};