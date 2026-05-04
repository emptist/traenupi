# OpenRouter 免费模型列表

**更新日期**: 2026-05-04  
**来源**: OpenRouter API

## 推荐模型

### 🌟 腾讯 Hy3 Preview (推荐)
- **ID**: `tencent/hy3-preview:free`
- **名称**: Tencent: Hy3 preview (free)
- **特点**: 腾讯的免费模型，性能优秀
- **状态**: ✅ 已测试成功

### 其他优秀免费模型

#### Google Gemma 系列
- `google/gemma-3-4b-it:free` - Google: Gemma 3 4B (free)
- `google/gemma-3-12b-it:free` - Google: Gemma 3 12B (free)
- `google/gemma-3-27b-it:free` - Google: Gemma 3 27B (free)
- `google/gemma-3n-e2b-it:free` - Google: Gemma 3n 2B (free)
- `google/gemma-3n-e4b-it:free` - Google: Gemma 3n 4B (free)
- `google/gemma-4-26b-a4b-it:free` - Google: Gemma 4 26B A4B (free)
- `google/gemma-4-31b-it:free` - Google: Gemma 4 31B (free)

#### Meta Llama 系列
- `meta-llama/llama-3.2-3b-instruct:free` - Meta: Llama 3.2 3B Instruct (free)
- `meta-llama/llama-3.3-70b-instruct:free` - Meta: Llama 3.3 70B Instruct (free)

#### NVIDIA Nemotron 系列
- `nvidia/nemotron-3-nano-30b-a3b:free` - NVIDIA: Nemotron 3 Nano 30B A3B (free)
- `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` - NVIDIA: Nemotron 3 Nano Omni (free)
- `nvidia/nemotron-3-super-120b-a12b:free` - NVIDIA: Nemotron 3 Super (free)
- `nvidia/nemotron-nano-12b-v2-vl:free` - NVIDIA: Nemotron Nano 12B 2 VL (free)
- `nvidia/nemotron-nano-9b-v2:free` - NVIDIA: Nemotron Nano 9B V2 (free)

#### Qwen 系列
- `qwen/qwen3-coder:free` - Qwen: Qwen3 Coder 480B A35B (free)
- `qwen/qwen3-next-80b-a3b-instruct:free` - Qwen: Qwen3 Next 80B A3B Instruct (free)

#### 其他模型
- `nousresearch/hermes-3-llama-3.1-405b:free` - Nous: Hermes 3 405B Instruct (free)
- `minimax/minimax-m2.5:free` - MiniMax: MiniMax M2.5 (free)
- `openai/gpt-oss-120b:free` - OpenAI: gpt-oss-120b (free)
- `openai/gpt-oss-20b:free` - OpenAI: gpt-oss-20b (free)
- `inclusionai/ling-2.6-1t:free` - inclusionAI: Ling-2.6-1T (free)
- `liquid/lfm-2.5-1.2b-instruct:free` - LiquidAI: LFM2.5-1.2B-Instruct (free)
- `liquid/lfm-2.5-1.2b-thinking:free` - LiquidAI: LFM2.5-1.2B-Thinking (free)
- `poolside/laguna-m.1:free` - Poolside: Laguna M.1 (free)
- `poolside/laguna-xs.2:free` - Poolside: Laguna XS.2 (free)
- `z-ai/glm-4.5-air:free` - Z.ai: GLM 4.5 Air (free)
- `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` - Venice: Uncensored (free)
- `baidu/qianfan-ocr-fast:free` - Baidu: Qianfan-OCR-Fast (free)

#### 特殊用途
- `openrouter/free` - Free Models Router
- `openrouter/owl-alpha` - Owl Alpha
- `google/lyria-3-clip-preview` - Google: Lyria 3 Clip Preview
- `google/lyria-3-pro-preview` - Google: Lyria 3 Pro Preview

## 使用建议

### 通用对话
推荐使用：
1. `tencent/hy3-preview:free` - 腾讯 Hy3，性能优秀
2. `meta-llama/llama-3.3-70b-instruct:free` - Llama 3.3 70B，大模型
3. `google/gemma-3-27b-it:free` - Gemma 3 27B，平衡性能

### 代码生成
推荐使用：
1. `qwen/qwen3-coder:free` - Qwen3 Coder，专门优化代码
2. `openai/gpt-oss-120b:free` - OpenAI 大模型

### 推理任务
推荐使用：
1. `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` - NVIDIA 推理模型
2. `liquid/lfm-2.5-1.2b-thinking:free` - LiquidAI 思维模型

### 轻量级任务
推荐使用：
1. `google/gemma-3-4b-it:free` - Gemma 3 4B，速度快
2. `liquid/lfm-2.5-1.2b-instruct:free` - LFM2.5 1.2B，轻量级

## 测试结果

### tencent/hy3-preview:free ✅

**测试日期**: 2026-05-04

**非流式测试**:
```
Request: "Hello! Can you tell me a short joke?"
Response: "Why don't scientists trust atoms? Because they make up everything! 😄"
Tokens: 22 prompt + 219 completion = 241 total
```

**流式测试**:
```
Request: "Count from 1 to 5, one number per line."
Response: "1\n2\n3\n4\n5\n"
Status: ✅ 成功
```

## 如何选择模型

1. **性能优先**: 选择大模型（70B+）
2. **速度优先**: 选择小模型（4B-12B）
3. **代码任务**: 选择专门的代码模型
4. **推理任务**: 选择推理优化模型
5. **中文任务**: 推荐腾讯 Hy3 或 Qwen

## 更新模型列表

运行以下命令获取最新模型列表：

```bash
curl -s "https://openrouter.ai/api/v1/models" \
  -H "Authorization: Bearer YOUR_API_KEY" | \
  jq -r '.data[] | select(.pricing.prompt == "0") | "\(.id) - \(.name)"' | \
  sort
```

## 注意事项

1. 免费模型可能有使用限制
2. 模型可用性可能随时变化
3. 建议定期检查模型状态
4. 对于生产环境，建议使用付费模型以获得更好的稳定性
