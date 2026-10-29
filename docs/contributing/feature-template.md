---
sidebar_label: "🧱 Scaffolding a Worker"
sidebar_position: 1
slug: /contributing
---

# Scaffolding a New Feature Worker

Continuum is designed to be extended by **adding new workers**, not modifying existing ones — see [Node Model & Feature Registration](../architecture/node-model.md) for why that's safe to do independently.

To build your own set of nodes, start from [`continuum-feature-template`](https://github.com/projectcontinuum-org/continuum-feature-template) — a scaffold for a standalone Gradle project with the Spring Boot worker setup, Temporal registration, and `@ContinuumNode` conventions already wired up.

:::tip
The template builds against platform `0.0.20` out of the box and includes a Kotlin and a Java example node, CI/CD workflows, a Helm chart and a local Docker stack. For a step-by-step walkthrough of cloning it, renaming it and writing your first node, see [Create New Nodes](./create-new-nodes/overview.md).
:::

Once your worker is running and registering nodes, it can be deployed as an independent release into the same Kubernetes namespace as the core platform (see [Deployment](../deployment/helm-charts.md)) — no changes to `continuum-platform-core` or any other feature repo required.

For questions or to report issues, use the [GitHub issue tracker](https://github.com/projectcontinuum-org/continuum-platform-core/issues) on the core repo.
