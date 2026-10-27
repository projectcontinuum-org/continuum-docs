---
sidebar_position: 1
slug: /ecosystem
---

# Repositories

Project Continuum is split across several focused repositories under the [`projectcontinuum-org`](https://github.com/projectcontinuum-org) GitHub organization — not a monorepo. Each one can be built and released independently.

| Repository | Description |
|-----------|-------------|
| [continuum-platform-core](https://github.com/projectcontinuum-org/continuum-platform-core) | Core backend — API server, Temporal orchestration, message bridge, credentials server, cluster manager, cloud gateway |
| [continuum-workbench](https://github.com/projectcontinuum-org/continuum-workbench) | Browser IDE — Eclipse Theia + React Flow workflow editor |
| [continuum-feature-base](https://github.com/projectcontinuum-org/continuum-feature-base) | Base analytics nodes — data transforms, REST, scripting, anomaly detection |
| [continuum-feature-ai](https://github.com/projectcontinuum-org/continuum-feature-ai) | AI/ML nodes — LLM fine-tuning with Unsloth + LoRA |
| [continuum-feature-cheminformatics](https://github.com/projectcontinuum-org/continuum-feature-cheminformatics) | Cheminformatics nodes — RDKit-powered molecular processing |
| [continuum-feature-knime](https://github.com/projectcontinuum-org/continuum-feature-knime) | KNIME-compatible workflow executors |
| [continuum-feature-template](https://github.com/projectcontinuum-org/continuum-feature-template) | Template — scaffold your own custom feature worker |
| [continuum-charts](https://github.com/projectcontinuum-org/continuum-charts) | Helm charts for deploying Continuum on Kubernetes |
| [continuum-local-setup](https://github.com/projectcontinuum-org/continuum-local-setup) | Docker Compose setup for running the entire platform locally |
| [continuum-website](https://github.com/projectcontinuum-org/continuum-website) | Marketing site ([projectcontinuum.org](https://projectcontinuum.org)) |
| [continuum-docs](https://github.com/projectcontinuum-org/continuum-docs) | This documentation site |

## Feature workers are independent

Feature workers (`continuum-feature-*`) are not part of `continuum-platform-core` — each lives in its own repo with its own build and release pipeline, and can be deployed as an independent worker service into the same namespace as the core platform. This is intentional: new capabilities ship as new workers, not as changes to existing ones. See [Node Model & Feature Registration](../architecture/node-model.md) for how a worker's nodes get discovered by the platform at runtime.
