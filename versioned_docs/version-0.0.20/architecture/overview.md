---
sidebar_label: "🗺️ System Overview"
sidebar_position: 1
---

# System Overview

Continuum is split into a browser frontend, a core backend, and independent feature workers that provide the actual workflow nodes. The core backend has three parts: the API server, the **orchestration service**, which interprets the graph as a Temporal workflow, and the message bridge.

```mermaid
flowchart TB
  subgraph Browser["🖥️ Browser: Continuum Workbench"]
    UI(["🎨 Eclipse Theia IDE + React Flow canvas"])
  end

  API["🌐 <b>API Server</b><br/>REST, node registry"]
  Temporal{{"⏱️ <b>Temporal</b><br/>durable state & task queues"}}
  Orch["🧠 <b>Orchestration Service</b><br/>interprets the graph<br/>as a Temporal workflow"]
  Bridge["🔁 <b>Message Bridge</b><br/>Kafka → MQTT"]
  Kafka[["📨 <b>Kafka</b><br/>events"]]

  subgraph Workers["🧩 Feature Workers: add yours here"]
    direction LR
    Base["📊 Base"]
    Chem["🧪 Cheminformatics"]
    AI["🤖 AI / ML"]
  end

  MinIO[("🗄️ <b>MinIO (S3)</b><br/>Parquet files")]

  UI ==>|"REST"| API
  Bridge -.->|"MQTT / WebSocket<br/>live status"| UI
  API ==>|"start workflow"| Temporal
  Temporal <==>|"workflow tasks"| Orch
  Orch -->|"resolve task queues"| API
  Temporal ==>|"node activities"| Workers
  Orch -.->|"status events"| Kafka
  Kafka -.-> Bridge
  Workers <-->|"read / write"| MinIO

  classDef ui fill:#8b5cf633,stroke:#8b5cf6,stroke-width:2px
  classDef core fill:#ec489933,stroke:#ec4899,stroke-width:2px
  classDef stream fill:#f59e0b33,stroke:#f59e0b,stroke-width:2px
  classDef worker fill:#06b6d433,stroke:#06b6d4,stroke-width:2px
  classDef store fill:#10b98133,stroke:#10b981,stroke-width:2px
  classDef hero fill:#06b6d433,stroke:#06b6d4,stroke-width:4px,stroke-dasharray:6 3
  classDef orch fill:#ec489955,stroke:#ec4899,stroke-width:4px
  class UI ui
  class API,Temporal core
  class Orch orch
  class Kafka,Bridge stream
  class Base,Chem,AI worker
  class MinIO store
```

| Component | Role |
|-----------|------|
| `continuum-api-server` | REST entry point for the workbench, node registry, starts/cancels/terminates workflow runs |
| `continuum-orchestration-service` | Temporal workflow worker that interprets the canvas graph and drives execution. It schedules nodes, routes them to workers, wires outputs to inputs, and publishes status. See [Orchestration Service](./orchestration-service.md). |
| Temporal | Persists every step of the run and delivers workflow and activity tasks through task queues |
| Feature workers | Run the actual node logic (`execute()`) as Temporal activities |
| `continuum-message-bridge` | Forwards Kafka status events to the browser over MQTT, and maintains the node registry |

## Execution flow

<Steps>

1. You design a workflow in the browser (React Flow canvas) and hit **Execute**.
2. `continuum-api-server` validates the node properties, records a `PENDING` run, and starts a `ContinuumWorkflow` on `WORKFLOW_TASK_QUEUE`, passing the graph (nodes + edges) as input.
3. `continuum-orchestration-service` picks up the workflow task and begins interpreting the graph. Its `InitializeActivity` resolves which task queue (= which worker) handles each node type, via `POST /api/v1/node-explorer/nodes/task-queues` against the API server's node registry.
4. The orchestrator finds every node whose parents have all produced output and dispatches `IContinuumNodeActivity.run()` for each one to the resolved worker's task queue. Each node's inputs are wired from its parents' outputs along the graph's edges.
5. The worker downloads input Parquet from MinIO, runs `execute()`, uploads output Parquet, and returns references to the output files.
6. Nodes run in parallel where the DAG allows. The orchestrator waits for the first pending node to complete, records its outputs (or error), and schedules newly unblocked nodes, repeating until the graph is exhausted.
7. On every state change, and whenever a worker sends a progress signal, the orchestrator publishes a `WorkflowUpdateEvent` to Kafka.
8. `continuum-message-bridge` consumes the Kafka event and republishes it to Mosquitto (MQTT).
9. The browser receives the update over MQTT-over-WebSocket and lights up the corresponding node in real time.

</Steps>

The same flow as a sequence:

```mermaid
sequenceDiagram
  autonumber
  participant B as 🖥️ Browser
  participant A as 🌐 API Server
  participant T as ⏱️ Temporal
  participant O as 🧠 Orchestration Service
  participant W as 🧩 Worker
  participant S as 🗄️ MinIO
  participant K as 📨 Kafka → MQTT

  rect rgba(139, 92, 246, 0.10)
    Note over B,O: 🚀 Start
    B->>+A: Execute workflow (REST)
    A->>T: Start ContinuumWorkflow(graph)
    deactivate A
    T->>+O: Workflow task
    O->>A: InitializeActivity: resolve task queues
    A-->>O: node type → task queue
  end

  loop 🔁 until no nodes ready or pending
    rect rgba(236, 72, 153, 0.10)
      Note over O,T: 🧠 Interpret the graph
      O->>T: Schedule run() for each ready node
    end
    rect rgba(6, 182, 212, 0.10)
      Note over T,S: ⚙️ Run the node
      T->>+W: IContinuumNodeActivity.run(node, inputs)
      W->>S: Read input Parquet
      W-->>T: Progress signals
      W->>S: Write output Parquet
      W-->>-T: Output port references
      T->>O: Activity completed
      O->>O: Record outputs, find newly ready nodes
    end
    rect rgba(245, 158, 11, 0.12)
      Note over O,B: 📡 Live status
      O-->>K: WorkflowUpdateEvent
      K-->>B: Node status (MQTT over WebSocket)
    end
  end
  deactivate O
```

## Why this survives crashes

:::tip[Crash-proof by design]
Temporal persists workflow state (in PostgreSQL) at every step. If a worker process dies mid-execution, Temporal retries the pending activity once a worker becomes available again — no data loss, no restart from scratch. If the orchestration service itself restarts, another instance replays the workflow's history and resumes where the DAG loop left off.
:::

This is the "crash-proof execution" promise: a failed Kafka broker, a restarted worker or orchestrator pod, or a dropped network connection doesn't lose workflow progress.

## Task queues

Three Temporal task queues coordinate the system:

| Queue | Consumer | Purpose |
|-------|----------|---------|
| `WORKFLOW_TASK_QUEUE` | `ContinuumWorkflow` (orchestration service) | Drives the DAG execution loop |
| `ACTIVITY_TASK_QUEUE` | `ContinuumNodeActivity` (feature workers) | Runs individual node logic — name overridable per worker via `continuum.core.worker.node-task-queue` |
| `ACTIVITY_TASK_QUEUE_INITIALIZE` | `InitializeActivity` (orchestration service) | Resolves node → task queue routing before dispatch |

See [Orchestration Service](./orchestration-service.md) for how the graph is interpreted, [Node Model & Registration](./node-model.md) for how a worker's nodes end up in that registry in the first place, and [Data Format](./data-format.md) for how data actually moves between nodes.
