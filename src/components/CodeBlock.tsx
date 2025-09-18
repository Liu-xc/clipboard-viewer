import React, { useState } from 'react';
import { CodeBlock as CodeBlockType } from '../../shared/types';
import { IconCopy, IconCheck, IconDownload, IconEye, IconEyeOff } from '@tabler/icons-react';

interface CodeBlockProps {
  language: string;
  content: string;
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  content,
  filename,
  className = '',
  showLineNumbers = true
}) => {
  const [copied, setCopied] = useState(false);
  const [showNumbers, setShowNumbers] = useState(showLineNumbers);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 复制代码到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // 下载代码文件
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 根据语言获取文件扩展名
  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      yml: 'yml',
      toml: 'toml',
      ini: 'ini',
      sql: 'sql',
      bash: 'sh',
      shell: 'sh',
      powershell: 'ps1',
      dockerfile: 'dockerfile',
      markdown: 'md',
      tex: 'tex',
      r: 'r',
      matlab: 'm',
      lua: 'lua',
      perl: 'pl',
      dart: 'dart',
      elm: 'elm',
      haskell: 'hs',
      clojure: 'clj',
      erlang: 'erl',
      elixir: 'ex'
    };
    return extensions[lang.toLowerCase()] || 'txt';
  };

  // 获取语言显示名称
  const getLanguageDisplayName = (lang: string): string => {
    const names: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      swift: 'Swift',
      kotlin: 'Kotlin',
      scala: 'Scala',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      sass: 'Sass',
      less: 'Less',
      json: 'JSON',
      xml: 'XML',
      yaml: 'YAML',
      yml: 'YAML',
      toml: 'TOML',
      ini: 'INI',
      sql: 'SQL',
      bash: 'Bash',
      shell: 'Shell',
      powershell: 'PowerShell',
      dockerfile: 'Dockerfile',
      markdown: 'Markdown',
      tex: 'LaTeX',
      r: 'R',
      matlab: 'MATLAB',
      lua: 'Lua',
      perl: 'Perl',
      dart: 'Dart',
      elm: 'Elm',
      haskell: 'Haskell',
      clojure: 'Clojure',
      erlang: 'Erlang',
      elixir: 'Elixir'
    };
    return names[lang.toLowerCase()] || lang.toUpperCase();
  };

  // 分割代码行
  const lines = content.split('\n');
  const maxLineNumberWidth = String(lines.length).length;

  return (
    <div className={`code-block border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden ${className}`}>
      {/* 代码块头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getLanguageDisplayName(language)}
          </span>
          {filename && (
            <>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {filename}
              </span>
            </>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {lines.length} lines
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 切换行号显示 */}
          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title={showNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            {showNumbers ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
          
          {/* 折叠/展开 */}
          {lines.length > 20 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          
          {/* 下载按钮 */}
          <button
            onClick={handleDownload}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Download code"
          >
            <IconDownload size={16} />
          </button>
          
          {/* 复制按钮 */}
          <button
            onClick={handleCopy}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Copy code"
          >
            {copied ? <IconCheck size={16} className="text-green-500" /> : <IconCopy size={16} />}
          </button>
        </div>
      </div>
      
      {/* 代码内容 */}
      <div className="relative">
        <pre className={`overflow-x-auto p-4 text-sm leading-relaxed ${isCollapsed ? 'max-h-60' : ''} ${isCollapsed ? 'overflow-y-hidden' : ''}`}>
          <code className={`language-${language} block`}>
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showNumbers && (
                  <span 
                    className="select-none text-gray-400 dark:text-gray-600 mr-4 text-right flex-shrink-0 font-mono"
                    style={{ minWidth: `${maxLineNumberWidth * 0.6 + 0.5}rem` }}
                  >
                    {index + 1}
                  </span>
                )}
                <span className="flex-1">
                  {line || '\u00A0'} {/* 使用不间断空格保持空行 */}
                </span>
              </div>
            ))}
          </code>
        </pre>
        
        {/* 折叠状态下的渐变遮罩 */}
        {isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
        )}
      </div>
      
      {/* 代码统计信息 */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {content.length} characters • {content.split(/\s+/).length} words
          </span>
          {copied && (
            <span className="text-green-600 dark:text-green-400 flex items-center space-x-1">
              <IconCheck size={12} />
              <span>Copied!</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;