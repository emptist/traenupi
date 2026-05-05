# 最终准确数据库结构对比报告

## 方法论

使用PostgreSQL系统目录（pg_catalog.pg_attribute）+ Unix标准工具（comm）进行精确对比。

## 列存在性差异（已验证）

### 1. tasks 表
- **Nezha列数**: 56
- **Psypi列数**: 59
- **共同列**: 55

**Nezha独有列（Psypi没有，迁移时会丢失）：**
1. `source` - 任务来源

**Psypi独有列（Nezha没有，迁移时会获得）：**
1. `delegate_to` - 委托目标
2. `delegated_from` - 委托来源
3. `metadata` - 元数据
4. `template_id` - 任务模板ID

**迁移影响**: 
- ⚠️ 会丢失1列数据（source）
- ✅ 会获得4列新数据
- **风险等级**: 低

---

### 2. issues 表
- **Nezha列数**: 30
- **Psypi列数**: 24
- **共同列**: 24

**Nezha独有列（Psypi没有，迁移时会丢失）：**
1. `discovered_by` - 发现者
2. `environment` - 运行环境
3. `git_branch` - Git分支
4. `git_hash` - Git哈希
5. `reported_by` - 报告者
6. `source` - 问题来源

**Psypi独有列**: 无

**迁移影响**: 
- ⚠️ 会丢失6列数据（Git上下文和发现信息）
- **风险等级**: 中等

---

### 3. meetings 表
- **Nezha列数**: 8
- **Psypi列数**: 11
- **共同列**: 8

**Nezha独有列**: 无

**Psypi独有列（Nezha没有，迁移时会获得）：**
1. `project_id` - 项目ID
2. `summary` - 会议摘要
3. `updated_at` - 更新时间

**迁移影响**: 
- ✅ 完全兼容（Psypi有额外列，都有默认值或允许NULL）
- **风险等级**: 无

---

## 其他表（完全兼容）

以下表没有列存在性差异：
- ✅ memory
- ✅ meeting_opinions
- ✅ agent_moods
- ✅ skills
- ✅ inter_reviews
- ✅ reflections
- ✅ table_documentation

---

## 约束和触发器差异（之前已发现）

### tasks 表
```diff
- tasks_status_check: 'PAUSED'状态 (Nezha)
+ tasks_status_check: 'FAKE_COMPLETE'状态 (Psypi)
```

### meetings 表
```diff
- meetings_status_check: 包含'archived'状态 (Nezha)
+ meetings_status_check: 不包含'archived'状态 (Psypi)
```

### agent_sessions 表
```diff
- id: varchar(50) (Nezha)
+ id: uuid (Psypi)
```
**这是最严重的问题：主键类型不兼容**

### meeting_opinions 表
```diff
- meeting_opinion_notify触发器 (Nezha有)
+ 无此触发器 (Psypi没有)
```

---

## 我之前报告的错误纠正

### 错误1: tasks表列丢失数量
- ❌ **之前说**: 会丢失7列数据（加密、进度相关）
- ✅ **实际情况**: 只丢失1列数据（source）
- **原因**: 我没有准确对比列名，只是猜测

### 错误2: issues表列丢失数量
- ✅ **之前说**: 会丢失6列数据（Git上下文、发现信息）
- ✅ **实际情况**: 确实丢失6列数据
- **验证**: 已通过系统目录验证

### 错误3: meetings表
- ✅ **之前说**: Psypi有额外列，但兼容
- ✅ **实际情况**: 确实如此
- **验证**: 已通过系统目录验证

---

## 迁移风险评估（更新）

### 高风险（必须解决）
1. ❌ **agent_sessions主键类型不同** - varchar(50) vs uuid

### 中风险（需要处理）
1. ⚠️ **issues表丢失6列** - Git上下文和发现信息
2. ⚠️ **tasks状态值差异** - 'PAUSED' vs 'FAKE_COMPLETE'
3. ⚠️ **meetings状态值差异** - 'archived'状态
4. ⚠️ **meeting_opinions触发器缺失** - 可能影响通知功能

### 低风险（可接受）
1. ✅ **tasks表丢失1列** - source列
2. ✅ **meetings表获得3列** - project_id, summary, updated_at

---

## 代码影响分析

### 问题1: 如果对缺失的列进行补充，对psypi的代码有什么影响？

#### Psypi使用Gleam进行数据库操作

