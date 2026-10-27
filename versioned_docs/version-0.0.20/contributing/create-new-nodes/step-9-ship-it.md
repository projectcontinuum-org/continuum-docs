---
sidebar_position: 10
sidebar_label: "9. Ship it"
title: "Step 9: Ship it"
---

# Step 9: Ship it

- **Container image:** set `jibToImage` in `worker/build.gradle.kts` and run `./gradlew :worker:jib`. Jib reads registry credentials from `DOCKER_REPO_USERNAME` / `DOCKER_REPO_PASSWORD`. The base image defaults to `eclipse-temurin:21-jre` and can be changed with `jibFromImage`.
- **Kubernetes:** deploy the worker as its own release in the platform's namespace and set the [environment variables](./step-6-worker-module.md#environment-variables) from Step 6, including a unique `CONTINUUM_NODE_TASK_QUEUE`. The charts in the existing feature repos (for example `continuum-feature-base/charts/`) are a working reference. See [Deployment](../../deployment/helm-charts.md).
- **Publishing feature modules:** the plugins configure Maven Central publishing through JReleaser by default. If you don't publish libraries, set `publishToMavenCentral.set(false)` in the `continuum { }` block.
