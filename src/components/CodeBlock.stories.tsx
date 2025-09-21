import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    language: {
      control: 'select',
      options: ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css', 'json', 'bash'],
      description: '代码语言',
    },
    content: {
      control: 'text',
      description: '代码内容',
    },
    filename: {
      control: 'text',
      description: '文件名（可选）',
    },
    showLineNumbers: {
      control: 'boolean',
      description: '是否显示行号',
    },
    className: {
      control: 'text',
      description: '自定义样式类名',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

// JavaScript 代码示例
export const JavaScript: Story = {
  args: {
    language: 'javascript',
    filename: 'example.js',
    content: `// JavaScript 示例代码
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci(10):', result);

// 使用箭头函数的版本
const fibArrow = (n) => n <= 1 ? n : fibArrow(n - 1) + fibArrow(n - 2);

// 异步函数示例
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}`,
    showLineNumbers: true,
  },
};

// TypeScript 代码示例
export const TypeScript: Story = {
  args: {
    language: 'typescript',
    filename: 'types.ts',
    content: `// TypeScript 接口和类型定义
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

type UserRole = 'admin' | 'user' | 'guest';

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  findUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUsersByRole<T extends UserRole>(role: T): User[] {
    // 实现根据角色筛选用户的逻辑
    return this.users.filter(user => user.role === role);
  }
}

// 泛型函数示例
function createResponse<T>(data: T, success: boolean = true): ApiResponse<T> {
  return {
    data,
    success,
    timestamp: new Date().toISOString()
  };
}`,
    showLineNumbers: true,
  },
};

// Python 代码示例
export const Python: Story = {
  args: {
    language: 'python',
    filename: 'data_analysis.py',
    content: `# Python 数据分析示例
import pandas as pd
import numpy as np
from typing import List, Dict, Optional

class DataAnalyzer:
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.results: Dict[str, any] = {}
    
    def calculate_statistics(self, column: str) -> Dict[str, float]:
        """计算指定列的统计信息"""
        if column not in self.data.columns:
            raise ValueError(f"Column '{column}' not found in data")
        
        stats = {
            'mean': self.data[column].mean(),
            'median': self.data[column].median(),
            'std': self.data[column].std(),
            'min': self.data[column].min(),
            'max': self.data[column].max()
        }
        
        self.results[column] = stats
        return stats
    
    def filter_data(self, conditions: Dict[str, any]) -> pd.DataFrame:
        """根据条件筛选数据"""
        filtered_data = self.data.copy()
        
        for column, value in conditions.items():
            if isinstance(value, (list, tuple)):
                filtered_data = filtered_data[filtered_data[column].isin(value)]
            else:
                filtered_data = filtered_data[filtered_data[column] == value]
        
        return filtered_data

# 使用示例
if __name__ == "__main__":
    # 创建示例数据
    data = pd.DataFrame({
        'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
        'age': [25, 30, 35, 28],
        'salary': [50000, 60000, 70000, 55000]
    })
    
    analyzer = DataAnalyzer(data)
    age_stats = analyzer.calculate_statistics('age')
    print(f"Age statistics: {age_stats}")`,
    showLineNumbers: true,
  },
};

// JSON 配置示例
export const JSON: Story = {
  args: {
    language: 'json',
    filename: 'config.json',
    content: `{
  "name": "clipboard-viewer",
  "version": "1.0.0",
  "description": "A cross-platform desktop clipboard manager",
  "main": "dist/main/main/index.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"wait-on http://localhost:3000 && npm run dev:electron\"",
    "build": "npm run build:renderer && npm run build:floating && npm run build:main",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@mantine/core": "^7.3.2",
    "@mantine/hooks": "^7.3.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@storybook/react": "^9.1.7",
    "@storybook/react-vite": "^9.1.7",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}`,
    showLineNumbers: true,
  },
};

// 短代码示例（无行号）
export const ShortCode: Story = {
  args: {
    language: 'javascript',
    content: `const greeting = 'Hello, World!';
console.log(greeting);`,
    showLineNumbers: false,
  },
};

// 长代码示例（测试折叠功能）
export const LongCode: Story = {
  args: {
    language: 'css',
    filename: 'styles.css',
    content: `/* CSS 样式示例 - 长代码测试折叠功能 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #f0f0f0;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin: 2rem 0;
}

.article {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.sidebar {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}`,
    showLineNumbers: true,
  },
};

// 无文件名示例
export const WithoutFilename: Story = {
  args: {
    language: 'bash',
    content: `#!/bin/bash

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建项目
pnpm run build

# 启动 Storybook
pnpm run storybook`,
    showLineNumbers: true,
  },
};