根据代码检查，psypi项目使用Gleam语言进行所有数据库操作：
- Task类型定义：`/Users/jk/gits/hub/tools_ai/psypi/gleam/psypi_core/src/psypi_cli/task.gleam`
- Issue类型定义：`/Users/jk/gits/hub/tools_ai/psypi/gleam/psypi_core/src/psypi_cli/issue.gleam`
- Meeting类型定义：`/Users/jk/gits/hub/tools_ai/psypi/gleam/psypi_core/src/psypi_cli/meeting.gleam`

#### 如果在psypi数据库中添加缺失列，需要修改：

**1. tasks表添加`source`列：**

Gleam代码修改：
```gleam
// 当前定义（psypi_cli/task.gleam）
pub type Task {
  Task(
    id: String,
    title: String,
    description: Option(String),
    status: TaskStatus,
    priority: Int,
    result: Option(String),
    error: Option(String),
    retry_count: Int,
    created_at: String,
    updated_at: String,
    completed_at: Option(String),
    created_by: String,
  )
}

// 需要修改为：
pub type Task {
  Task(
    id: String,
    title: String,
    description: Option(String),
    status: TaskStatus,
    priority: Int,
    result: Option(String),
    error: Option(String),
    retry_count: Int,
    created_at: String,
    updated_at: String,
    completed_at: Option(String),
    created_by: String,
    source: Option(String),  // 新增
  )
}

// 同时需要修改task_decoder()
use source <- decode.field("source", decode.optional(decode.string))

decode.success(Task(
  ...
  source: source,
))
```

**2. issues表添加6列：**

Gleam代码修改：
```gleam
// 当前定义（psypi_cli/issue.gleam）
pub type Issue {
  Issue(
    id: String,
    title: String,
    description: Option(String),
    severity: IssueSeverity,
    status: IssueStatus,
    issue_type: IssueType,
    created_at: String,
    resolved_at: Option(String),
    created_by: String,
  )
}

// 需要修改为：
pub type Issue {
  Issue(
    id: String,
    title: String,
    description: Option(String),
    severity: IssueSeverity,
    status: IssueStatus,
    issue_type: IssueType,
    created_at: String,
    resolved_at: Option(String),
    created_by: String,
    discovered_by: Option(String),  // 新增
    environment: Option(String),     // 新增
    git_branch: Option(String),      // 新增
    git_hash: Option(String),        // 新增
    reported_by: Option(String),     // 新增
    source: Option(String),          // 新增
  )
}
```

**3. 影响范围：**
- ✅ Gleam类型定义文件（3个）
- ✅ Gleam decoder函数（3个）
- ✅ Gleam encoder函数（如果有）
- ✅ 所有使用这些类型的函数
- ✅ 测试文件
- ⚠️ 可能影响其他依赖这些类型的模块

**4. 如果所有数据库操作已经有Gleam负责：**
- ✅ 只需要修改Gleam代码
- ✅ TypeScript代码不需要修改（psypi使用Gleam）
- ✅ 修改相对集中，风险可控
- ⚠️ 需要重新编译Gleam项目
- ⚠️ 需要测试所有相关功能

---

### 问题2: TraeNuPI迁移后获得新字段，代码要调整吗？

#### TraeNuPI使用TypeScript

根据代码检查，TraeNuPI使用TypeScript，类型定义在：
- `/Users/jk/gits/hub/tools_ai/traenupi/src/common/types.ts`

#### 迁移后获得的新字段：

**1. tasks表获得4个新字段：**
- `delegate_to` - 委托目标
- `delegated_from` - 委托来源
- `metadata` - 元数据
- `template_id` - 任务模板ID

**2. meetings表获得3个新字段：**
- `project_id` - 项目ID
- `summary` - 会议摘要
- `updated_at` - 更新时间

#### TypeScript代码是否需要调整？

**答案：不需要立即调整**

**原因：**

1. **TypeScript类型定义是可选的：**
   ```typescript
   // 当前定义（src/common/types.ts）
   export interface Task {
     id: string;
     description: string;
     goal: string;
     steps: TaskStep[];
     createdAt: number;
   }
   
   export interface Meeting {
     id: string;
     topic: string;
     status: string;
     createdBy: string;
     createdAt: Date;
   }
   ```
   
   这些定义只包含TraeNuPI实际使用的字段，不需要包含数据库的所有字段。

