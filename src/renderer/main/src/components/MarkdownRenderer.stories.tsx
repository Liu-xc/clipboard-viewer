import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownRenderer } from './MarkdownRenderer';
import React, { useState } from 'react';
import { MantineProvider, Button } from '@mantine/core';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Components/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Markdown content to render',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic markdown content
export const Basic: Story = {
  args: {
    content: `# Hello World

This is a **basic** markdown example with *italic* text.

## Features

- Lists
- **Bold text**
- *Italic text*
- \`inline code\`

### Code Block

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\``,
  },
};

// Mermaid diagram example
export const WithMermaid: Story = {
  args: {
    content: `# Mermaid Diagram Example

Here's a flowchart created with Mermaid:

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

And here's a sequence diagram:

\`\`\`mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: I'm good, thanks!
\`\`\``,
  },
};

// Test links and images interaction
export const LinksAndImages: Story = {
  args: {
    content: `# 链接和图片交互测试

## 链接测试

点击以下链接应该在浏览器中打开：

- [GitHub](https://github.com)
- [Google](https://google.com)
- [百度](https://baidu.com)

## 图片测试

点击以下图片应该全屏预览：

![测试图片1](https://picsum.photos/400/300?random=1)

![测试图片2](https://picsum.photos/500/400?random=2)

## 混合内容

这是一个包含 [链接](https://example.com) 和图片的段落：

![小图片](https://picsum.photos/200/150?random=3)

更多文本内容...`
  }
};

// Complex markdown with tables and code
export const Complex: Story = {
  args: {
    content: `# Complex Markdown Example

## Table

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & Unordered |
| Code | ✅ | Inline & Blocks |
| Tables | ✅ | With alignment |
| Mermaid | ✅ | Diagrams |

## Code Examples

### JavaScript
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

### Python
\`\`\`python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
\`\`\`

## Blockquote

> This is a blockquote example.
> It can span multiple lines.
>
> - Even with lists inside
> - Like this one

## Links and Images

[Visit GitHub](https://github.com)

---

*That's all folks!*`,
  },
};

// Empty content
export const Empty: Story = {
  args: {
    content: '',
  },
};

// With custom className
export const WithCustomClass: Story = {
  args: {
    content: `# Custom Styled Content

This example uses a custom CSS class.`,
    className: 'custom-markdown-style',
  },
};

export const ComplexContent: Story = {
  args: {
    content: `# 复杂内容测试

## 代码块
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

## Mermaid 图表
\`\`\`mermaid
graph TD
    A[开始] --> B{是否为空?}
    B -->|是| C[返回错误]
    B -->|否| D[处理数据]
    D --> E[返回结果]
    C --> F[结束]
    E --> F
\`\`\`

## 表格
| 功能 | 状态 | 备注 |
|------|------|------|
| 代码高亮 | ✅ | 支持多种语言 |
| Mermaid | ✅ | 支持流程图 |
| 表格 | ✅ | 支持基础表格 |

## 引用
> 这是一个引用块的示例
> 可以包含多行内容

## 链接和强调
这里有一个 [链接](https://example.com)，还有 **粗体** 和 *斜体* 文本。

内联代码：\`const result = process(data);\`
`,
    options: {
      enableMermaid: true,
      enableCodeHighlight: true
    }
  }
};

// Plain text content (non-markdown)
export const PlainText: Story = {
  args: {
    content: `这是一段普通的文本内容，不包含任何 Markdown 语法。

这里有一些特殊字符：# * _ ~ [ ] ( ) { }

多行文本测试：
第一行
第二行
第三行

包含一些代码样式的文本但不是真正的代码块：
function test() {
  console.log("hello");
}

这应该被渲染为纯文本而不是 Markdown。`,
  },
};

// Mixed content (some markdown, some plain text)
export const MixedContent: Story = {
  args: {
    content: `# 这是一个标题

这是正常的 Markdown 内容。

但是下面这些不是 Markdown：
这只是普通文本 # 不是标题
* 这不是列表项
** 这也不是粗体

回到正常的 Markdown：

## 子标题

- 这是真正的列表项
- **这是粗体文本**`,
  },
};

// Code-like plain text
export const CodeLikePlainText: Story = {
  args: {
    content: `function notRealCode() {
  // 这看起来像代码但实际上是纯文本
  const variable = "value";
  return variable;
}

class NotRealClass {
  constructor() {
    this.property = "test";
  }
}

// 这些都应该被当作纯文本处理
// 而不是代码块`,
  },
};

// 主题切换测试组件
const ThemeToggleWrapper = ({ content, options }: { content: string; options?: any }) => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  
  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <MantineProvider 
      theme={{ 
        colorScheme,
        primaryColor: 'blue'
      }}
      forceColorScheme={colorScheme}
    >
      <div style={{ 
        padding: '20px', 
        backgroundColor: colorScheme === 'dark' ? '#0d1117' : '#ffffff', 
        color: colorScheme === 'dark' ? '#f0f6fc' : '#24292f', 
        minHeight: '100vh' 
      }}>
        <div style={{ marginBottom: '20px' }}>
          <Button 
            onClick={toggleColorScheme}
            variant="outline"
          >
            切换到 {colorScheme === 'dark' ? '亮色' : '暗色'} 主题
          </Button>
        </div>
        <MarkdownRenderer content={content} options={options} />
      </div>
    </MantineProvider>
  );
};

export const ThemeToggleTest: Story = {
  render: () => (
    <ThemeToggleWrapper 
      content={`# 主题切换测试

## JavaScript 代码块
\`\`\`javascript
// 这是一个示例函数
function greetUser(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

// 调用函数
greetUser('World');
\`\`\`

## Python 代码块
\`\`\`python
def calculate_fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# 测试
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
\`\`\`

## Mermaid 流程图
\`\`\`mermaid
flowchart TD
    A[用户访问] --> B{检查主题}
    B -->|亮色主题| C[应用亮色样式]
    B -->|暗色主题| D[应用暗色样式]
    C --> E[渲染内容]
    D --> E
    E --> F[显示结果]
\`\`\`

## 内联代码和文本
这里有一些内联代码：\`const theme = useTheme();\` 和普通文本。

**粗体文本** 和 *斜体文本* 在不同主题下的显示效果。

> 这是一个引用块，用来测试在不同主题下的显示效果。
> 引用块应该在暗色主题下有合适的对比度。

## 表格测试
| 特性 | 亮色主题 | 暗色主题 |
|------|----------|----------|
| 背景色 | 白色 | 深色 |
| 文字色 | 深色 | 浅色 |
| 代码块 | 浅灰背景 | 深灰背景 |
| 边框 | 浅色边框 | 深色边框 |
`}
      options={{
        enableMermaid: true,
        enableCodeHighlight: true
      }}
    />
  )
};