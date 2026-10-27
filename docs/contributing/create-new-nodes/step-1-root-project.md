---
sidebar_position: 2
sidebar_label: "1. Root project"
title: "Step 1: Create the root project"
---

# Step 1: Create the root project

Create the folder and add a Gradle wrapper. If Gradle is installed, run `gradle wrapper --gradle-version 8.14`. Otherwise, copy `gradlew`, `gradlew.bat` and `gradle/wrapper/` from an existing feature repo such as `continuum-feature-base`.

**`gradle.properties`**

```properties
repoName=your-org/continuum-feature-demo
continuumPlatformVersion=0.0.20
featureVersion=0.0.1

# Spring Boot 4 pulls in a large Kotlin compiler jar; give the Gradle daemon enough heap.
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g
```

- `continuumPlatformVersion` selects the Gradle plugin version and the `continuum-commons` / `continuum-worker-springboot-starter` versions.
- `featureVersion` is your own version.
- `repoName` is used in published POM metadata and in the default container image name.

**`settings.gradle.kts`**

```kotlin
pluginManagement {
    val continuumPlatformVersion: String by settings
    repositories {
        mavenLocal()
        mavenCentral()
        gradlePluginPortal()
    }
    plugins {
        id("org.projectcontinuum.feature") version continuumPlatformVersion
        id("org.projectcontinuum.worker") version continuumPlatformVersion
    }
}

rootProject.name = "continuum-feature-demo"

include(":features:continuum-feature-demo")
include(":worker")
```

The plugins are resolved from Maven Central, so `mavenCentral()` must be in `pluginManagement.repositories`, not only in `gradlePluginPortal()`.
