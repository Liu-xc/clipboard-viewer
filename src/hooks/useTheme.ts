import { useState, useEffect } from 'react';

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark';

/**
 * 主题检测 Hook
 * 监听系统主题变化并返回当前主题
 */
export const useTheme = (): Theme => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 初始化时检测系统主题
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // 监听主题变化
    mediaQuery.addEventListener('change', handleThemeChange);

    // 清理监听器
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  return theme;
};

/**
 * 获取当前系统主题（同步方法）
 */
export const getCurrentTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};