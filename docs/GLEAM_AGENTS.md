# Gleam 生态系统常用库和工具

## 导入模式：`#gleam/prelude`

基于 `@chouquette/vite` 包模式，我们可以使用 Node.js subpath imports 实现更优雅的 Gleam FFI 导入。

### 配置 package.json

```json
{
  "imports": {
    "#gleam/prelude": "./build/dev/javascript/gleam_stdlib/gleam.mjs",
    "#gleam/list": "./build/dev/javascript/gleam_stdlib/gleam/list.mjs",
    "#gleam/option": "./build/dev/javascript/gleam_stdlib/gleam/option.mjs",
    "#gleam/result": "./build/dev/javascript/gleam_stdlib/gleam/result.mjs",
    "#pi-agent/openrouter": "./build/dev/javascript/pi_agent/pi_agent/openrouter.mjs"
  }
}
```

### 在 FFI 文件中使用

**传统方式**（路径很长）：
```javascript
import { Ok, Error } from "../../gleam_stdlib/gleam.mjs";
```

**推荐方式**（使用 subpath imports）：
```javascript
import * as gleam from "#gleam/prelude";

export function divide(x, y) {
  if (y === 0) return new gleam.Error(Nil);
  return new gleam.Ok(x / y);
}
```

### 优势

1. **更简洁的导入** - 不再有长相对路径
2. **单一真实来源** - 路径在 package.json 中定义一次
3. **无额外依赖** - 这是 Node.js 内置功能，不是 Vite 特定的
4. **无需 Vite 即可工作** - 这是 Node.js 功能

### 参考

