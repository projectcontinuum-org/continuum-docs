---
sidebar_position: 9
sidebar_label: Troubleshooting
title: Troubleshooting
---

# Troubleshooting

## My node doesn't show up in the Workbench

The build passes but your node isn't in the palette. Work down this list in order.

1. **Did the worker find the node?** Look at the `bootRun` output for the line `Registered process nodes: [...]` (or `Registered trigger nodes: [...]` for a source node). If your class is listed, the worker is fine and the problem is on the Workbench or platform side: refresh the page and check that the local stack is healthy (`docker compose ps` in `docker/`). If the list is empty or your class is missing, continue with the checks below.
2. **Is the worker registered with the API server?** Open [http://localhost:8090/actuator/health](http://localhost:8090/actuator/health), then run `curl http://localhost:8090/api/v1/node-repo`. The worker must be able to reach the API server (`CONTINUUM_API_SERVER_BASE_URL`, default `http://localhost:8080`).
3. **Is the module on the worker?** `worker/build.gradle.kts` needs `implementation(project(":features:<repo>"))`:
   ```bash
   grep "implementation(project" worker/build.gradle.kts
   ```
4. **Does the `.imports` file name your `AutoConfigure` class?** The file is in your **feature module**, not the worker:
   ```bash
   cat features/<repo>/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
   ```
   It must contain exactly `<your.package>.AutoConfigure`.
5. **Does `@ComponentScan` cover your node?** In `features/<repo>/src/main/kotlin/<your/package/path>/AutoConfigure.kt` (or `src/main/java/…/AutoConfigure.java`), `basePackages` must include your node's package. The node class must be in that package or below.
6. **Is the class annotated?** It needs `@ContinuumNode`, not `@Component`. `./gradlew build` fails without it (`validateContinuumNodeAnnotations`), so if the build passed, this is rarely the cause.

After fixing any of these, rebuild and restart the worker. Reloading the browser isn't enough.

If it is still missing, check that the build output has no compilation errors and that the local stack is healthy. As a last resort, stop the worker, run `docker compose restart` in `docker/`, and start the worker again. Avoid `docker compose down -v`: it deletes the stack's data volumes.

## My node appears but fails when it runs

- Look at the worker console (the `bootRun` output). Your `execute()` exception and stack trace are there.
- A node that fails and then runs again is being **retried**. If the cause can't change between attempts (bad settings, an unconnected port), throw `NodeRuntimeException(isRetriable = false, …)`; see [Errors, retries and progress](./step-4-write-your-node.md#errors-retries-and-progress).
- Reproduce it in a unit test with the same settings and input rows. This is faster than rerunning a workflow.

## Build and start-up errors

| Symptom | Cause and fix |
|---------|---------------|
| `Plugin [id: 'org.projectcontinuum.worker', version: '…'] was not found` | `continuumPlatformVersion` in `gradle.properties` isn't a released version on Maven Central, or `mavenCentral()` is missing from `pluginManagement.repositories` in `settings.gradle.kts`. |
| `Unresolved reference 'databind'` / `'ObjectMapper'` | Jackson 2 imports. Use `tools.jackson.core.type.TypeReference` and `tools.jackson.databind.ObjectMapper`, not `com.fasterxml.jackson.*`. |
| `validateContinuumNodeAnnotations FAILED` | A class extends `ProcessNodeModel` or `TriggerNodeModel` without `@ContinuumNode`. |
| `Unsupported class file major version` or `invalid source release: 21` | The build runs on the wrong JDK. Run `java -version` and `./gradlew --version`; both must report 21. Set `JAVA_HOME` to a JDK 21 and stop old daemons with `./gradlew --stop`. |
| `Java heap space`, `GC overhead limit exceeded` or the Gradle daemon dies during compilation | Gradle needs more memory. The template sets `org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g` in `gradle.properties`. Keep that line; if you removed it, put it back, and make sure the machine has the memory to spare. |
| `Port 8080 was already in use` on `bootRun` | The local API server uses 8080. Keep `server.port: ${SERVER_PORT:8090}` in `application.yaml`. |
| Worker starts but logs connection errors for Kafka, Temporal or MinIO | The local stack isn't running or isn't healthy. Run `docker compose ps` in `docker/` and wait until every container is healthy. The stack needs about 8 GB of RAM, so raise Docker Desktop's memory limit if containers keep restarting or get killed. |
| Worker starts but registers `[]` for both process and trigger nodes | The worker didn't load your module. See the [checklist above](#my-node-doesnt-show-up-in-the-workbench), steps 3 to 5. |
| `NoSuchBeanDefinitionException` or `UnsatisfiedDependencyException` for your node at start-up | The node's constructor asks for a bean Spring can't provide. Nodes can take `ObjectMapper`; anything else must be a bean from the worker. If in doubt, make the constructor empty. |
| A node fails at random, or runs on the wrong worker | Several workers share a task queue. Temporal gives work to whichever worker polls first, including one that doesn't have the node, and nothing warns you. Set a unique `node-task-queue` in `application.yaml` and `taskQueue` in the chart. |
| `IllegalArgumentException: Unsupported type` while writing | A cell value isn't a supported type (String, Int, Long, Float, Double, Boolean, List, Map or SVG). Convert it, or leave the key out instead of using `null`. See [Reading and writing rows](./step-4-write-your-node.md#reading-and-writing-rows). |
| `CredentialsNotFoundException` | The credential name in the node's settings doesn't exist on the credentials server. In the local stack there is no credentials server at all; see [Use a credential](./recipes.md#use-a-credential). |
| Help page reads "Documentation not found" | The `.doc.md` path doesn't match the node's full package and class name. For `com.acme.demo.node.MyNodeModel` it is `src/main/resources/com/acme/demo/node/MyNodeModel.doc.md`. See [Step 4](./step-4-write-your-node.md#2-the-help-page). |

## Release and deployment errors

| Symptom | Cause and fix |
|---------|---------------|
| Helm: `template: no template associated with name` | A rename in `charts/` was only partly done. Every `include "…"` must match a `define` in `_helpers.tpl`. See [Step 3](./step-3-make-it-yours.md#5-the-helm-chart). |
| PR fails `validate-versions` | Bump `featureVersion` in `gradle.properties` and set the chart's `appVersion` to the same value. See [Step 6](./step-6-ship-it.md#1-bump-the-version). |
| Release workflow doesn't start | `on-release.yml` and `release.yml` run on a **published GitHub Release**, not on a tag or a merge. See [Step 6](./step-6-ship-it.md#the-release-flow). |
| Maven Central deploy fails with a namespace or signing error | The `group` (your package) isn't a namespace you verified in the Central Portal, or the GPG secrets are missing. Verify the namespace, or switch publishing off; see [Step 6](./step-6-ship-it.md#3-add-repository-secrets). |
| Jib push fails with `401 Unauthorized` or `denied` | `DOCKER_HUB_USERNAME` / `DOCKER_HUB_PASSWORD` are missing or wrong, or the account can't push to the repository named in `jibToImage`. See [Step 6](./step-6-ship-it.md#4-where-the-image-goes). |
| Pod stuck in `ImagePullBackOff` | The image name or tag in the chart doesn't exist, or the registry is private and the pod has no pull secret. See [Step 6](./step-6-ship-it.md#4-where-the-image-goes). |
| Pod stuck in `Init` | An init container is waiting for Kafka, Temporal or the API server. Its address in `continuum.infra.*` or `continuum.apiServer` doesn't match a real service. Check with `kubectl get svc -n continuum` and see [Step 6](./step-6-ship-it.md#5-configure-the-chart). |
| Pod fails to start because a Secret is missing | `continuum.secrets.existingMinioSecret` names a Secret that doesn't exist in the namespace. See [Step 6](./step-6-ship-it.md#5-configure-the-chart). |
| Saved workflows break after a rename | You renamed or moved a node class. The full class name is the node's identity in saved workflows, so don't rename classes after shipping. |
