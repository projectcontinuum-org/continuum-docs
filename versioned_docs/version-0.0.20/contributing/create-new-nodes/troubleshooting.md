---
sidebar_position: 11
sidebar_label: Troubleshooting
title: Troubleshooting
---

# Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| `Plugin [id: 'org.projectcontinuum.worker', version: '…'] was not found` | That version isn't on Maven Central (for example an old `-SNAPSHOT`), or `mavenCentral()` is missing from `pluginManagement.repositories`. Use a released `continuumPlatformVersion`. See [Step 1](./step-1-root-project.md). |
| `Unresolved reference 'databind'` / `'ObjectMapper'` | You're using Jackson 2 imports (`com.fasterxml.jackson.*`). Switch to `tools.jackson.core.type.TypeReference` and `tools.jackson.databind.ObjectMapper`. |
| `validateContinuumNodeAnnotations FAILED` | A class extends `ProcessNodeModel` or `TriggerNodeModel` without `@ContinuumNode`. |
| Worker starts but your node isn't listed | The `AutoConfiguration.imports` file is missing or points at the wrong class, or the node is outside the `AutoConfigure` package. See [Step 2](./step-2-feature-module.md#register-the-module-with-spring). |
| `Port 8080 was already in use` on `bootRun` | The local API server already uses 8080. Set `server.port` (see [Step 6](./step-6-worker-module.md)). |
| Node fails at random, or runs on the wrong worker | Several workers share a task queue. Set a unique `CONTINUUM_NODE_TASK_QUEUE`. |
| `IllegalArgumentException: Unsupported type` while writing | A cell value isn't one of the [supported types](./step-3-write-the-node.md#reading-and-writing-rows). |
| Help page reads "Documentation not found" | The `.doc.md` path doesn't match the node's package and class name. See [Step 4](./step-4-node-documentation.md). |
