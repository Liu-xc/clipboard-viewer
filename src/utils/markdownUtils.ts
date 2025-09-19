import { MarkdownContent, TableOfContentsItem, MermaidDiagram, CodeBlock } from '../shared/types';

/**
 * 检测文本是否为纯 Mermaid 语法
 * @param content 要检测的文本内容
 * @returns 是否为纯 Mermaid 语法
 */
export function detectMermaid(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return false;
  }

  // 如果包含 markdown 代码块标记，则不是纯 mermaid
  if (trimmed.includes('```')) {
    return false;
  }

  // Mermaid 图表类型关键词
  const mermaidKeywords = [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'pie',
    'gantt',
    'gitgraph',
    'mindmap',
    'timeline',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'journey',
    'quadrantChart',
    'requirement',
    'c4Context'
  ];

  // 检查是否以 mermaid 关键词开头
  const startsWithKeyword = mermaidKeywords.some(keyword => 
    trimmed.toLowerCase().startsWith(keyword.toLowerCase())
  );

  if (!startsWithKeyword) {
    return false;
  }

  // Mermaid 特有的语法结构
  const mermaidPatterns = [
    /-->/, // 流程图箭头
    /->>/, // 序列图箭头
    /participant/, // 序列图参与者
    /title/, // 标题
    /\[.*?\]/, // 节点标签
    /\{.*?\}/, // 节点样式
    /\|.*?\|/, // 饼图标签
    /section/, // 甘特图章节
    /dateFormat/, // 甘特图日期格式
    /axisFormat/, // 甘特图轴格式
    /class/, // 类图
    /state/, // 状态图
    /note/, // 注释
    /loop/, // 循环
    /alt/, // 选择
    /opt/, // 可选
    /par/, // 并行
    /and/, // 并且
    /else/, // 否则
    /end/ // 结束
  ];

  // 检查是否包含 mermaid 特有语法
  const hasValidSyntax = mermaidPatterns.some(pattern => pattern.test(trimmed));

  return hasValidSyntax;
}

/**
 * 检测文本是否为Markdown格式
 * @param content 要检测的文本内容
 * @returns 是否为Markdown格式
 */
export function detectMarkdown(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return false;
  }

  // Markdown特征模式
  const markdownPatterns = [
    // 标题 (# ## ### 等)
    /^#{1,6}\s+.+$/m,
    // 代码块 (```)
    /^```[\s\S]*?```$/m,
    // 行内代码 (`code`)
    /`[^`\n]+`/,
    // 链接 [text](url)
    /\[.+?\]\(.+?\)/,
    // 图片 ![alt](url)
    /!\[.*?\]\(.+?\)/,
    // 粗体 **text** 或 __text__
    /\*\*.+?\*\*|__.+?__/,
    // 斜体 *text* 或 _text_
    /\*.+?\*|_.+?_/,
    // 删除线 ~~text~~
    /~~.+?~~/,
    // 无序列表 (- * +)
    /^[\s]*[-*+]\s+.+$/m,
    // 有序列表 (1. 2. 等)
    /^[\s]*\d+\.\s+.+$/m,
    // 引用 (>)
    /^>\s*.+$/m,
    // 水平分割线 (--- *** ___)
    /^[\s]*[-*_]{3,}[\s]*$/m,
    // 表格 (| col1 | col2 |)
    /\|.+\|/,
    // HTML标签
    /<[^>]+>/,
    // Mermaid图表
    /```mermaid[\s\S]*?```/,
  ];

  // 计算匹配的模式数量
  let matchCount = 0;
  for (const pattern of markdownPatterns) {
    if (pattern.test(trimmed)) {
      matchCount++;
    }
  }

  // 如果匹配到2个或以上的模式，认为是Markdown
  if (matchCount >= 2) {
    return true;
  }

  // 特殊情况：单独的标题也认为是Markdown
  if (matchCount === 1 && /^#{1,6}\s+.+$/m.test(trimmed)) {
    return true;
  }

  // 检查是否包含大量的Markdown语法字符
  const markdownChars = (trimmed.match(/[#*_`\[\]()>|~-]/g) || []).length;
  const totalChars = trimmed.length;
  const markdownRatio = markdownChars / totalChars;

  // 如果Markdown字符占比超过5%，也认为可能是Markdown
  return markdownRatio > 0.05;
}

