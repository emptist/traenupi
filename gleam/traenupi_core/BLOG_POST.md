# 从 TypeScript 到 Gleam：一次令人兴奋的迁移之旅

> 在 AI 辅助编程的时代，代码的清晰度和类型安全性变得尤为重要。这篇文章记录了我在 TypeScript 项目中集成 Gleam 的完整过程，以及其中的发现、挑战和收获。

---

## 目录

1. [项目背景与动机](#项目背景与动机)
2. [技术架构](#技术架构)
3. [完整集成过程](#完整集成过程)
4. [核心技术要点](#核心技术要点)
5. [踩坑记录与解决方案](#踩坑记录与解决方案)
6. [最佳实践](#最佳实践)
7. [心得体会](#心得体会)
8. [未来计划](#未来计划)

---

## 项目背景与动机

### 为什么选择 Gleam？

在 AI 辅助编程的时代，代码的清晰度和类型安全性变得尤为重要。TypeScript 虽然提供了类型系统，但在复杂场景下仍然容易出现以下问题：

1. **类型推断不够严格**：TypeScript 的类型推断有时会产生意外结果
2. **运行时错误**：编译通过但运行时崩溃的情况时有发生
3. **模式匹配冗长**：处理复杂条件逻辑时代码冗长
4. **不可变性需要额外工具**：需要 immutable.js 或 immer 等库

Gleam 的优势：

- **ML 风格类型系统**：严格的类型推断，编译通过即运行正确
- **模式匹配**：优雅的模式匹配语法，穷尽性检查
- **默认不可变**：所有数据结构默认不可变
- **编译到 JavaScript**：无缝集成现有 TypeScript 项目
- **生成 TypeScript 声明**：自动生成 `.d.ts` 文件

### 项目目标

将 TraeNuPI 项目的核心功能逐步迁移到 Gleam，实现：

1. 类型安全的 JSON 处理
2. 状态管理
3. 验证框架
4. 日志系统
5. HTTP 客户端
6. 异步操作

---

## 技术架构

### 项目结构

```
traenupi/
├── gleam/
│   └── traenupi_core/
│       ├── src/
│       │   └── traenupi_core/
│       │       ├── jsonx.gleam      # JSON 编解码
│       │       ├── state.gleam      # 状态管理
│       │       ├── validation.gleam # 验证框架
│       │       ├── logger.gleam     # 日志系统
│       │       ├── http.gleam       # HTTP 客户端
│       │       ├── async.gleam      # 异步工具
│       │       ├── datetime.gleam   # 日期时间
│       │       ├── fs.gleam         # 文件系统
│       │       ├── str.gleam        # 字符串工具
│       │       ├── resultx.gleam    # Result/Option 工具
│       │       ├── collection.gleam # 集合类型
│       │       └── cache.gleam      # 缓存实现
│       ├── test/
│       │   └── traenupi_core_test.gleam
│       ├── gleam.toml
│       └── README.md
├── src/
│   └── common/
│       └── gleam-bridge.ts          # TypeScript 桥接层
└── package.json
```

### 编译目标配置

```toml
# gleam.toml
name = "traenupi_core"
version = "1.0.0"
target = "javascript"
javascript = { typescript_declaration = true }
```

---

## 完整集成过程

### 第一步：初始化 Gleam 项目

```bash
# 创建 Gleam 项目
cd traenupi
mkdir -p gleam
cd gleam
gleam new traenupi_core

# 配置 TypeScript 声明生成
# 编辑 gleam.toml，添加：
# javascript = { typescript_declaration = true }
```

### 第二步：编写第一个模块

从最简单的 JSON 模块开始：

```gleam
// src/traenupi_core/jsonx.gleam

import gleam/dict.{type Dict}
import gleam/list
import gleam/float
import gleam/int
import gleam/string as str

pub type JsonValue {
  JsonNull
  JsonBool(Bool)
  JsonNumber(Float)
  JsonString(String)
  JsonArray(List(JsonValue))
  JsonObject(Dict(String, JsonValue))
}

pub fn encode(value: JsonValue) -> String {
  case value {
    JsonNull -> "null"
    JsonBool(b) -> case b { True -> "true", False -> "false" }
    JsonNumber(n) -> float.to_string(n)
    JsonString(s) -> "\"" <> escape_string(s) <> "\""
    JsonArray(arr) -> "[" <> str.join(list.map(arr, encode), ",") <> "]"
    JsonObject(obj) -> {
      let pairs = dict.to_list(obj)
        |> list.map(fn(pair) {
          let #(key, val) = pair
          "\"" <> key <> "\":" <> encode(val)
        })
      "{" <> str.join(pairs, ",") <> "}"
    }
  }
}
```

### 第三步：创建 TypeScript 桥接层

```typescript
// src/common/gleam-bridge.ts

import {
  JsonValue$JsonNull,
  JsonValue$JsonBool,
  JsonValue$JsonNumber,
  JsonValue$JsonString,
  JsonValue$JsonArray,
  JsonValue$JsonObject,
  type JsonValue$,
  encode as jsonEncode,
  decode as jsonDecode,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/jsonx.mjs";

import { toList, Ok, Error as GleamError } from "../../gleam/traenupi_core/build/dev/javascript/gleam_stdlib/gleam.mjs";

export function parseJson(json: string): JsonValue$ | null {
  const result = jsonDecode(json);
  if (result.isOk()) {
    return (result as Ok<JsonValue$, JsonError$>)[0];
  }
  return null;
}
```

### 第四步：编写测试

```gleam
// test/traenupi_core_test.gleam

import gleeunit
import gleeunit/should
import traenupi_core/jsonx.{decode, encode, JsonNull, JsonBool, JsonNumber, JsonString}

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn jsonx_decode_number_test() {
  should.equal(decode("42"), Ok(JsonNumber(42.0)))
  should.equal(decode("3.14"), Ok(JsonNumber(3.14)))
  should.equal(decode("-10"), Ok(JsonNumber(-10.0)))
}
```

---

## 核心技术要点

### 1. 模式匹配与穷尽性检查

Gleam 的模式匹配是其最强大的特性之一：

```gleam
pub fn json_value_type(value: JsonValue) -> String {
  case value {
    JsonNull -> "Null"
    JsonBool(_) -> "Bool"
    JsonNumber(_) -> "Number"
    JsonString(_) -> "String"
    JsonArray(_) -> "Array"
    JsonObject(_) -> "Object"
  }
}
```

**爽点**：编译器会检查所有分支是否覆盖，永远不会遗漏情况！

### 2. Result 类型与错误处理

Gleam 使用 `Result` 类型处理错误，强制显式处理：

```gleam
pub fn parse_number(json: String) -> Result(DecodeResult, JsonError) {
  let #(num_str, remaining) = extract_number(json)
  case int.parse(num_str) {
    Ok(n) -> Ok(DecodeResult(JsonNumber(int.to_float(n)), remaining))
    Error(_) -> {
      case float.parse(num_str) {
        Ok(n) -> Ok(DecodeResult(JsonNumber(n), remaining))
        Error(_) -> Error(InvalidJson(message: "Invalid number: " <> num_str))
      }
    }
  }
}
```

**亮点**：错误处理是强制的，不会忘记处理错误情况。

### 3. 不可变数据结构

所有数据默认不可变，更新使用记录语法：

```gleam
pub fn increment_questions(stats: ActivityStats) -> ActivityStats {
  ActivityStats(..stats, questions_today: stats.questions_today + 1)
}
```

**兴奋点**：再也不用担心意外修改数据！

### 4. FFI (Foreign Function Interface)

与 JavaScript 交互非常简单：

```gleam
// http.gleam
@external(javascript, "../http_ffi.mjs", "fetch")
fn fetch_impl(url: String, options: FetchOptions) -> Promise(Response)
```

```javascript
// http_ffi.mjs
export async function fetch(url, options) {
  const response = await globalThis.fetch(url, {
    method: options.method,
    headers: Object.fromEntries(options.headers),
    body: options.body,
  });
  return {
    status: response.status,
    headers: Array.from(response.headers.entries()),
    body: await response.text(),
  };
}
```

### 5. 类型推断

Gleam 的类型推断非常强大：

```gleam
// 不需要显式类型注解
let add = fn(a, b) { a + b }  // 自动推断为 fn(Int, Int) -> Int

// 但推荐为公共函数添加类型注解
pub fn add(a: Int, b: Int) -> Int {
  a + b
}
```

---

## 踩坑记录与解决方案

### 坑 1：float.parse 不支持整数

**问题**：
```gleam
float.parse("42")  // Error(Nil)
float.parse("42.0") // Ok(42.0)
```

**解决**：先尝试 int.parse，再尝试 float.parse：
```gleam
case int.parse(num_str) {
  Ok(n) -> Ok(int.to_float(n))
  Error(_) -> float.parse(num_str)
}
```

### 坑 2：字符串切片长度错误

**问题**：解析 "true" 时，`str.slice(json, 0, 4)` 在有尾随空格时会失败

**原因**：`pop_grapheme` 已经取走了 "t"，剩余的是 "rue"（3个字符）

**解决**：
```gleam
// 错误
case str.slice(json, 0, 4) {  // 期望 "rue" 但取了 4 个字符
  "rue" -> ...
}

// 正确
case str.slice(json, 0, 3) {  // 只取 3 个字符
  "rue" -> ...
}
```

### 坑 3：ANSI 转义序列语法

**问题**：`\x1b[36m` 导致编译错误

**解决**：使用双反斜杠 `\\x1b[36m`

### 坑 4：FFI 路径问题

**问题**：`import "../../http_ffi.mjs"` 找不到模块

**解决**：FFI 文件应放在 `src/` 目录，导入路径为 `"../http_ffi.mjs"`

### 坑 5：Result 类型在 TypeScript 中的处理

**问题**：`result.type === "Ok"` 不存在

**解决**：使用 `result.isOk()` 方法：
```typescript
if (result.isOk()) {
  const value = (result as Ok<JsonValue$, JsonError$>)[0];
}
```

### 坑 6：函数名称冲突

**问题**：`drop_left` 函数不存在

**解决**：Gleam 使用 `drop_start` 和 `drop_end`，不是 `drop_left` 和 `drop_right`

---

## 最佳实践

### 1. 模块组织

```
src/traenupi_core/
├── jsonx.gleam      # 核心功能
├── json/            # 子模块（如果需要）
│   ├── decoder.gleam
│   └── encoder.gleam
└── utils.gleam      # 工具函数
```

### 2. 类型优先设计

先定义类型，再实现功能：

```gleam
pub type JsonValue {
  JsonNull
  JsonBool(Bool)
  JsonNumber(Float)
  JsonString(String)
  JsonArray(List(JsonValue))
  JsonObject(Dict(String, JsonValue))
}

// 类型定义好后，编译器会引导你完成实现
pub fn encode(value: JsonValue) -> String {
  case value {
    // 编译器会提示你处理所有分支
  }
}
```

### 3. 测试驱动开发

```gleam
// 先写测试
pub fn jsonx_decode_test() {
  should.equal(decode("null"), Ok(JsonNull))
}

// 再实现功能，编译器会告诉你缺少什么
```

### 4. 错误类型设计

```gleam
pub type JsonError {
  UnexpectedType(expected: String, found: String)
  MissingField(field: String)
  InvalidJson(message: String)
  IndexOutOfBounds(index: Int, length: Int)
}
```

使用带标签的字段，错误信息更清晰。

### 5. 渐进式迁移

不要一次性迁移所有代码：

1. 先迁移独立的工具模块
2. 再迁移核心业务逻辑
3. 最后迁移复杂的状态管理

---

## 心得体会

### 爽点

1. **编译器是最好的老师**
   - 编译器会告诉你缺少什么
   - 类型错误信息清晰明确
   - 穷尽性检查避免遗漏

2. **模式匹配太优雅了**
   ```gleam
   case value {
     JsonNull -> "null"
     JsonBool(True) -> "true"
     JsonBool(False) -> "false"
     _ -> "other"
   }
   ```

3. **重构非常安全**
   - 修改类型定义后，编译器会告诉你所有需要修改的地方
   - 不用担心遗漏

4. **代码即文档**
   - 类型签名清晰表达意图
   - 模式匹配展示所有可能情况

5. **测试体验极佳**
   - 277 个测试，全部通过
   - 每次修改后立即知道是否破坏了什么

### 痛点

1. **学习曲线**
   - ML 风格语法需要适应
   - 一些函数名称与直觉不同（如 `drop_start` vs `drop_left`）

2. **生态系统**
   - 库不如 JavaScript 丰富
   - 有时需要自己实现功能

3. **调试工具**
   - 没有 TypeScript 那样成熟的调试器集成
   - 但模式匹配让 bug 更容易发现

### 亮点

1. **类型安全带来的信心**
   - 编译通过 = 运行正确（大部分情况）
   - 重构时非常有信心

2. **与 TypeScript 的无缝集成**
   - 自动生成 `.d.ts` 文件
   - 可以渐进式迁移

3. **AI 友好的语法**
   - 清晰的语法减少 AI 犯错
   - 模式匹配让逻辑更清晰

### 关键点

1. **类型定义是核心**
   - 花时间设计好类型
   - 好的类型定义让实现自然浮现

2. **Result 类型处理错误**
   - 不要害怕 `Result` 类型
   - 它是你的朋友，不是负担

3. **测试驱动**
   - Gleam 的测试非常快
   - 写测试是开发的一部分

### 兴奋点

1. **发现 bug 的过程**
   - 编译器在编译时就发现了潜在问题
   - 比运行时发现 bug 早得多

2. **代码变得简洁**
   - 同样的功能，Gleam 代码更短
   - 更重要的是，更清晰

3. **类型推断的魔法**
   - 很多时候不需要写类型注解
   - 但编译器仍然知道一切

---

## 未来计划

### 短期目标（1-2 周）

1. **完善 JSON 模块**
   - [ ] JSON Path 查询 (`$.store.books[*].author`)
   - [ ] JSON Schema 验证
   - [ ] JSON Patch (RFC 6902)
   - [ ] JSON Merge Patch (RFC 7396)

2. **增强 HTTP 模块**
   - [ ] 请求/响应拦截器
   - [ ] 重试机制
   - [ ] 超时处理
   - [ ] 请求取消

3. **扩展验证模块**
   - [ ] 正则表达式验证
   - [ ] 自定义验证器组合
   - [ ] 异步验证支持

### 中期目标（1-2 月）

1. **CLI 工具**
   - [ ] 使用 Gleam 重写 CLI 入口
   - [ ] 彩色输出
   - [ ] 进度条显示

2. **配置管理**
   - [ ] TOML 解析
   - [ ] YAML 解析
   - [ ] 环境变量处理

3. **数据库集成**
   - [ ] SQLite FFI
   - [ ] 查询构建器
   - [ ] 迁移工具

### 长期目标（3-6 月）

1. **WebAssembly 目标**
   - [ ] 编译到 WASM
   - [ ] 浏览器端使用

2. **Erlang 目标**
   - [ ] 支持编译到 Erlang
   - [ ] OTP 集成

3. **更多工具模块**
   - [ ] Base64 编解码
   - [ ] URL 解析
   - [ ] UUID 生成
   - [ ] 加密哈希

---

## 总结

在 TypeScript 项目中使用 Gleam 是一次非常积极的体验。Gleam 的类型系统和模式匹配让代码更清晰、更安全，大大减少了 AI 辅助编程时的错误率。虽然生态系统还在发展中，但核心功能已经非常成熟。

**推荐指数：⭐⭐⭐⭐⭐**

如果你正在寻找一种方式来提高代码质量，减少运行时错误，并且愿意学习新语法，Gleam 绝对值得一试！

---

## 参考资源

- [Gleam 官方文档](https://gleam.run/)
- [Gleam 标准库](https://hexdocs.pm/gleam_stdlib/)
- [Awesome Gleam](https://github.com/gleam-lang/awesome-gleam)
- [Gleam Discord 社区](https://discord.gg/gleam)

---

*最后更新：2026-05-03*
*作者：TraeNuPI AI Assistant*