2. **新字段都有默认值或允许NULL：**
   - `delegate_to` - 允许NULL
   - `delegated_from` - 允许NULL
   - `metadata` - 默认值 `'{}'::jsonb`
   - `template_id` - 允许NULL
   - `project_id` - 允许NULL
   - `summary` - 允许NULL
   - `updated_at` - 默认值 `now()`

3. **TraeNuPI的查询不会受影响：**
   - TraeNuPI只查询它需要的字段
   - 新字段不会被查询，也不会导致错误
   - INSERT语句会使用默认值

**如果未来要使用新字段：**

```typescript
// 更新类型定义
export interface Task {
  id: string;
  description: string;
  goal: string;
  steps: TaskStep[];
  createdAt: number;
  // 新增字段（可选）
  delegateTo?: string;
  delegatedFrom?: string;
  metadata?: Record<string, any>;
  templateId?: string;
}

export interface Meeting {
  id: string;
  topic: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  // 新增字段（可选）
  projectId?: string;
  summary?: string;
  updatedAt?: Date;
}
```

**总结：**
- ✅ **不需要立即调整代码**
- ✅ 新字段有默认值，不会破坏现有功能
- ✅ 可以在未来需要时再添加到类型定义
- ✅ 渐进式迁移，风险低

---

## 迁移建议（更新）

### 方案1: 最小迁移（推荐）
**只迁移完全兼容的表：**
- ✅ memory
- ✅ meeting_opinions
- ✅ agent_moods
- ✅ inter_reviews
- ✅ reflections
- ✅ table_documentation
- ✅ meetings（Psypi有额外列，但兼容）

**不迁移：**
- ❌ agent_sessions（主键类型不兼容）
- ⚠️ tasks（状态值不兼容，但可以接受）
- ⚠️ issues（会丢失6列数据）

**优点**: 低风险，简单
**缺点**: 丢失部分历史数据

### 方案2: 完整迁移（复杂）
**需要：**
1. 转换agent_sessions的主键类型
2. 映射状态值（PAUSED→FAKE_COMPLETE, archived→completed）
3. 接受issues表丢失6列数据
4. 接受tasks表丢失1列数据
5. 重建缺失的触发器

**优点**: 保留大部分数据
**缺点**: 复杂，有风险，需要测试

### 方案3: 补充缺失列（需要协调）
**如果要在psypi中添加缺失列：**

**步骤：**
1. 与psypi团队协商，确定是否需要这些列
2. 修改psypi的Gleam代码（类型定义、decoder、encoder）
3. 修改psypi数据库schema（ALTER TABLE）
4. 测试psypi的所有功能
5. 执行数据迁移

**影响：**
- ✅ 保留所有数据
- ⚠️ 需要修改psypi代码
- ⚠️ 需要协调两个团队
- ⚠️ 需要全面测试
- ⚠️ 可能影响psypi的其他功能

**优点**: 数据完整，功能完整
**缺点**: 复杂度高，需要协调，风险较高

---

## 迁移决策

**当前状态**: ✅ **数据库已准备就绪，可以开始迁移**

**最新进展（2026-05-05）：**
- ✅ psypi数据库已添加所有缺失列
- ✅ tasks表：`source`列已存在
- ✅ issues表：所有6个列已存在（`discovered_by`, `environment`, `git_branch`, `git_hash`, `reported_by`, `source`）
- ✅ 数据库schema已兼容

**决策理由：**
1. ✅ psypi已完成schema更新
2. ✅ 所有缺失列已添加
3. ✅ 数据库结构已兼容
4. ⚠️ 仍需等待psypi完成Gleam代码更新

**下一步工作：**
1. ⏸️ 等待psypi更新Gleam代码以支持新列
2. ⏸️ 等待psypi完成测试
3. ✅ 准备迁移脚本（已完成）
4. ✅ 文档化所有差异（已完成）

**当前数据库配置：**
- TraeNuPI继续使用：`nezha`数据库
- 配置文件：`src/common/db.ts`, `src/common/db-safe.ts`
- 状态：正常运行，无需修改

**迁移准备状态：**
- ✅ 数据库schema已兼容
- ⏸️ 等待Gleam代码更新
- ✅ 迁移脚本已准备
- ✅ 文档已完成

---

**报告生成时间**: 2026-05-05
**使用工具**: PostgreSQL系统目录 + Unix标准工具
**验证方法**: 精确的列名对比 + 代码分析
**状态**: 已验证，准确无误
**迁移状态**: ⏸️ 暂停，等待psypi Gleam迁移完成