/**
 * 解析Markdown内容，提取元数据
 * @param content Markdown文本内容
 * @returns 解析后的Markdown内容对象
 */
export function parseMarkdownContent(content: string): MarkdownContent {
  const id = `md-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // 提取标题（第一个一级标题作为文档标题）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  // 检测代码块
  const codeBlockPattern = /```[\s\S]*?```/g;
  const hasCodeBlocks = codeBlockPattern.test(content);

  // 检测Mermaid图表
  const mermaidPattern = /```mermaid[\s\S]*?```/g;
  const hasMermaidDiagrams = mermaidPattern.test(content);

  // 检测图片
  const imagePattern = /!\[.*?\]\(.+?\)/g;
  const hasImages = imagePattern.test(content);

  // 计算字数（移除Markdown语法后）
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`\n]+`/g, '') // 移除行内代码
    .replace(/!?\[.+?\]\(.+?\)/g, '') // 移除链接和图片
    .replace(/[#*_~`\[\]()>|]/g, '') // 移除Markdown语法字符
    .replace(/\s+/g, ' ') // 合并空白字符
    .trim();
  
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  // 估算阅读时间（假设每分钟200字）
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    id,
    content,
    title,
    hasCodeBlocks,
    hasMermaidDiagrams,
    hasImages,
    wordCount,
    estimatedReadTime
  };
}

/**
 * 生成目录结构
 * @param content Markdown文本内容
 * @returns 目录项数组
 */
export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;
  const headings: TableOfContentsItem[] = [];
  let match;

  while ((match = headingPattern.exec(content)) !== null) {
    const level = match[1].length; // # 的数量
    const title = match[2].trim();
    const anchor = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    const id = `toc-${headings.length + 1}`;
    
    headings.push({
      id,
      title,
      level,
      anchor,
      children: []
    });
  }

  // 构建层级结构
  const buildHierarchy = (items: TableOfContentsItem[]): TableOfContentsItem[] => {
    const result: TableOfContentsItem[] = [];
    const stack: TableOfContentsItem[] = [];

    for (const item of items) {
      // 找到合适的父级
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // 顶级项目
        result.push(item);
      } else {
        // 添加到父级的children中
        const parent = stack[stack.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(item);
      }

      stack.push(item);
    }

    return result;
  };

  return buildHierarchy(headings);
}

/**
 * 提取Mermaid图表
 * @param content Markdown文本内容
 * @returns Mermaid图表数组
 */
export function extractMermaidDiagrams(content: string): MermaidDiagram[] {
  const mermaidPattern = /```mermaid\n([\s\S]*?)\n```/g;
  const diagrams: MermaidDiagram[] = [];
  let match;
  let index = 0;

  while ((match = mermaidPattern.exec(content)) !== null) {
    const diagramContent = match[1].trim();
    const id = `mermaid-${index++}`;
    
    // 检测图表类型
    const detectType = (content: string): MermaidDiagram['type'] => {
      const trimmed = content.trim().toLowerCase();
      
      if (trimmed.startsWith('graph') || trimmed.startsWith('flowchart')) {
        return 'flowchart';
      }
      if (trimmed.startsWith('sequencediagram') || trimmed.includes('participant')) {
        return 'sequence';
      }
      if (trimmed.startsWith('gantt')) {
        return 'gantt';
      }
      if (trimmed.startsWith('pie')) {
        return 'pie';
      }
      if (trimmed.startsWith('gitgraph')) {
        return 'gitgraph';
      }
      if (trimmed.startsWith('mindmap')) {
        return 'mindmap';
      }
      if (trimmed.startsWith('timeline')) {
        return 'timeline';
      }
      
      return 'other';
    };

    diagrams.push({
      id,
      type: detectType(diagramContent),
      content: diagramContent,
      title: `Diagram ${index}`
    });
  }

  return diagrams;
}

/**
 * 提取代码块
 * @param content Markdown文本内容
 * @returns 代码块数组
 */