- 包：`@chouquette/vite` (https://www.npmjs.com/package/@chouquette/vite)
- GitHub：https://github.com/ghivert/gleam-forge
- 模式：使用 `package.json` `imports` 字段进行子路径解析

## 构建工具

### @chouquette/vite
- **用途**: Gleam 和 Vite 集成插件
- **安装**: `npm install -D @chouquette/vite vite`
- **功能**:
  - `gleam()` - 自动编译 Gleam 代码并集成到 Vite
  - `redraw()` - 在 Gleam FFI 中使用 JSX（React）
  - `packages()` - 处理 `package.json` 的 `imports` 字段，支持 monorepo
- **文档**: https://www.npmjs.com/package/@chouquette/vite
- **版本**: 0.4.0 (需要 Vite ^7.3.0)

### Vite
- **用途**: 下一代前端构建工具
- **安装**: `npm install -D vite`
- **特点**:
  - 极速的开发服务器启动
  - 轻量快速的热模块替换（HMR）
  - 优化的构建输出
- **文档**: https://vitejs.dev/

## 核心库

### gleam_stdlib
- **用途**: Gleam 标准库
- **包含**: List, Result, Option, Dict, Set, String, Int, Float 等核心模块
- **文档**: https://hexdocs.pm/gleam_stdlib/

### gleam_json
- **用途**: JSON 编码和解码
- **安装**: `gleam add gleam_json`
- **主要模块**:
  - `gleam/json` - JSON 编码
  - `gleam/dynamic/decode` - JSON 解码
- **文档**: https://hexdocs.pm/gleam_json/

### gleam_javascript
- **用途**: JavaScript 平台特定功能
- **安装**: `gleam add gleam_javascript`
- **主要模块**:
  - `gleam/javascript/promise` - Promise 类型
  - `gleam/javascript/array` - JavaScript Array 互操作
- **文档**: https://hexdocs.pm/gleam_javascript/

## HTTP 客户端

### gleam_http
- **用途**: HTTP 类型和函数
- **安装**: `gleam add gleam_http`
- **文档**: https://hexdocs.pm/gleam_http/

### gleam_fetch
- **用途**: 基于 Fetch API 的 HTTP 客户端
- **安装**: `gleam add gleam_fetch`
- **文档**: https://hexdocs.pm/gleam_fetch/

## 测试框架

### gleeunit
- **用途**: Gleam 单元测试框架
- **安装**: `gleam add gleeunit --dev`
- **文档**: https://hexdocs.pm/gleeunit/

## Web 框架

### wisp
- **用途**: Gleam Web 框架
- **安装**: `gleam add wisp`
- **文档**: https://hexdocs.pm/wisp/

### gleam_elli
- **用途**: Elli HTTP 服务器适配器
- **安装**: `gleam add gleam_elli`
- **文档**: https://hexdocs.pm/gleam_elli/

## 数据库

### gleam_pgo
- **用途**: PostgreSQL 客户端
- **安装**: `gleam add gleam_pgo`
- **文档**: https://hexdocs.pm/gleam_pgo/

## 其他有用的库

### gleam_otp
- **用途**: OTP 行为（Actor, Supervisor, GenServer 等）
- **安装**: `gleam add gleam_otp`
- **文档**: https://hexdocs.pm/gleam_otp/

### gleam_erlang
- **用途**: Erlang 平台特定功能
- **安装**: `gleam add gleam_erlang`
- **文档**: https://hexdocs.pm/gleam_erlang/

### gleam_community_ansi
- **用途**: ANSI 颜色和样式
- **安装**: `gleam add gleam_community_ansi`
- **文档**: https://hexdocs.pm/gleam_community_ansi/

## FFI (Foreign Function Interface)

### JavaScript FFI
- **文件扩展名**: `.mjs` 或 `.js`
- **导入 Gleam 类型**: `import { Ok, Error, toList } from "../../gleam_stdlib/gleam.mjs"`
- **导入自定义类型**: `import { Model, ModelPricing } from "./module.mjs"`
- **注意**: 
  - Gleam List 在 JavaScript 中是 Array
  - 使用 `toList()` 将 JavaScript Array 转换为 Gleam List
  - 使用 `Array.from()` 将 Gleam List 转换为 JavaScript Array

### Erlang FFI
- **文件扩展名**: `.erl`
- **文档**: https://gleam.run/documentation/gleam/erlang/

## 开发工具

### Gleam Language Server
- **用途**: IDE 支持（VSCode, Vim, Emacs 等）
- **安装**: `gleam install gleam_ls`
- **文档**: https://github.com/gleam-lang/gleam-lsp

### Gleam Format
- **用途**: 代码格式化
- **命令**: `gleam format`
- **配置**: `.gleam.toml`

## 包管理

### Hex
- **用途**: Gleam 包仓库
- **网站**: https://hex.pm/
- **搜索**: https://hex.pm/packages?search=gleam

### Gleam 包
- **安装**: `gleam add package_name`
- **开发依赖**: `gleam add package_name --dev`
- **更新**: `gleam update`

## 项目结构

### 标准项目结构
```
project/
├── src/              # 源代码
│   └── module.gleam
├── test/             # 测试代码
│   └── module_test.gleam
├── build/            # 编译输出
│   └── dev/
│       └── javascript/
├── gleam.toml        # 项目配置
├── manifest.toml     # 依赖锁定
└── README.md
```

### gleam.toml 配置
```toml
name = "project_name"
version = "0.1.0"
target = "javascript"  # 或 "erlang"

[dependencies]
gleam_stdlib = ">= 0.34.0 and < 2.0.0"
gleam_json = ">= 1.0.0 and < 2.0.0"

[dev-dependencies]
gleeunit = ">= 1.0.0 and < 2.0.0"
```

## 常见问题

### Q: 如何在 JavaScript 中使用 Gleam List？
A: Gleam List 在 JavaScript 中是 Array，可以直接使用 Array 方法。

### Q: 如何将 JavaScript Array 转换为 Gleam List？
A: 使用 `toList()` 函数：`import { toList } from "../../gleam_stdlib/gleam.mjs"`

### Q: 如何在 Gleam 中使用 JavaScript Promise？
A: 使用 `gleam/javascript/promise` 模块。

### Q: 如何处理 JSON？
A: 使用 `gleam_json` 库的 `json` 模块编码，`gleam/dynamic/decode` 模块解码。

### Q: 如何进行 HTTP 请求？
A: 对于 JavaScript 目标，使用 FFI 调用 `fetch` API；对于 Erlang 目标，使用 `gleam_http` 和 `gleam_fetch`。

## 更新日期

- 2026-05-04: 初始版本，记录 @chouquette/vite 和常用库
- 2026-05-04: 添加实践经验：OpenRouter 客户端、Vite 集成、subpath imports

## 实践经验

### OpenRouter 客户端实现

**项目**: PI Agent  
**日期**: 2026-05-04

#### 关键发现

1. **免费模型 ID 格式**
   - 格式: `provider/model-name:free`
   - 示例: `tencent/hy3-preview:free`
   - 注意: 不带 `:free` 后缀的模型可能会报错

2. **SSE 流式响应处理**
   ```javascript
   // 需要处理不完整的行
   let buffer = '';
   
   buffer += decoder.decode(value, { stream: true });
   const lines = buffer.split('\n');
   
   // Keep the last incomplete line in the buffer
   buffer = lines.pop() || '';
   ```

3. **Gleam List 和 JavaScript Array 转换**
   ```javascript
   // JavaScript Array -> Gleam List
   import { toList } from "#gleam/prelude";
   const gleamList = toList([1, 2, 3]);
   
   // Gleam List -> JavaScript Array
   const jsArray = Array.from(gleamList);
   ```

#### 完整示例

```javascript
// openrouter_ffi.mjs
import * as gleam from "#gleam/prelude";

export function chat_completion(config, request) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
    }),
  })
    .then(response => response.json())
    .then(data => new gleam.Ok(data))
    .catch(error => new gleam.Error(error.message));
}
```

### Vite 集成实践

**项目**: PI Agent  
**日期**: 2026-05-04

#### 关键发现

1. **版本要求**
   - `@chouquette/vite` 0.4.0 需要 Vite ^7.3.0
   - 使用 `npm install -D @chouquette/vite vite@^7.3.0`

2. **浏览器环境限制**
   - 浏览器不支持 `prompt()`
   - 需要使用 DOM API 获取用户输入
   - 使用 `localStorage` 存储 API key

3. **Vite 自动编译**
   - Vite 会自动调用 `gleam build --target javascript`
   - 不需要手动编译

#### 配置示例

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import gleam from '@chouquette/vite/gleam';

export default defineConfig({
  plugins: [gleam()],
  server: {
    port: 3000,
  },
});
```

```json
// package.json
{
  "type": "module",
  "imports": {
    "#gleam/prelude": "./build/dev/javascript/gleam_stdlib/gleam.mjs"
  },
  "scripts": {
    "dev": "vite",
    "build": "gleam build --target javascript && vite build"
  },
  "devDependencies": {
    "@chouquette/vite": "^0.4.0",
    "vite": "^7.3.0"
  }
}
```

### Subpath Imports 最佳实践

**项目**: PI Agent  
**日期**: 2026-05-04

#### 为什么使用 Subpath Imports

1. **更简洁的导入**
   - 传统: `import { Ok } from "../../gleam_stdlib/gleam.mjs"`
   - 改进: `import * as gleam from "#gleam/prelude"`

2. **单一真实来源**
   - 路径在 `package.json` 中定义一次
   - 易于维护和重构

3. **无额外依赖**
   - Node.js 内置功能
   - 不需要 Vite 或其他工具

#### 推荐的导入别名

```json
{
  "imports": {
    "#gleam/prelude": "./build/dev/javascript/gleam_stdlib/gleam.mjs",
    "#gleam/list": "./build/dev/javascript/gleam_stdlib/gleam/list.mjs",
    "#gleam/option": "./build/dev/javascript/gleam_stdlib/gleam/option.mjs",
    "#gleam/result": "./build/dev/javascript/gleam_stdlib/gleam/result.mjs",
    "#gleam/promise": "./build/dev/javascript/gleam_javascript/gleam/javascript/promise.mjs"
  }
}
```

#### 使用建议

1. **使用命名空间导入**
   ```javascript
   import * as gleam from "#gleam/prelude";
   
   // 使用
   new gleam.Ok(value);
   new gleam.Error(error);
   ```

2. **按需导入特定模块**
   ```javascript
   import * as list from "#gleam/list";
   import * as option from "#gleam/option";
   ```

3. **导入自定义模块**
   ```javascript
   import { MyType, my_function } from "#myapp/mymodule";
   ```

### 常见陷阱

1. **忘记使用 `new` 关键字**
   ```javascript
   // 错误
   return Ok(value);
   
   // 正确
   return new gleam.Ok(value);
   ```

2. **混淆 Gleam List 和 JavaScript Array**
   ```javascript
   // 错误：直接返回 JavaScript Array
   return new gleam.Ok([1, 2, 3]);
   
   // 正确：转换为 Gleam List
   return new gleam.Ok(gleam.toList([1, 2, 3]));
   ```

3. **忘记处理 Promise**
   ```gleam
   // 错误：忘记返回 Promise
   pub fn send_request() -> Result(Response, Error)
   
   // 正确：返回 Promise
   pub fn send_request() -> Promise(Result(Response, Error))
   ```

4. **模型 ID 格式错误**
   ```javascript
   // 错误
   model: "hy3"
   model: "tencent/hy3-preview"
   
   // 正确
   model: "tencent/hy3-preview:free"
   ```
