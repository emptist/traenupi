# Gleam 实践经验总结 - TraeNuPI Agent 开发

## 1. JSON 编码与解码模式

### 问题：如何处理复杂的嵌套类型？

在实现 PI Agent 的消息系统时，遇到了复杂的嵌套类型问题。

**解决方案**：使用组合式解码器模式

```gleam
pub fn decode_agent_message() -> decode.Decoder(AgentMessage) {
  use msg_type <- decode.field("type", decode.string)
  case msg_type {
    "user" -> {
      use message <- decode.field("message", decode_llm_message())
      decode.success(User(message))
    }
    // ... 其他分支
  }
}
```

**关键点**：
- 使用 `use` 语法组合解码器
- 使用模式匹配处理不同类型
- 每个字段都有明确的解码器

### 问题：如何处理可选字段？

**错误做法**：
```gleam
use signature <- decode.optional_field("signature", decode.string)
```

**正确做法**：
```gleam
use signature <- decode.optional_field("signature", None, decode.optional(decode.string))
```

**原因**：`optional_field` 需要三个参数：字段名、默认值、解码器。对于可选字段，需要使用 `decode.optional` 包装解码器。

## 2. FFI (Foreign Function Interface) 最佳实践

### 问题：如何在 Gleam 和 JavaScript 之间传递复杂数据？

**场景**：实现 OpenRouter 客户端时，需要在 Gleam 和 Node.js fetch API 之间传递数据。

**解决方案**：使用 `@external` 注解直接返回 Promise

```gleam
@external(javascript, "./openrouter_ffi.mjs", "chat_completion")
pub fn send_chat_completion(
  config: OpenRouterConfig,
  request: ChatCompletionRequest,
) -> Promise(Result(ChatCompletionResponse, OpenRouterError))
```

**JavaScript 侧**：
```javascript
export function chat_completion(config, request) {
  return fetch(url, options)
    .then(response => response.json())
    .then(data => new Ok(transformToGleam(data)))
    .catch(error => new Error({ ApiError: error.message }));
}
```

**关键点**：
- Gleam 的 `Result` 类型映射到 JavaScript 的 `Ok` 和 `Error`
- 直接返回 `Promise` 类型，无需手动转换
- 在 JavaScript 侧处理数据转换

### 问题：如何处理流式响应？

**解决方案**：使用回调函数处理 SSE (Server-Sent Events)

```gleam
@external(javascript, "./openrouter_ffi.mjs", "chat_completion_stream")
pub fn send_chat_completion_stream(
  config: OpenRouterConfig,
  request: ChatCompletionRequest,
  on_chunk: fn(ChatCompletionChunk) -> Nil,
) -> Promise(Result(Nil, OpenRouterError))
```

**JavaScript 侧**：
```javascript
export function chat_completion_stream(config, request, onChunk) {
  return fetch(url, options)
    .then(response => {
      const reader = response.body.getReader();
      // 读取流并调用 onChunk
      onChunk(transformedChunk);
    });
}
```

## 3. 类型设计模式

### 问题：如何设计可扩展的消息类型？

**解决方案**：使用自定义类型和变体

```gleam
pub type AgentMessage {
  User(LlmMessage)
  Assistant(LlmMessage)
  ToolResult(LlmMessage)
  Notification(String, NotificationLevel)
  StatusUpdate(String, String)
  KnowledgeUpdate(String, UpdateAction)
}
```

**优点**：
- 类型安全：编译器确保处理所有变体
- 可扩展：添加新变体不影响现有代码
- 模式匹配：易于处理不同情况

### 问题：如何处理动态 JSON 数据？

**场景**：工具调用的参数可能是任意 JSON 对象。

**解决方案**：存储原始 JSON 字符串

```gleam
pub type ContentBlock {
  ToolCall(id: String, name: String, arguments: String)
}
```

**优点**：
- 避免类型复杂性
- 保持灵活性
- 需要时再解析

## 4. 测试策略

### 问题：如何测试 JSON 编解码？

**解决方案**：使用往返测试

```gleam
pub fn roundtrip_user_message_test() {
  let original = User(UserMessage(TextContent("Test"), 123))
  let encoded = json_utils.to_json_string(original)
  let decoded = json_utils.from_json_string(encoded)
  
  assert decoded == Ok(original)
}
```

**优点**：
- 验证编码和解码的一致性
- 发现序列化问题
- 确保数据完整性

## 5. 错误处理模式

### 问题：如何处理多层错误？

**解决方案**：使用自定义错误类型

```gleam
pub type OpenRouterError {
  ApiError(message: String)
  NetworkError(message: String)
  DecodeError(message: String)
}
```

**优点**：
- 明确错误来源
- 易于调试
- 类型安全

## 6. 实用技巧

### 技巧 1：使用 `use` 语法简化代码

```gleam
// 不推荐
let result = promise.await(promise1, fn(value1) {
  promise.await(promise2, fn(value2) {
    promise.resolve(value1 <> value2)
  })
})

// 推荐
use value1 <- promise.await(promise1)
use value2 <- promise.await(promise2)
promise.resolve(value1 <> value2)
```

### 技巧 2：使用模式匹配处理分支

```gleam
case msg_type {
  "user" -> decode.success(User(message))
  "assistant" -> decode.success(Assistant(message))
  _ -> decode.failure(User(default_message), "valid message type")
}
```

### 技巧 3：使用辅助函数提高可读性

```gleam
pub fn default_config(api_key: String) -> OpenRouterConfig {
  OpenRouterConfig(
    api_key: api_key,
    base_url: "https://openrouter.ai/api/v1",
    model: "hy3",
  )
}
```

## 7. 性能优化建议

1. **避免不必要的 JSON 转换**：直接在 FFI 层处理数据转换
2. **使用流式响应**：对于大数据，使用流式处理而不是一次性加载
3. **缓存解码器**：对于频繁使用的解码器，定义为常量

## 8. 常见陷阱

### 陷阱 1：忘记导入类型

```gleam
// 错误：缺少类型导入
import gleam/option

// 正确：导入类型
import gleam/option.{type Option}
```

### 陷阱 2：混淆 `field` 和 `optional_field`

```gleam
// field：字段必须存在
use name <- decode.field("name", decode.string)

// optional_field：字段可以不存在，需要提供默认值
use email <- decode.optional_field("email", "n/a", decode.string)
```

### 陷阱 3：Promise 类型导入

```gleam
// 错误：Promise 类型未导入
import gleam/javascript/promise

// 正确：导入 Promise 类型
import gleam/javascript/promise.{type Promise}
```

## 9. 项目结构建议

```
pi_agent/
├── src/
│   ├── pi_agent/
│   │   ├── types.gleam        # 核心类型定义
│   │   ├── json.gleam         # JSON 编解码
│   │   ├── openrouter.gleam   # OpenRouter 客户端
│   │   └── openrouter_ffi.mjs # FFI 实现
│   └── pi_agent.gleam         # 主模块
├── test/
│   └── pi_agent_test.gleam    # 测试
└── examples/
    └── openrouter_example.gleam # 示例
```

## 10. 下一步改进方向

1. **添加更多测试**：覆盖边界情况和错误场景
2. **实现重试机制**：处理网络错误和 API 限流
3. **添加日志系统**：记录请求和响应用于调试
4. **优化性能**：使用连接池和缓存
5. **完善文档**：添加更多示例和教程
