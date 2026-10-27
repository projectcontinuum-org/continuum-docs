---
sidebar_position: 7
sidebar_label: "6. Worker module"
title: "Step 6: Create the worker module"
---

# Step 6: Create the worker module

**`worker/build.gradle.kts`**

```kotlin
plugins {
    id("org.projectcontinuum.worker")
}

group = "org.projectcontinuum.app.worker.demo"
description = "Continuum Feature Demo Worker"
version = property("featureVersion").toString()

continuum {
    continuumVersion.set(property("continuumPlatformVersion").toString())
    // Optional: set this to build a container image with `./gradlew :worker:jib`
    // jibToImage.set("docker.io/your-org/continuum-feature-demo:${version}")
}

dependencies {
    implementation(project(":features:continuum-feature-demo"))
}
```

**`worker/src/main/kotlin/org/projectcontinuum/app/worker/demo/App.kt`**

```kotlin
package org.projectcontinuum.app.worker.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class App

fun main(args: Array<String>) {
    runApplication<App>(*args)
}
```

**`worker/src/main/resources/application.yaml`**

```yaml
spring.application.name: continuum-feature-demo-worker

# The worker runs a web server. Its default port 8080 clashes with
# continuum-api-server in the local stack.
server.port: ${SERVER_PORT:8090}

spring:
  temporal:
    namespace: ${TEMPORAL_NAMESPACE:default}
    connection:
      target: ${TEMPORAL_SERVER_ADDRESS:localhost:7233}
    workersAutoDiscovery:
      packages:
        - org.projectcontinuum.core.worker.starter

continuum.core:
  worker:
    # Every worker needs its OWN task queue (see the warning below).
    node-task-queue: ${CONTINUUM_NODE_TASK_QUEUE:CONTINUUM_FEATURE_DEMO_TASK_QUEUE}

logging:
  level:
    root: error
    org.projectcontinuum.core.worker: info
    org.projectcontinuum.feature.demo: debug
```

:::danger Give every worker a unique task queue
If `node-task-queue` isn't set, a worker listens on the shared default queue `ACTIVITY_TASK_QUEUE`. When two workers share a queue, Temporal can send a node to a worker that doesn't have it, and the node fails. Every shipped worker sets its own queue (for example `CONTINUUM_FEATURE_BASE_TASK_QUEUE`), and yours must too. The worker sends its queue name in its registration message, so the orchestrator knows where to route your nodes.
:::

## Environment variables

You don't need to configure Kafka, MinIO, the API server or the credentials server here. `continuum-worker-springboot-starter` ships defaults that point at the [local stack](../../getting-started/local-setup.md) ports, and each one can be overridden with an environment variable:

| Variable | Default | Purpose |
|----------|---------|---------|
| `TEMPORAL_SERVER_ADDRESS` | `localhost:7233` | Temporal frontend |
| `CONTINUUM_KAFKA_MAIN_BROKER_LIST` | `localhost:39092,localhost:39093,localhost:39094` | Kafka brokers for node registration |
| `CONTINUUM_KAFKA_MAIN_SCHEMA_REGISTRY` | `http://localhost:38080` | Avro schema registry |
| `CONTINUUM_MINIO_ENDPOINT` | `http://localhost:39000` | Object store for Parquet inputs and outputs |
| `CONTINUUM_MINIO_USERNAME` / `_PASSWORD` | `minioadmin` / `minioadmin` | MinIO credentials |
| `CONTINUUM_API_SERVER_BASE_URL` | `http://localhost:8080` | API server |
| `CONTINUUM_CREDENTIALS_SERVER_BASE_URL` | `http://localhost:8083` | Only used by nodes that call `getCredential()` |
| `CONTINUUM_NODE_TASK_QUEUE` | none (falls back to `ACTIVITY_TASK_QUEUE`) | This worker's Temporal task queue |
| `CONTINUUM_CACHE_STORAGE_PATH` | `./.continuum-cache/workflow-data` | Local staging folder for Parquet files |
