import React from 'react';
import { MarkdownViewer } from './MarkdownViewer';
import { Container, Title, Stack, Paper, Text } from '@mantine/core';

// 测试用的代码内容
const testCodeSamples = {
  javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
  
  python: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3,6,8,10,1,2,1]))`,
  
  typescript: `interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}`,
  
  css: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 400px;
}`,
  
  json: `{
  "name": "clipboard-viewer",
  "version": "1.0.0",
  "description": "A modern clipboard manager",
  "main": "dist/main.js",
  "scripts": {
    "dev": "electron .",
    "build": "npm run build:renderer && npm run build:main",
    "test": "jest"
  },
  "dependencies": {
    "electron": "^22.0.0",
    "react": "^18.2.0"
  }
}`
};

export const CodeRenderTest: React.FC = () => {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl" ta="center">
        代码内容渲染测试
      </Title>
      
      <Stack gap="xl">
        {Object.entries(testCodeSamples).map(([language, code]) => (
          <Paper key={language} withBorder p="md">
            <Title order={3} mb="md" tt="capitalize">
              {language} 代码测试
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              测试 {language} 代码的自动检测和语法高亮渲染
            </Text>
            <MarkdownViewer 
              content={code} 
              title={`${language} Code Sample`}
            />
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};

export default CodeRenderTest;