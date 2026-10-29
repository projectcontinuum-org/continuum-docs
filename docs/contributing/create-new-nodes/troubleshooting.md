---
sidebar_position: 8
sidebar_label: Troubleshooting
title: Troubleshooting
---

# Troubleshooting

## My node doesn't show up in the Workbench

The build passes but your node isn't in the palette. Work down this list in order.

1. **Is the worker running and registered?** Open [http://localhost:8090/actuator/health](http://localhost:8090/actuator/health), then run `curl http://localhost:8090/api/v1/node-repo`. If your node is in the response, the worker is fine and the problem is on the Workbench or platform side: refresh the page and check that the local stack is healthy. If it isn't in the response, continue with the checks below.
2. **Is the module on the worker?** `worker/build.gradle.kts` needs `implementation(project(":features:<repo>"))`:
   ```bash
   grep "implementation(project" worker/build.gradle.kts
   ```
3. **Does the `.imports` file name your `AutoConfigure` class?** The file is in your **feature module**, not the worker:
   ```bash
   cat features/<repo>/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
   ```
   It must contain exactly `<your.package>.AutoConfigure`.
4. **Does `@ComponentScan` cover your node?** In `features/<repo>/src/main/kotlin/<your/package/path>/AutoConfigure.kt`, `basePackages` must include your node's package. The node class must be in that package or below.
5. **Is the class annotated?** It needs `@ContinuumNode`, not `@Component`. The build fails without it, so if `./gradlew build` passed, this is rarely the cause.

After fixing any of these, rebuild and restart the worker. Reloading the browser isn't enough.

Still not appearing? Check that the node's package ends in `.node`, that the build output has no compilation errors, and that the local stack is healthy (`docker compose ps` in `docker/`). As a last resort, stop the worker, run `docker compose restart` in `docker/`, and start the worker again. Avoid `docker compose down -v`: it deletes the stack's data volumes.

## Errors

| Symptom | Cause and fix |
|---------|---------------|
| `Plugin [id: 'org.projectcontinuum.worker', version: '…'] was not found` | `continuumPlatformVersion` in `gradle.properties` isn't a released version on Maven Central, or `mavenCentral()` is missing from `pluginManagement.repositories` in `settings.gradle.kts`. |
| `Unresolved reference 'databind'` / `'ObjectMapper'` | Jackson 2 imports. Use `tools.jackson.core.type.TypeReference` and `tools.jackson.databind.ObjectMapper`, not `com.fasterxml.jackson.*`. |
| `validateContinuumNodeAnnotations FAILED` | A class extends `ProcessNodeModel` or `TriggerNodeModel` without `@ContinuumNode`. |
| `Port 8080 was already in use` on `bootRun` | The local API server uses 8080. Keep `server.port: ${SERVER_PORT:8090}` in `application.yaml`. |
| A node fails at random, or runs on the wrong worker | Several workers share a task queue. Temporal gives work to whichever worker polls first, including one that doesn't have the node, and nothing warns you. Set a unique `node-task-queue` in `application.yaml` and `taskQueue` in the chart. |
| `IllegalArgumentException: Unsupported type` while writing | A cell value isn't a supported type (String, Int, Long, Float, Double, Boolean, List, Map or SVG). Convert it, or leave the key out instead of using `null`. See [Reading and writing rows](./step-4-write-your-node.md#reading-and-writing-rows). |
| Help page reads "Documentation not found" | The `.doc.md` path doesn't match the node's full package and class name. For `org.example.node.MyNodeModel` it is `src/main/resources/org/example/node/MyNodeModel.doc.md`. See [Step 4](./step-4-write-your-node.md#2-the-help-page). |
| Helm: `template: no template associated with name` | A rename in `charts/` was only partly done. Every `include "…"` must match a `define` in `_helpers.tpl`. See [Step 3](./step-3-make-it-yours.md#5-the-helm-chart). |
| PR fails `validate-versions` | Bump `featureVersion` in `gradle.properties` and set the chart's `appVersion` to the same value. See [Step 6](./step-6-ship-it.md#1-bump-the-version). |
| Saved workflows break after a rename | You renamed or moved a node class. The full class name is the node's identity in saved workflows, so don't rename classes after shipping. |

