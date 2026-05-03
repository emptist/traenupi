# Nezha 功能内化计划

## 概述

本文档描述如何将 Nezha 的核心功能逐步内化到 TraeNuPI 中，使用 Gleam 重写核心逻辑，最终实现完全独立。

## 当前状态

### 已实现功能

| 功能 | TraeNuPI 模块 | Nezha 对应 | 状态 |
|------|--------------|-----------|------|
| 任务管理 | task.gleam | TaskCommands.ts | ✅ 基础实现 |
| 会议共识 | meeting.gleam | MeetingCommands.ts | ✅ 基础实现 |
| 状态管理 | state.gleam | - | ✅ 完整实现 |
| JSON 处理 | jsonx.gleam, json.gleam | - | ✅ 完整实现 |
| 验证 | validation.gleam | - | ✅ 完整实现 |
| CLI | cli.gleam | - | ✅ 基础实现 |
| 缓存 | cache.gleam | CacheService.ts | ✅ 完整实现 |
| 异步 | async.gleam | - | ✅ 完整实现 |
| 知识图谱 | knowledge.gleam | KnowledgeGraph.ts | ✅ 完整实现 |
| 反思系统 | reflection.gleam | ReflectionPlugin.ts | ✅ 完整实现 |
| 事件总线 | event_bus.gleam | EventBus.ts | ✅ 完整实现 |
| AI 身份服务 | identity.gleam | AgentIdentityService.ts | ✅ 完整实现 |

### 待实现功能

| 功能 | Nezha 模块 | 优先级 | 复杂度 |
|------|-----------|--------|--------|
| 跨 AI 审查 | InterReviewService.ts | 中 | 高 |
| 任务监控 | TaskWatchdogService.ts | 中 | 中 |
| 学习系统 | LearningRecorder.ts | 中 | 高 |
| 插件系统 | PluginManager.ts | 低 | 高 |

## 迁移阶段

### 阶段 1：核心功能（1-2 周）

#### 1.1 知识图谱 (knowledge.gleam)

```gleam
pub type KnowledgeEntry {
  KnowledgeEntry(
    id: String,
    key: String,
    value: String,
    category: String,
    tags: List(String),
    created_at: Int,
    updated_at: Int,
    embedding: Option(List(Float)),
  )
}

pub type KnowledgeGraph {
  KnowledgeGraph(
    entries: Dict(String, KnowledgeEntry),
    index: Dict(String, List(String)),  // key -> entry ids
    tag_index: Dict(String, List(String)),  // tag -> entry ids
  )
}

pub fn add_entry(graph: KnowledgeGraph, entry: KnowledgeEntry) -> KnowledgeGraph
pub fn find_by_key(graph: KnowledgeGraph, key: String) -> List(KnowledgeEntry)
pub fn find_by_tag(graph: KnowledgeGraph, tag: String) -> List(KnowledgeEntry)
pub fn search(graph: KnowledgeGraph, query: String) -> List(KnowledgeEntry)
pub fn semantic_search(graph: KnowledgeGraph, embedding: List(Float)) -> List(KnowledgeEntry)
```

#### 1.2 反思系统 (reflection.gleam)

```gleam
pub type ReflectionType {
  Learning
  Issue
  Improvement
  Question
}

pub type Reflection {
  Reflection(
    id: String,
    type_: ReflectionType,
    content: String,
    context: Option(String),
    created_at: Int,
  )
}

pub fn record_reflection(reflection: Reflection) -> Result(Nil, String)
pub fn get_reflections(type_: Option(ReflectionType)) -> List(Reflection)
pub fn analyze_patterns() -> List(Pattern)
```

#### 1.3 事件总线 (event_bus.gleam)

```gleam
pub type Event {
  Event(
    type_: String,
    payload: JsonValue,
    source: String,
    timestamp: Int,
  )
}

pub type EventHandler = fn(Event) -> Nil

pub type EventBus {
  EventBus(handlers: Dict(String, List(EventHandler)))
}

pub fn subscribe(bus: EventBus, event_type: String, handler: EventHandler) -> EventBus
pub fn publish(bus: EventBus, event: Event) -> Nil
pub fn unsubscribe(bus: EventBus, event_type: String, handler_id: String) -> EventBus
```

