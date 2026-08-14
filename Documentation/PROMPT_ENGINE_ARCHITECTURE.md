# Prompt AI Studio
# Prompt Engine Architecture

## 1. Overview

The Prompt Engine is responsible for building professional, brand-aware prompts from structured application data.

The current deterministic implementation does **not** call an AI provider.

---

## 2. Deterministic Build Flow

```text
User Task
   +
Brand
   +
Brand Identity
   +
Brand Rules
   +
Optional Product + Product Template
   +
Optional Persona + Persona Template
   +
Optional Prompt Template
   +
Extra Context
        ↓
Prompt Builder Service
        ↓
Final Prompt Text
```

API:

`POST /api/v1/prompts/build`

---

## 3. Builder Responsibilities

The builder:

- Validates the task
- Loads the selected brand
- Loads Brand Identity
- Loads Brand Rules
- Loads optional Product and Product Template
- Loads optional Persona and Persona Template
- Loads optional Prompt Template
- Replaces standard placeholders
- Applies extra variables/context
- Cleans the final prompt
- Returns plain text

No AI inference occurs during this process.

---

## 4. Prompt Template Variables

Supported standard context includes values such as:

```text
{{brand}}
{{brand_name}}
{{brand_identity}}
{{brand_rules}}
{{product}}
{{product_name}}
{{persona}}
{{persona_name}}
{{task}}
{{extra_context}}
```

Template-defined dynamic fields are also supported for Product and Persona templates.

---

## 5. Saving and Execution

The generated prompt can be saved as a Prompt and later executed through the AI Execution layer.

```text
Builder
  ↓
Prompt Text
  ↓
Save Prompt
  ↓
Prompt Library
  ↓
Execute Prompt
  ↓
AI Provider
```

---

## 6. Quality Principles

Every generated prompt should be:

- Clear
- Specific
- Structured
- Brand aligned
- Action oriented

The deterministic builder is intentionally predictable so that later AI optimization can be measured against a stable baseline.

---

## 7. Future AI Layer

Phase 2 may add an optional optimization step after deterministic construction:

```text
Structured Brand Context
        ↓
Deterministic Prompt Builder
        ↓
Baseline Prompt
        ↓
AI Optimizer
        ↓
Optimized Prompt + Explanation
```

The optimizer must not silently replace the trusted brand context.
