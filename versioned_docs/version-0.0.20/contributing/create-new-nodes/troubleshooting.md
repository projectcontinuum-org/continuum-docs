---
sidebar_position: 8
sidebar_label: Troubleshooting
title: Troubleshooting
---

# Troubleshooting

## My node doesn't show up in the Workbench

Work down this list. Each item is a more common cause than the next.

1. **Is the worker running and registered?** Open [http://localhost:8090/actuator/health](http://localhost:8090/actuator/health), then `curl http://localhost:8090/api/v1/node-repo`. If your node is in the response, the problem is on the Workbench or platform side; refresh the page and check the local stack is healthy.
2. **Is the module on the worker?** `worker/build.gradle.kts` needs `implementation(project(":features:<repo>"))`.
3. **Does Spring find the module?** The `.imports` file must contain the full name of your `AutoConfigure` class, and `AutoConfigure`'s `@ComponentScan(basePackages = ...)` must cover your node's package. See [Step 3](./step-3-make-it-yours.md#2-the-feature-module).
4. **Is the class annotated?** It needs `@ContinuumNode`, not `@Component`.

## Errors

| Symptom | Cause and fix |
|---------|---------------|
| `Plugin [id: 'org.projectcontinuum.worker', version: '…'] was not found` | `continuumPlatformVersion` in `gradle.properties` isn't a released version on Maven Central, or `mavenCentral()` is missing from `pluginManagement.repositories` in `settings.gradle.kts`. |
| `Unresolved reference 'databind'` / `'ObjectMapper'` | Jackson 2 imports. Use `tools.jackson.core.type.TypeReference` and `tools.jackson.databind.ObjectMapper`. |
| `validateContinuumNodeAnnotations FAILED` | A class extends `ProcessNodeModel` or `TriggerNodeModel` without `@ContinuumNode`. |
| `Port 8080 was already in use` on `bootRun` | The local API server uses 8080. Keep `server.port: ${SERVER_PORT:8090}` in `application.yaml`. |
| A node fails at random, or runs on the wrong worker | Several workers share a task queue. Set a unique `node-task-queue` in `application.yaml` and `taskQueue` in the chart. |
| `IllegalArgumentException: Unsupported type` while writing | A cell value isn't a supported type. See [Reading and writing rows](./step-4-write-your-node.md#reading-and-writing-rows). |
| Help page reads "Documentation not found" | The `.doc.md` path doesn't match the node's package and class name. See [Step 4](./step-4-write-your-node.md#2-the-help-page). |
| Helm: `template: no template associated with name` | A rename in `charts/` was only partly done. Every `include "…"` must match a `define` in `_helpers.tpl`. See [Step 3](./step-3-make-it-yours.md#5-the-helm-chart). |
| PR fails `validate-versions` | Bump `featureVersion` in `gradle.properties` and set the chart's `appVersion` to the same value. See [Step 6](./step-6-ship-it.md#1-bump-the-version). |
| Saved workflows break after a rename | You renamed or moved a node class. The full class name is the node's identity in saved workflows. |
