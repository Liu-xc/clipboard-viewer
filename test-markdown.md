# JavaScript 模块系统深度解析：从 AMD 到 ESM 的演进之路

这是一个测试文档，用于验证MarkdownViewer页面的修复效果。

## 开篇：为什么需要模块系统？

想象一下，你正在建造一座房子。如果所有的材料（砖头、水泥、钢筋）都堆在一起，没有任何组织和分类，那建房子会变成一场噩梦。JavaScript 模块系统就像是建筑工地的管理系统。

### 全局污染问题

- **全局污染**：所有变量都暴露在全局作用域
- **命名冲突**：不同库可能使用相同的变量名
- **依赖管理困难**：难以明确模块间的依赖关系

## CommonJS：Node.js 的选择

CommonJS 是 Node.js 采用的模块系统，它使用同步加载的方式。

```javascript
// 导出模块
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// 导入模块
const math = require('./math');
console.log(math.add(2, 3)); // 5
```

## AMD：异步模块定义

AMD (Asynchronous Module Definition) 专为浏览器环境设计，支持异步加载。

```javascript
// 定义模块
define(['jquery', 'underscore'], function($, _) {
  return {
    doSomething: function() {
      // 使用 jQuery 和 Underscore
    }
  };
});
```

## ES6 模块：现代标准

ES6 引入了官方的模块系统，成为了现代 JavaScript 的标准。

```javascript
// 导出
export const PI = 3.14159;
export function calculateArea(radius) {
  return PI * radius * radius;
}

// 默认导出
export default class Circle {
  constructor(radius) {
    this.radius = radius;
  }
}

// 导入
import Circle, { PI, calculateArea } from './circle.js';
```

## 总结

从 CommonJS 到 AMD，再到 ES6 模块，JavaScript 模块系统的演进反映了前端开发的发展历程。每种模块系统都有其特定的使用场景和优势。