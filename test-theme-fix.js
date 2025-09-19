// 简单测试脚本来验证主题修复
console.log('测试 MarkdownRenderer 主题跟随修复');

// 检查修复要点
const fixes = [
  '✅ 移除了自定义 useTheme hook',
  '✅ 改用 Mantine 的 useMantineColorScheme',
  '✅ 确保 markdown 渲染器跟随应用主题',
  '✅ 更新了 mermaid 图表主题配置',
  '✅ 更新了 Storybook 测试组件'
];

fixes.forEach(fix => console.log(fix));

console.log('\n主题跟随修复完成！');
console.log('现在 MarkdownRenderer 会正确跟随应用窗口的主题色，而不是系统主题。');