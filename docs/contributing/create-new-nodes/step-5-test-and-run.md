---
sidebar_position: 6
sidebar_label: "5. Test and run"
title: "Step 5: Test and run your node"
---

# Step 5: Test and run your node

<Badges>
  <Badge color="purple">Step 5 of 6</Badge>
  <Badge color="blue">About 10 minutes</Badge>
</Badges>

You ran the template unchanged in [Step 1](./step-1-clone-and-run.md). Now run it again with your changes.

## 1. Build and test

```bash
./gradlew build
```

This compiles every module, runs your unit tests, runs `validateContinuumNodeAnnotations` and builds the worker jar. To run one test class:

```bash
./gradlew :features:<repo>:test --tests "*WordCounterNodeModelTest"
```

:::note[The annotation check]
`validateContinuumNodeAnnotations` fails the build when a class extends `ProcessNodeModel` or `TriggerNodeModel` without `@ContinuumNode`. If you see it fail, that's the cause.
:::

## 2. Run the worker

Make sure the local stack from Step 1 is still up (`docker compose ps` in `docker/`), then:

```bash
./gradlew :worker:bootRun
```

## 3. Check the node was loaded

Ask the worker which nodes it serves:

```bash
curl http://localhost:8090/api/v1/node-repo
```

Your **Word Counter** should be in the response. If it isn't, the worker didn't find your node. Work through these checks in order (most common first):

### Pre-Flight Checklist - Node Not Appearing

This is a **silent failure**. The build passes, the worker runs, but your node doesn't appear.

- [ ] **Check the module is in the worker**
  ```bash
  grep "implementation(project" worker/build.gradle.kts
  ```
  Should contain: `implementation(project(":features:<repo>"))`
  
  **If missing**: Add it and rebuild.

- [ ] **Check the AutoConfigure class is named in the .imports file**
  ```bash
  cat worker/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
  ```
  Should contain exactly: `<your.package>.AutoConfigure`
  
  **If wrong**: Fix the class name and rebuild.

- [ ] **Check AutoConfigure scans your package**
  Look at `features/<repo>/src/main/kotlin/<package>/AutoConfigure.kt`:
  ```kotlin
  @ComponentScan(basePackages = ["<your.package>"])
  ```
  Should include your package. Your node class must be in this package or a subpackage.
  
  **If wrong**: Update `basePackages` and rebuild.

- [ ] **Check your node class has the annotation**
  Look at `features/<repo>/src/main/kotlin/<package>/node/<YourNode>NodeModel.kt`:
  ```kotlin
  @ContinuumNode
  class YourNodeModel(...) : ProcessNodeModel() { ... }
  ```
  
  **If missing**: Add `@ContinuumNode` and rebuild.

If all four checks pass, restart the worker and try again.

## 4. Run it in the Workbench

1. Open [http://localhost:3002](http://localhost:3002). **Word Counter** appears under **Demo**.
2. Add a table source that has a `text` column, such as **Create Table**, and connect it to Word Counter.
3. Open the Word Counter settings to see the form you defined, then run the workflow.
4. Click the output port. Every row has a new `word_count` column.

### Verify the Help Page

While in the Workbench, look for a help icon or panel next to your node. It should show documentation from your `.doc.md` file. If it says "Documentation not found", the file path doesn't match. See [Step 4 - The help page](./step-4-write-your-node.md#2-the-help-page).

## 5. Configuration reference for local testing

When running locally (`./gradlew :worker:bootRun`), these values are used by default. You can override them with environment variables when deploying elsewhere:

| Variable | Local default | What it controls |
|----------|---------------|------------------|
| `CONTINUUM_NODE_TASK_QUEUE` | from `application.yaml` | This worker's Temporal task queue |
| `TEMPORAL_SERVER_ADDRESS` | `localhost:7233` | Temporal frontend address |
| `TEMPORAL_NAMESPACE` | `default` | Temporal namespace |
| `CONTINUUM_API_SERVER_BASE_URL` | `http://localhost:8080` | API server for node registration |
| `CONTINUUM_KAFKA_MAIN_BROKER_LIST` | `localhost:39092,39093,39094` | Kafka brokers |
| `CONTINUUM_KAFKA_MAIN_SCHEMA_REGISTRY` | `http://localhost:38080` | Avro schema registry |
| `CONTINUUM_MINIO_ENDPOINT` | `http://localhost:39000` | Object storage endpoint |
| `CONTINUUM_MINIO_USERNAME` | `minioadmin` | MinIO credentials |
| `CONTINUUM_MINIO_PASSWORD` | `minioadmin` | MinIO credentials |
| `CONTINUUM_CACHE_STORAGE_PATH` | `./.continuum-cache/workflow-data` | Local data cache directory |
| `SERVER_PORT` | `8090` | Worker HTTP port (keep 8090 locally; 8080 is for API server) |

For nodes that call `getCredential()`, also set:
| `CONTINUUM_CREDENTIALS_SERVER_BASE_URL` | `http://localhost:8083` | Credentials service |

Locally, you don't need to change these. The defaults work with the local stack from Step 1.

You've now changed the template into your own working worker.

Next: [ship it](./step-6-ship-it.md).