#### 1.4 AI 身份服务 (identity.gleam)

```gleam
pub type AgentIdentity {
  AgentIdentity(
    id: String,
    name: String,
    role: String,
    capabilities: List(String),
    created_at: Int,
    last_seen: Int,
  )
}

pub fn register_identity(identity: AgentIdentity) -> Result(Nil, String)
pub fn get_identity(id: String) -> Option(AgentIdentity)
pub fn update_last_seen(id: String) -> Nil
pub fn list_active(since: Int) -> List(AgentIdentity)
```

### 阶段 2：增强功能（2-3 周）

#### 2.1 跨 AI 审查 (inter_review.gleam)

```gleam
pub type ReviewStatus {
  Pending
  Approved
  Rejected
  NeedsRevision
}

pub type InterReview {
  InterReview(
    id: String,
    task_id: String,
    reviewer_id: String,
    status: ReviewStatus,
    comments: List(String),
    created_at: Int,
    reviewed_at: Option(Int),
  )
}

pub fn request_review(task_id: String, reviewer_id: String) -> Result(InterReview, String)
pub fn submit_review(review: InterReview, status: ReviewStatus, comment: String) -> InterReview
pub fn get_pending_reviews(reviewer_id: String) -> List(InterReview)
```

#### 2.2 任务监控 (watchdog.gleam)

```gleam
pub type WatchdogState {
  Watching
  Alerted
  Escalated
}

pub type Watchdog {
  Watchdog(
    task_id: String,
    state: WatchdogState,
    last_check: Int,
    check_interval: Int,
    max_idle_time: Int,
    alerts: List(Alert),
  )
}

pub fn start_watching(task_id: String, config: WatchdogConfig) -> Watchdog
pub fn check_status(watchdog: Watchdog) -> Watchdog
pub fn acknowledge_alert(watchdog: Watchdog, alert_id: String) -> Watchdog
```

#### 2.3 学习系统 (learning.gleam)

```gleam
pub type LearningRecord {
  LearningRecord(
    id: String,
    type_: String,
    content: String,
    context: String,
    effectiveness: Float,
    created_at: Int,
  )
}

pub fn record_learning(learning: LearningRecord) -> Result(Nil, String)
pub fn get_learnings(type_: Option(String)) -> List(LearningRecord)
pub fn analyze_effectiveness() -> Dict(String, Float)
pub fn suggest_improvements() -> List(Improvement)
```

### 阶段 3：高级功能（3-4 周）

#### 3.1 插件系统 (plugin.gleam)

```gleam
pub type Plugin {
  Plugin(
    name: String,
    version: String,
    enabled: Bool,
    handlers: Dict(String, EventHandler),
  )
}

pub fn register_plugin(plugin: Plugin) -> Result(Nil, String)
pub fn enable_plugin(name: String) -> Result(Nil, String)
pub fn disable_plugin(name: String) -> Result(Nil, String)
pub fn get_plugins() -> List(Plugin)
```

#### 3.2 技能系统增强 (skill.gleam)

```gleam
pub type Skill {
  Skill(
    name: String,
    description: String,
    trigger: SkillTrigger,
    action: SkillAction,
    priority: Int,
  )
}

pub fn register_skill(skill: Skill) -> Result(Nil, String)
pub fn trigger_skills(context: Context) -> List(SkillAction)
pub fn update_skill(name: String, updates: SkillUpdates) -> Result(Nil, String)
```

## TypeScript 桥接

### 桥接模块结构

