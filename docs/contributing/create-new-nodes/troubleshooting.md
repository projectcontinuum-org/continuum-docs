---
sidebar_position: 8
sidebar_label: Troubleshooting
title: Troubleshooting
---

# Troubleshooting

## My node doesn't show up in the Workbench

This is the most common issue. The build passes but your node isn't in the palette. Work through this checklist in order.

### Quick Diagnostic

First, verify the worker is running and check the node repository:

```bash
# Is the worker healthy?
curl http://localhost:8090/actuator/health

# Does it have any nodes registered?
curl http://localhost:8090/api/v1/node-repo
```

If you don't see your node in the JSON response, continue below.

### Pre-Flight Checklist (Most Common Issues)

These four things are the most common causes. Check all four:

1. **Module is listed in worker/build.gradle.kts**
   ```bash
   grep "implementation(project" worker/build.gradle.kts
   ```
   Should show: `implementation(project(":features:<repo>"))`
   
   **If missing**: Add it, rebuild, and restart the worker.

2. **.imports file names the correct AutoConfigure class**
   ```bash
   cat worker/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
   ```
   Should show exactly: `<your.package>.AutoConfigure`
   
   **If wrong**: Fix the class name, rebuild, and restart.

3. **AutoConfigure.kt has correct @ComponentScan**
   Look at `features/<repo>/src/main/kotlin/<your/package/path>/AutoConfigure.kt`:
   ```kotlin
   @ComponentScan(basePackages = ["<your.package>"])
   ```
   Your node must be in this package or a subpackage.
   
   **If wrong**: Update basePackages, rebuild, and restart.

4. **Your node class has @ContinuumNode annotation**
   ```kotlin
   @ContinuumNode
   class YourNodeModel(...) : ProcessNodeModel() { ... }
   ```
   
   **If missing**: Add the annotation, rebuild, and restart.

:::tip[After fixing any of these, don't forget to restart the worker]
Changes in Gradle files and annotations require a rebuild and worker restart. Just reloading the browser won't work.
:::

### Still Not Appearing?

If all four items above are correct, try these additional checks:

- **Is your node in the right package?** It must be in a package ending in `.node`, and under the package scanned by `AutoConfigure`.
- **Did you run `./gradlew build`?** The build validates annotations and can catch errors earlier.
- **Are there compilation errors?** Check the build output for Jackson or other import errors.
- **Try restarting the whole stack**: Stop the worker, kill the containers, restart them, and start the worker again.

## Errors

| Symptom | Cause and fix |
|---------|---------------|
| `Plugin [id: 'org.projectcontinuum.worker', version: '…'] was not found` | `continuumPlatformVersion` in `gradle.properties` isn't a released version on Maven Central, or `mavenCentral()` is missing from `pluginManagement.repositories` in `settings.gradle.kts`. |
| `Unresolved reference 'databind'` / `'ObjectMapper'` | **Jackson 2 imports instead of Jackson 3.** Use `tools.jackson.core.type.TypeReference` and `tools.jackson.databind.ObjectMapper`. Not `com.fasterxml.jackson.*`. |
| `validateContinuumNodeAnnotations FAILED` | A class extends `ProcessNodeModel` or `TriggerNodeModel` without `@ContinuumNode`. |
| `Port 8080 was already in use` on `bootRun` | The local API server uses 8080. Keep `server.port: ${SERVER_PORT:8090}` in `application.yaml`. |
| **A node fails at random, or runs on the wrong worker** | **Several workers share a task queue** (critical issue). Set a unique `node-task-queue` in `application.yaml` and `taskQueue` in the chart. Search other continuum workers before picking a name. |
| `IllegalArgumentException: Unsupported type` while writing | A cell value isn't a supported type (not String, Int, Long, Float, Double, Boolean, List, Map, or SVG). Convert to one of these types first, or omit the key instead of using null. See [Reading and writing rows](./step-4-write-your-node.md#reading-and-writing-rows). |
| **Help page reads "Documentation not found"** | **The `.doc.md` file path doesn't match the node's package and class name exactly.** Path must be: `src/main/resources/<package.path.separated.by.slashes>/node/<ClassName>.doc.md`. See [Step 4 - The help page](./step-4-write-your-node.md#2-the-help-page). |
| Helm: `template: no template associated with name` | A rename in `charts/` was only partly done. Every `include "…"` must match a `define` in `_helpers.tpl`. See [Step 3](./step-3-make-it-yours.md#5-the-helm-chart). |
| PR fails `validate-versions` | Bump `featureVersion` in `gradle.properties` and set the chart's `appVersion` to the **same value**. See [Step 6](./step-6-ship-it.md#1-bump-the-version). |
| **Saved workflows break after a rename** | **You renamed or moved a node class. The full class name is the node's identity in saved workflows. This is permanent.** Don't rename classes after shipping. |

