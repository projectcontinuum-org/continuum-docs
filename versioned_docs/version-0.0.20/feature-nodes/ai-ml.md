---
sidebar_position: 2
---

# AI / ML Nodes

[`continuum-feature-ai`](https://github.com/projectcontinuum-org/continuum-feature-ai) provides nodes for training and fine-tuning LLMs directly inside workflow graphs. Ships as a Spring Boot worker with an auto-managed Python virtual environment for ML execution.

## LLM Trainer (Unsloth)

Fine-tune large language models using LoRA (Low-Rank Adaptation) with Unsloth acceleration.

| | |
|---|---|
| **Input** | Parquet table with instruction + response columns |
| **Output** | Model info — path to LoRA adapter weights, base model, training config |
| **Category** | Machine Learning, LLM Training |

### Supported base models

| Provider | Models |
|----------|--------|
| Unsloth (fastest) | Phi-4, Phi-4-mini-instruct, Mistral 7B, Llama 3/3.1/3.2, Gemma 2, Qwen 2.5 |
| Microsoft | Phi-2, Phi-3-mini-4k-instruct |
| Meta | Llama-2-7b, Llama-2-7b-chat |
| Google | Gemma 2B, Gemma 7B |
| Qwen | Qwen2-7B, Qwen2-7B-Instruct |
| TII | Falcon 7B, Falcon 7B-instruct |
| Custom | Any HuggingFace causal language model |

### Configurable parameters

| Group | Parameters |
|-------|-----------|
| Model | Base model (HuggingFace ID), HuggingFace token for gated models |
| Data | Input column, output column, system prompt |
| Training | Epochs, batch size, learning rate, max sequence length, warmup steps, weight decay, gradient accumulation |
| LoRA | Rank (r), alpha, dropout |
| Advanced | 4-bit quantization, random seed, save steps, logging steps, Parquet batch size |

### Key features

- Unsloth acceleration on Linux + CUDA (2x faster, 60% less memory)
- Falls back to standard HuggingFace transformers on other platforms
- 4-bit quantization for reduced memory usage
- Real-time training progress streaming via Kafka
- Auto-managed Python virtual environment

See the [`continuum-feature-ai` README](https://github.com/projectcontinuum-org/continuum-feature-ai) for build and run instructions.
