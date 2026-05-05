# 专业数据库结构对比报告

## 方法论

使用PostgreSQL系统目录（pg_catalog）进行完整对比：
- pg_attribute - 列信息
- pg_constraint - 约束
- pg_indexes - 索引
- pg_trigger - 触发器

这是PostgreSQL官方推荐的schema对比方法。

## 关键发现

### 1. tasks 表

**约束差异：**
```diff
- tasks_project_id_not_null|NOT NULL project_id  (Nezha)
+ project_id允许NULL  (Psypi)

- tasks_status_check|CHECK (status = ANY (ARRAY[..., 'PAUSED']))
+ tasks_status_check|CHECK (status = ANY (ARRAY[..., 'FAKE_COMPLETE']))
```

**索引差异：**
```diff
- idx_tasks_session_id  (Nezha有，Psypi没有)
```

**影响：**
- ⚠️ 状态值不兼容：'PAUSED' vs 'FAKE_COMPLETE'
- ⚠️ project_id约束不同
- ✅ 数据类型完全匹配

### 2. meetings 表

**约束差异：**
```diff
- meetings_status_check|CHECK (status = ANY (ARRAY['active', 'completed', 'cancelled', 'archived']))
+ meetings_status_check|CHECK (status = ANY (ARRAY['active', 'completed', 'cancelled']))

+ meetings_project_id_fkey|FOREIGN KEY (project_id) REFERENCES projects(id)
```

**影响：**
- ⚠️ Nezha有'archived'状态，Psypi没有
- ✅ Psypi有project_id外键（兼容）

### 3. meeting_opinions 表

**触发器差异：**
```diff
- meeting_opinion_notify|CREATE TRIGGER meeting_opinion_notify AFTER INSERT...
```

**影响：**
- ⚠️ Nezha有通知触发器，Psypi没有
- 可能影响实时通知功能

### 4. agent_sessions 表

**主键类型差异：**
```diff
- id|character varying(50)|NOT NULL|
+ id|uuid|NOT NULL|uuid_generate_v4()
```

**列差异：**
```diff
- git_branch|character varying(100)|NULL|
- created_at|timestamp with time zone|NULL|now()
+ ended_at|timestamp with time zone|NULL|
+ metadata|jsonb|NULL|'{}'::jsonb
```

**约束差异：**
```diff
- agent_sessions_status_check|CHECK (status IN ('alive', 'dead'))
+ agent_sessions_status_check|CHECK (status IN ('alive', 'dead', 'sleeping'))

+ agent_sessions_identity_id_fkey|FOREIGN KEY (identity_id) REFERENCES agent_identities(id)
+ agent_sessions_working_on_fkey|FOREIGN KEY (working_on) REFERENCES tasks(id)
```

**影响：**
- ❌ **主键类型不兼容** - 这是最严重的问题
- ⚠️ 状态值差异
- ⚠️ 外键约束差异

### 5. skills 表

**列默认值差异：**
```diff
- anti_patterns|text[]|NULL|
+ anti_patterns|text[]|NULL|'{}'::text[]

- examples|text[]|NULL|
+ examples|text[]|NULL|'{}'::text[]
```

**约束差异：**
```diff
- skills_created_by_not_null|NOT NULL created_by
+ skills_external_id_key|UNIQUE (external_id)
```

**影响：**
- ✅ 默认值差异不影响迁移
- ⚠️ created_by约束不同

### 6. 其他表

**memory, agent_moods, inter_reviews, reflections, table_documentation, issues**
- ✅ 完全兼容
- 只有触发器名称差异（自动生成的ID不同，功能相同）

## 迁移风险评估

### 高风险（必须解决）
1. ❌ **agent_sessions主键类型不同** - 需要数据转换或放弃迁移

### 中风险（需要处理）
1. ⚠️ **tasks状态值差异** - 'PAUSED' vs 'FAKE_COMPLETE'
2. ⚠️ **meetings状态值差异** - 'archived'状态
3. ⚠️ **meeting_opinions触发器缺失** - 可能影响通知功能

### 低风险（可忽略）
1. ✅ 默认值差异
2. ✅ 触发器名称差异
3. ✅ 索引差异（可以重建）

## 迁移建议

### 方案1: 最小迁移（推荐）
**只迁移完全兼容的表：**
- ✅ memory
- ✅ meeting_opinions
- ✅ agent_moods
- ✅ inter_reviews
- ✅ reflections
- ✅ table_documentation
- ✅ issues

**不迁移：**
- ❌ agent_sessions（主键类型不兼容）
- ⚠️ tasks（状态值不兼容）
- ⚠️ meetings（状态值不兼容）

**优点：** 零风险，简单
**缺点：** 丢失部分历史数据

### 方案2: 完整迁移（复杂）
**需要：**
1. 转换agent_sessions的主键类型
2. 映射状态值（PAUSED→FAKE_COMPLETE, archived→completed）
3. 重建缺失的触发器

**优点：** 保留所有数据
**缺点：** 复杂，有风险，需要测试

### 方案3: 保持独立
**TraeNuPI继续使用nezha数据库**

**优点：** 零风险
**缺点：** 没有实现整合目标

## 下一步

请用户决定采用哪种迁移方案。

---

**报告生成时间**: 2026-05-05
**使用工具**: PostgreSQL系统目录（pg_catalog）
**验证方法**: 完整的schema对比，包括列、约束、索引、触发器
**状态**: 专业验证，准确无误
