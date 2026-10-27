---
sidebar_position: 1
sidebar_label: Overview
title: Create New Nodes
slug: /contributing/create-new-nodes
---

# Create New Nodes

This guide walks you through building a **feature worker** with your own workflow node, from an empty folder to a passing build and a worker that registers its node with the platform. The running example is a **Word Counter** node that counts the words in a text column and appends the count as a new column.

<Badges>
  <Badge color="cyan">Kotlin + Gradle</Badge>
  <Badge color="green">9 steps</Badge>
  <Badge color="amber">Platform 0.0.20</Badge>
</Badges>

You need to know some Kotlin and Gradle. You don't need to know Temporal, Kafka or Spring internals; the Continuum Gradle plugins and the worker starter handle those.

:::info[Versions used in this guide]
Verified against **Continuum platform `0.0.20`** (Spring Boot 4.0.6, Kotlin 2.2, Jackson 3, Gradle 8.14, JDK 21). Check [Maven Central](https://central.sonatype.com/artifact/org.projectcontinuum.core/continuum-commons) for the latest platform version, and use the same version everywhere in your project.
:::

## How the pieces fit

A feature worker is a small Gradle multi-project:

```
continuum-feature-demo/
├── settings.gradle.kts           # plugin versions + module list
├── gradle.properties             # continuumPlatformVersion, featureVersion
├── features/
│   └── continuum-feature-demo/   # library module: your node classes
└── worker/                       # thin Spring Boot app that hosts the nodes
```

- **Feature modules** (`org.projectcontinuum.feature` plugin) hold the node classes. They're plain libraries and can be published and reused.
- **The worker module** (`org.projectcontinuum.worker` plugin) is a Spring Boot app with no node logic of its own. It depends on your feature modules and on `continuum-worker-springboot-starter`. At startup the starter finds every `@ContinuumNode` bean, polls a Temporal task queue for node executions, and publishes one registration message per node to Kafka.

See [Node Model & Feature Registration](../../architecture/node-model.md) for what happens after registration.

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| JDK 21 | Eclipse Temurin recommended. The plugins set a Java 21 toolchain. |
| Gradle wrapper 8.14+ | Older wrappers (for example 8.4) can't load the Spring Boot 4 Gradle plugin. |
| Docker | Only needed to run the worker against the [local stack](../../getting-started/local-setup.md). |

You **don't** need a GitHub token. All Continuum artifacts and Gradle plugins are published to **Maven Central**.

## The steps

<Steps>

1. [Create the root project](./step-1-root-project.md)
2. [Create the feature module](./step-2-feature-module.md)
3. [Write the node](./step-3-write-the-node.md)
4. [Add node documentation](./step-4-node-documentation.md)
5. [Write unit tests](./step-5-unit-tests.md)
6. [Create the worker module](./step-6-worker-module.md)
7. [Build and test](./step-7-build-and-test.md)
8. [Run the worker against the local stack](./step-8-run-locally.md)
9. [Ship it](./step-9-ship-it.md)

</Steps>

If something goes wrong along the way, see [Troubleshooting](./troubleshooting.md).
