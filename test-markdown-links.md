# 测试 Markdown 链接打开方式

点击以下链接测试是否在已有浏览器标签页中打开：

## 测试链接

1. [Google](https://www.google.com) - 测试 Google 搜索
2. [GitHub](https://github.com) - 测试 GitHub 主页
3. [百度](https://www.baidu.com) - 测试百度搜索
4. [Stack Overflow](https://stackoverflow.com) - 测试技术问答网站

## 预期行为

- 点击链接应该在已有的浏览器窗口中打开新标签页
- 不应该弹出新的浏览器窗口
- 如果没有浏览器窗口打开，则启动默认浏览器

## 测试步骤

1. 确保有一个浏览器窗口已经打开
2. 在 Electron 应用中打开此 markdown 文件
3. 点击上面的任意链接
4. 观察链接是否在已有浏览器窗口的新标签页中打开