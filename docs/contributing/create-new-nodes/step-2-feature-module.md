---
sidebar_position: 3
sidebar_label: "2. Feature module"
title: "Step 2: Create the feature module"
---

# Step 2: Create the feature module

**`features/continuum-feature-demo/build.gradle.kts`**

```kotlin
plugins {
    id("org.projectcontinuum.feature")
}

group = "org.projectcontinuum.feature.demo"
description = "Continuum Feature Demo — demo nodes"
version = property("featureVersion").toString()

continuum {
    continuumVersion.set(property("continuumPlatformVersion").toString())
}
```

:::warning Always set `continuumVersion`
If you leave out the `continuum { }` block, the plugin falls back to a built-in default version that is older than the plugin itself. Read the value from `gradle.properties` so plugins and libraries always match.
:::

The `org.projectcontinuum.feature` plugin applies Kotlin and Spring dependency management and adds these dependencies for you, so you don't declare them yourself:

- Spring Boot starter, web, actuator and autoconfigure
- `continuum-commons`
- `kotlin-reflect` and `tools.jackson.module:jackson-module-kotlin`
- Test: `spring-boot-starter-test`, `kotlin-test-junit5`, `mockito-kotlin`

It also registers the `validateContinuumNodeAnnotations` task, which runs before `classes`. Add a `dependencies { }` block only for extra libraries your nodes need.

## Register the module with Spring

The worker finds your nodes through Spring Boot auto-configuration, so each feature module needs two small files.

**`src/main/kotlin/org/projectcontinuum/feature/demo/AutoConfigure.kt`**

```kotlin
package org.projectcontinuum.feature.demo

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration

@Configuration
@ComponentScan
class AutoConfigure
```

**`src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`**

```text
org.projectcontinuum.feature.demo.AutoConfigure
```

`@ComponentScan` with no arguments scans the package of `AutoConfigure` and its subpackages. If the imports file is missing or names the wrong class, the build still passes but the worker starts with none of your nodes.