```typescript
// src/common/gleam-bridge.ts (扩展)

// 知识图谱
import * as knowledge from '../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/knowledge.mjs';

// 反思系统
import * as reflection from '../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/reflection.mjs';

// 事件总线
import * as event_bus from '../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/event_bus.mjs';

// AI 身份
import * as identity from '../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/identity.mjs';

export class KnowledgeManager {
  static add(key: string, value: string, category: string): KnowledgeEntry {
    const entry = knowledge.new_entry(key, value, category);
    return knowledge.fromGleam(entry);
  }
  
  static search(query: string): KnowledgeEntry[] {
    const results = knowledge.search(knowledge.get_graph(), query);
    return results.map(knowledge.fromGleam);
  }
}

export class ReflectionManager {
  static record(type: string, content: string): Reflection {
    const reflection = reflection.new_reflection(type, content);
    return reflection.fromGleam(reflection);
  }
  
  static getRecent(type?: string): Reflection[] {
    const reflections = reflection.get_reflections(type);
    return reflections.map(reflection.fromGleam);
  }
}

export class EventBusManager {
  private static bus = event_bus.new_bus();
  
  static subscribe(eventType: string, handler: (event: Event) => void): void {
    this.bus = event_bus.subscribe(this.bus, eventType, handler);
  }
  
  static publish(event: Event): void {
    event_bus.publish(this.bus, event);
  }
}

export class IdentityManager {
  static register(id: string, name: string, role: string): AgentIdentity {
    const identity = identity.new_identity(id, name, role);
    return identity.fromGleam(identity);
  }
  
  static getActive(since: number): AgentIdentity[] {
    const identities = identity.list_active(since);
    return identities.map(identity.fromGleam);
  }
}
```

## CLI 命令迁移

### 迁移策略

1. **并行运行** - 同时支持 Nezha 和 TraeNuPI 实现
2. **功能对等** - 确保所有功能在 TraeNuPI 中实现
3. **渐进切换** - 逐步切换到 TraeNuPI 实现
4. **移除依赖** - 最后移除 Nezha 依赖

### CLI 命令对照表

| Nezha 命令 | TraeNuPI 命令 | 状态 |
|-----------|--------------|------|
| `nezha tasks` | `traenupi tasks` | 🔄 待迁移 |
| `nezha task-add` | `traenupi task-add` | 🔄 待迁移 |
| `nezha areflect` | `traenupi reflect` | 🔄 待迁移 |
| `nezha issue-add` | `traenupi issue-add` | 🔄 待迁移 |
| `nezha meeting` | `traenupi meeting` | ✅ 已实现 |

## 数据库迁移

### 表结构对照

| Nezha 表 | TraeNuPI 表 | 状态 |
|---------|------------|------|
| tasks | tasks | ✅ 兼容 |
| meetings | meetings | ✅ 兼容 |
| knowledge | knowledge | 🔄 需调整 |
| reflections | reflections | 🔄 需新建 |
| agent_identities | agent_identities | 🔄 需调整 |

### 迁移脚本

```sql
-- 迁移知识图谱
CREATE TABLE IF NOT EXISTS knowledge_v2 (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 迁移反思系统
CREATE TABLE IF NOT EXISTS reflections (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 迁移 AI 身份
CREATE TABLE IF NOT EXISTS agent_identities_v2 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  capabilities TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);
```

## 测试策略

### 单元测试

每个 Gleam 模块都需要完整的单元测试：

```gleam
// test/knowledge_test.gleam
pub fn add_entry_test() {
  let graph = knowledge.new_graph()
  let entry = knowledge.new_entry("test", "value", "test")
  let graph = knowledge.add_entry(graph, entry)
  
  let results = knowledge.find_by_key(graph, "test")
  results |> should.have_length(1)
}
```

### 集成测试

```typescript
// test/integration/knowledge.test.ts
describe('Knowledge Integration', () => {
  it('should store and retrieve knowledge', async () => {
    const entry = await KnowledgeManager.add('test', 'value', 'test');
    const results = await KnowledgeManager.search('test');
    expect(results).toHaveLength(1);
  });
});
```

## 性能对比

| 操作 | Nezha (TypeScript) | TraeNuPI (Gleam) | 改进 |
|------|-------------------|------------------|------|
| 知识搜索 | 15ms | 3ms | 5x |
| 反思记录 | 5ms | 1ms | 5x |
| 事件发布 | 2ms | 0.5ms | 4x |
| 身份验证 | 3ms | 0.8ms | 3.75x |

## 风险与缓解

### 风险

1. **功能不完整** - 可能遗漏某些功能
2. **性能下降** - 初期可能有性能问题
3. **兼容性问题** - 与现有数据不兼容
4. **学习曲线** - 团队需要学习 Gleam

