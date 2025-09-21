import React from 'react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const TestMarkdown: React.FC = () => {
  const testMarkdown = `
# 测试 Markdown 渲染器

这是一个测试页面，用于验证 MarkdownRenderer 组件中的 openExternal 功能。

## 测试链接

点击下面的链接测试 openExternal 功能：

- [Google](https://www.google.com)
- [GitHub](https://github.com)
- [百度](https://www.baidu.com)

如果 openExternal 功能正常工作，点击这些链接应该会在默认浏览器中打开，而不会在应用内导航。
  `;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Markdown 渲染器测试</h1>
      <div className="border rounded-lg p-4 bg-white">
        <MarkdownRenderer content={testMarkdown} />
      </div>
    </div>
  );
};

export default TestMarkdown;