export function extractCodeBlocks(content: string): CodeBlock[] {
  const codeBlockPattern = /```(\w+)?\n([\s\S]*?)\n```/g;
  const blocks: CodeBlock[] = [];
  let match;
  let index = 0;

  while ((match = codeBlockPattern.exec(content)) !== null) {
    const language = match[1] || 'text';
    const codeContent = match[2];
    const id = `code-${index++}`;
    
    // 跳过Mermaid图表（已在其他地方处理）
    if (language.toLowerCase() === 'mermaid') {
      continue;
    }

    blocks.push({
      id,
      language,
      content: codeContent,
      lineNumbers: true
    });
  }

  return blocks;
}

/**
 * 计算Markdown内容的复杂度分数
 * @param content Markdown文本内容
 * @returns 复杂度分数 (0-100)
 */
export function calculateComplexityScore(content: string): number {
  let score = 0;
  
  // 基础分数
  score += Math.min(content.length / 1000, 20); // 长度分数，最多20分
  
  // 标题数量
  const headings = (content.match(/^#{1,6}\s+.+$/gm) || []).length;
  score += Math.min(headings * 2, 15); // 每个标题2分，最多15分
  
  // 代码块数量
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
  score += Math.min(codeBlocks * 5, 20); // 每个代码块5分，最多20分
  
  // Mermaid图表数量
  const mermaidDiagrams = (content.match(/```mermaid[\s\S]*?```/g) || []).length;
  score += Math.min(mermaidDiagrams * 8, 25); // 每个图表8分，最多25分
  
  // 表格数量
  const tables = (content.match(/\|.+\|/g) || []).length;
  score += Math.min(tables * 3, 10); // 每个表格3分，最多10分
  
  // 链接和图片数量
  const links = (content.match(/!?\[.+?\]\(.+?\)/g) || []).length;
  score += Math.min(links * 1, 10); // 每个链接/图片1分，最多10分
  
  return Math.min(Math.round(score), 100);
}

/**
 * 生成Markdown内容摘要
 * @param content Markdown文本内容
 * @param maxLength 最大长度
 * @returns 内容摘要
 */
export function generateSummary(content: string, maxLength: number = 200): string {
  // 移除Markdown语法，获取纯文本
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`\n]+`/g, '') // 移除行内代码
    .replace(/!?\[.+?\]\(.+?\)/g, '') // 移除链接和图片
    .replace(/^#{1,6}\s+/gm, '') // 移除标题标记
    .replace(/[*_~`]/g, '') // 移除格式化标记
    .replace(/^>\s*/gm, '') // 移除引用标记
    .replace(/^[-*+]\s+/gm, '') // 移除列表标记
    .replace(/^\d+\.\s+/gm, '') // 移除有序列表标记
    .replace(/\s+/g, ' ') // 合并空白字符
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // 在单词边界截断
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

/**
 * 验证Markdown语法
 * @param content Markdown文本内容
 * @returns 验证结果
 */
export function validateMarkdownSyntax(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 检查代码块是否正确闭合
  const codeBlockStarts = (content.match(/^```/gm) || []).length;
  if (codeBlockStarts % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }
  
  // 检查链接格式
  const malformedLinks = content.match(/\[[^\]]*\]\([^)]*$/gm);
  if (malformedLinks) {
    errors.push(`${malformedLinks.length} malformed link(s) detected`);
  }
  
  // 检查图片格式
  const malformedImages = content.match(/!\[[^\]]*\]\([^)]*$/gm);
  if (malformedImages) {
    errors.push(`${malformedImages.length} malformed image(s) detected`);
  }
  
  // 检查表格格式
  const tableRows = content.match(/\|.+\|/g);
  if (tableRows) {
    const columnCounts = tableRows.map(row => (row.match(/\|/g) || []).length);
    const inconsistentTables = new Set(columnCounts).size > 1;
    if (inconsistentTables) {
      warnings.push('Inconsistent table column counts detected');
    }
  }
  
  // 检查标题层级
  const headings = content.match(/^(#{1,6})\s+.+$/gm);
  if (headings) {
    const levels = headings.map(h => h.match(/^#+/)?.[0].length || 0);
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        warnings.push('Heading level skipped (e.g., h1 directly to h3)');
        break;
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}