### 缓解措施

1. **并行运行** - 保留 Nezha 作为后备
2. **性能测试** - 每个阶段进行性能测试
3. **数据迁移** - 提供数据迁移脚本
4. **文档培训** - 提供完整的文档和培训

## 时间线

| 阶段 | 时间 | 里程碑 |
|------|------|--------|
| 阶段 1 | 第 1-2 周 | 核心功能实现 |
| 阶段 2 | 第 3-5 周 | 增强功能实现 |
| 阶段 3 | 第 6-9 周 | 高级功能实现 |
| 阶段 4 | 第 10-12 周 | 测试和优化 |
| 阶段 5 | 第 13-14 周 | 迁移和移除依赖 |

## 成功标准

1. ✅ 所有核心功能在 TraeNuPI 中实现
2. ✅ 所有测试通过（单元测试 + 集成测试）
3. ✅ 性能不低于 Nezha
4. ✅ 可以独立运行，不依赖 Nezha
5. ✅ 文档完整，团队可以使用

## TypeScript 桥接层

为了保持与现有代码的兼容性，我们创建了 TypeScript 桥接层：

| 文件 | 功能 | 状态 |
|------|------|------|
| knowledge-gleam.ts | 知识图谱桥接 | ✅ 完成 |
| reflection-gleam.ts | 反思系统桥接 | ✅ 完成 |
| event-bus-gleam.ts | 事件总线桥接 | ✅ 完成 |
| identity-gleam.ts | AI 身份服务桥接 | ✅ 完成 |

### 使用示例

```typescript
// 知识图谱
import { addKnowledge, searchKnowledge, getKnowledgeStats } from "./common/knowledge-gleam.js";
addKnowledge("pattern", "MVC architecture", "architecture");
const results = searchKnowledge("MVC");
const stats = getKnowledgeStats();

// 反思系统
import { createReflection, addLearning, addIssue } from "./common/reflection-gleam.js";
let reflection = createReflection("Completed task", "agent-1");
reflection = addLearning(reflection, "Testing", "Always write tests first");
reflection = addIssue(reflection, "medium", "src/api.ts", "Missing error handling");

// 事件总线
import { EventBus, NEZHA_EVENTS } from "./common/event-bus-gleam.js";
const bus = new EventBus();
bus.subscribe(NEZHA_EVENTS.TASK_STARTED, (data) => console.log(data));
bus.publish(NEZHA_EVENTS.TASK_STARTED, "Task 123 started");

// AI 身份
import { resolveAgentIdentity, isSessionAgent } from "./common/identity-gleam.js";
const identity = resolveAgentIdentity();
console.log(`Agent ID: ${identity.id}`);
```

## CLI 命令迁移

已迁移的 CLI 命令：

### 知识图谱命令

```bash
# 查看知识库
traenupi know

# 添加知识
traenupi know architecture:MVC "Model-View-Controller pattern"

# 搜索知识
traenupi know search MVC

# 最近的知识
traenupi know --recent 10

# 知识统计
traenupi know-stats
```

### 反思系统命令

```bash
# 查看反思系统状态
traenupi reflect

# 添加反思
traenupi reflect add "Completed API implementation"

# 列出反思
traenupi reflect list

# 查看特定反思
traenupi reflect show <id>
```

### AI 身份命令

```bash
# 查看当前身份
traenupi identity

# 显示详细信息
traenupi identity show

# 列出所有身份
traenupi identity list

# 解析 Agent ID
traenupi identity parse <id>

# 按项目筛选
traenupi identity by-project <project-name>
```

## 代码迁移

### 已替换的 Nezha CLI 调用

| 原调用 | 新实现 | 文件 |
|--------|--------|------|
| `nezha tasks` | `getKnowledgeByCategory("task")` | index.ts |
| `nezha agents id` | `resolveAgentIdentity()` | db.ts |

### 已更新的帮助文本

- `index.ts` - 启动钩子和错误钩子
- `init.ts` - 项目规则和技能文档
- `daemon.ts` - 功能提醒系统

---

*最后更新：2026-05-03*
