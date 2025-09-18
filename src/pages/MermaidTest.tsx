import React from 'react';
import { Container, Paper, Title, Stack, Text } from '@mantine/core';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const testMermaidContent = `# Mermaid 图表测试

这是一个测试页面，用于验证 Mermaid 图表渲染功能。

## 流程图示例

\`\`\`mermaid
graph TD
    A[创业环保核心信息] --> B[市场交易数据：股价5.84元/涨幅0.69%/市值91.71亿]
    A --> C[用户评价：负面（垃圾公司）/正面（走势好）/极端负面（远离）]
    A --> D[公司公告：季度报告/人事变动/减值计提]
    A --> E[专业分析：2024H1现金流增长112.79%]
    B --> C[用户基于股价判断走势]
    D --> C[人事变动→用户吐槽高管不作为]
    D --> E[季度报告→第三方财务分析]
    E --> F[底部判断：估值低位/现金流支撑]
    C --> G[大牛争议：负面评价vs基本面改善]
\`\`\`

## 序列图示例

\`\`\`mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    participant C as 数据库
    
    A->>B: 请求数据
    B->>C: 查询数据库
    C-->>B: 返回结果
    B-->>A: 显示数据
\`\`\`

## 饼图示例

\`\`\`mermaid
pie title 市场份额分布
    "产品A" : 42.96
    "产品B" : 50.05
    "产品C" : 10.01
    "其他" : 5
\`\`\`
`;

export const MermaidTest: React.FC = () => {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Paper withBorder p="xl">
          <Title order={1} mb="md">Mermaid 渲染测试</Title>
          <Text c="dimmed" mb="xl">
            这个页面用于测试 Mermaid 图表的渲染功能。如果依赖安装正确，下面应该能看到渲染的图表。
          </Text>
          
          <MarkdownRenderer
            content={testMermaidContent}
            options={{
              enableSyntaxHighlight: true,
              enableMermaid: true,
              enableMath: false,
              enableTableOfContents: true,
              theme: 'auto'
            }}
          />
        </Paper>
      </Stack>
    </Container>
  );
};

export default MermaidTest;