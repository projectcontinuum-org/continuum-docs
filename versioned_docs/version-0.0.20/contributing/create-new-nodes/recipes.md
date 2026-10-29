---
sidebar_position: 8
sidebar_label: "More node recipes"
title: "More node recipes"
---

# More node recipes

<Badges>
  <Badge color="blue">After Step 5</Badge>
  <Badge color="cyan">Kotlin examples</Badge>
</Badges>

[Step 4](./step-4-write-your-node.md) builds one process node. This page covers what you reach for next. The Kotlin code on this page was compiled and its tests were run against platform `0.0.20`. Java versions follow the same shape as the Java Word Counter in Step 4, and the notes below say where the API differs.

## Add a second node

You don't need a new module for every node. Add another class to the same package:

1. Create `<package>/node/MyOtherNodeModel.kt` next to your first node, annotated with `@ContinuumNode`.
2. Add `MyOtherNodeModel.doc.md` in the matching resources folder.
3. Add a test.
4. Bump `featureVersion` and the chart's `appVersion` before you ship ([Step 6](./step-6-ship-it.md#1-bump-the-version)).

That's all. `AutoConfigure` already scans your whole package, so there is nothing to register. Rebuild and restart the worker; it logs every node it found:

```text
Registered process nodes: [com.acme.demo.node.WordCounterNodeModel, com.acme.demo.node.MyOtherNodeModel]
Registered trigger nodes: [...]
```

Create a **second module** only when you want to publish some nodes as a separate library, or keep unrelated nodes apart. A new module needs a folder under `features/`, an `include(...)` in `settings.gradle.kts`, an `implementation(project(...))` in `worker/build.gradle.kts`, its own `AutoConfigure` and `.imports` file, and entries in the two workflow files. [Step 2](./step-2-tour-the-template.md#files-that-must-agree-with-each-other) lists everything that must agree.

## A source node with no inputs

A node that creates data from nothing (a generator, a file reader, an API poll) extends `TriggerNodeModel` instead of `ProcessNodeModel`. It has no `inputPorts`, and `execute()` has no `inputs` parameter:

```kotlin
package com.acme.demo.node

import org.projectcontinuum.core.commons.annotation.ContinuumNode
import org.projectcontinuum.core.commons.model.ContinuumWorkflowModel
import org.projectcontinuum.core.commons.node.TriggerNodeModel
import org.projectcontinuum.core.commons.utils.NodeOutputWriter
import org.springframework.http.MediaType.APPLICATION_OCTET_STREAM_VALUE

@ContinuumNode
class NumberGeneratorNodeModel : TriggerNodeModel() {

  final override val outputPorts = mapOf(
    "output" to ContinuumWorkflowModel.NodePort(name = "Numbers", contentType = APPLICATION_OCTET_STREAM_VALUE)
  )

  override val categories = listOf("Demo")

  override val metadata = ContinuumWorkflowModel.NodeData(
    id = this.javaClass.name,
    nodeModel = this.javaClass.name,
    title = "Number Generator",
    subTitle = "Create a table of numbers",
    description = "Creates a table with a number column and its square",
    outputs = outputPorts,
    properties = mapOf("count" to 10),
    propertiesSchema = mapOf(
      "type" to "object",
      "properties" to mapOf("count" to mapOf("type" to "integer", "title" to "Row Count", "minimum" to 1)),
      "required" to listOf("count")
    ),
    propertiesUISchema = mapOf(
      "type" to "VerticalLayout",
      "elements" to listOf(mapOf("type" to "Control", "scope" to "#/properties/count"))
    )
  )

  override fun execute(properties: Map<String, Any>?, nodeOutputWriter: NodeOutputWriter) {
    val count = (properties?.get("count") as Number?)?.toInt() ?: 10

    nodeOutputWriter.createOutputPortWriter("output").use { writer ->
      for (n in 0 until count) {
        writer.write(n.toLong(), mapOf("n" to n, "square" to n * n))
      }
    }
  }
}
```

Everything else from Step 4 applies: the `.doc.md` help page, the package rule, the row types and the test approach. In a test you call `execute(properties, outputWriter)` with just two arguments.

This example builds its schemas with `mapOf(...)` instead of parsing JSON strings. Both styles work; `mapOf` needs no `ObjectMapper`.

## Use a credential

Nodes that call an API, a database or a cloud service shouldn't take secrets as plain settings. Store the secret as a **credential** in the platform, let the user pick it in the node's form, and read it in `execute()`.

There are three pieces:

1. The settings hold only the credential's **name**.
2. The UI schema marks that control with `options.format = "credential"`, so the Workbench shows a credential picker.
3. `execute()` takes an extra `ExecutionContext` parameter and calls `getCredential`.

```kotlin
package com.acme.demo.node

import org.projectcontinuum.core.commons.annotation.ContinuumNode
import org.projectcontinuum.core.commons.context.ExecutionContext
import org.projectcontinuum.core.commons.exception.NodeRuntimeException
import org.projectcontinuum.core.commons.model.ContinuumWorkflowModel
import org.projectcontinuum.core.commons.node.ProcessNodeModel
import org.projectcontinuum.core.commons.protocol.progress.NodeProgressCallback
import org.projectcontinuum.core.commons.utils.NodeInputReader
import org.projectcontinuum.core.commons.utils.NodeOutputWriter
import org.springframework.http.MediaType.APPLICATION_OCTET_STREAM_VALUE

@ContinuumNode
class ApiLookupNodeModel : ProcessNodeModel() {

  final override val inputPorts = mapOf(
    "input" to ContinuumWorkflowModel.NodePort(name = "Input Table", contentType = APPLICATION_OCTET_STREAM_VALUE)
  )
  final override val outputPorts = mapOf(
    "output" to ContinuumWorkflowModel.NodePort(name = "Output Table", contentType = APPLICATION_OCTET_STREAM_VALUE)
  )
  override val categories = listOf("Demo")

  override val metadata = ContinuumWorkflowModel.NodeData(
    id = this.javaClass.name,
    nodeModel = this.javaClass.name,
    title = "API Lookup",
    description = "Calls an API with a stored credential",
    inputs = inputPorts,
    outputs = outputPorts,
    properties = mapOf("credential" to ""),
    propertiesSchema = mapOf(
      "type" to "object",
      "properties" to mapOf("credential" to mapOf("type" to "string", "title" to "Credential")),
      "required" to listOf("credential")
    ),
    propertiesUISchema = mapOf(
      "type" to "VerticalLayout",
      "elements" to listOf(
        mapOf(
          "type" to "Control",
          "scope" to "#/properties/credential",
          "options" to mapOf("format" to "credential", "credentialType" to "GENERIC")
        )
      )
    )
  )

  // The shape of the credential's key-value data
  data class ApiKey(val key: String)

  override fun execute(
    properties: Map<String, Any>?,
    inputs: Map<String, NodeInputReader>,
    nodeOutputWriter: NodeOutputWriter,
    nodeProgressCallback: NodeProgressCallback,
    executionContext: ExecutionContext
  ) {
    val name = properties?.get("credential") as String?
      ?: throw NodeRuntimeException(isRetriable = false, workflowId = "", nodeId = "", message = "No credential selected")
    val apiKey = executionContext.getCredential<ApiKey>(name)

    nodeOutputWriter.createOutputPortWriter("output").use { writer ->
      writer.write(0L, mapOf("key_length" to apiKey.key.length))
    }
  }
}
```

The example only writes the length of the key. **Never write secrets to an output port or a log.** In your own node, use the key to call the API and write the response.

Things to know:

- `getCredential` throws `CredentialsNotFoundException` if no credential has that name. Decide whether that should be retried; usually it is a user error and should become a non-retriable `NodeRuntimeException`.
- In Java, call `executionContext.getCredential(name, ApiKey.class)`, with `ApiKey` as a class or record whose fields match the credential's keys. The `execute` override takes the same five parameters.
- Overriding the five-parameter `execute` replaces the four-parameter one. Don't override both.
- The worker reads credentials from the credentials server at `CONTINUUM_CREDENTIALS_SERVER_BASE_URL` (default `http://localhost:8083`). The template's local Docker stack doesn't include one, so you can't try this node end to end locally unless you run the credentials server yourself. Test it with a fake fetcher instead, as below.
- **On Kubernetes, set that variable in your chart.** The `continuum-platform` chart deploys the credentials server, but the template's `deployment.yaml` doesn't pass its address to your worker, so a credential node would look for `localhost:8083` and fail. Add this to the `env:` list in `charts/<repo>/templates/deployment.yaml`, next to `CONTINUUM_API_SERVER_BASE_URL`, and adjust the host if you installed `continuum-platform` under another release name (the service is `<release-name>-credentials-server`, port 8080):

  ```yaml
  - name: CONTINUUM_CREDENTIALS_SERVER_BASE_URL
    value: "http://continuum-platform-credentials-server:8080"
  ```
- For the platform side (how credentials are stored and fetched), see [Credentials in the node model](../../architecture/node-model.md#credentials).

Test it by giving `ExecutionContext` a fake `CredentialFetcher`:

```kotlin
package com.acme.demo.node

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.projectcontinuum.core.commons.context.CredentialFetcher
import org.projectcontinuum.core.commons.context.ExecutionContext
import org.projectcontinuum.core.commons.utils.NodeOutputWriter

class ApiLookupNodeModelTest {
  @Test
  fun `reads the selected credential`() {
    val outputWriter = mock<NodeOutputWriter>()
    val portWriter = mock<NodeOutputWriter.OutputPortWriter>()
    whenever(outputWriter.createOutputPortWriter("output")).thenReturn(portWriter)
    val context = ExecutionContext(
      ownerId = "test-user",
      credentialFetcher = CredentialFetcher { name -> if (name == "my-key") mapOf("key" to "abc123") else null }
    )

    ApiLookupNodeModel().execute(mapOf("credential" to "my-key"), emptyMap(), outputWriter, mock(), context)

    val row = argumentCaptor<Map<String, Any>>()
    verify(portWriter).write(any(), row.capture())
    assertEquals(6, row.firstValue["key_length"])
  }
}
```

## Change a node's retry behaviour

By default a failing node is retried with the workflow's retry policy. To give one node its own policy, set `retryOptions` in its metadata:

```kotlin
override val metadata = ContinuumWorkflowModel.NodeData(
  id = this.javaClass.name,
  nodeModel = this.javaClass.name,
  title = "API Lookup",
  description = "Calls an API with a stored credential",
  retryOptions = ContinuumWorkflowModel.RetryOptionsConfig(maximumAttempts = 3, initialIntervalSeconds = 5),
  // … ports, properties and schemas as before
)
```

`RetryOptionsConfig` has five optional fields: `initialIntervalSeconds`, `backoffCoefficient`, `maximumIntervalSeconds`, `maximumAttempts` and `doNotRetry` (a list of exception type names that must never be retried). Leave a field out to keep the default. In Java, pass `null` for the `retryOptions` argument of `NodeData` to keep the workflow default, as the Word Counter does.

A `NodeRuntimeException` with `isRetriable = false` is never retried, whatever the policy says.

## Add a library

The Continuum plugins already give you Spring, Jackson 3, the test libraries and SLF4J. Add anything else to the feature module's own `build.gradle.kts`, not the worker's:

```kotlin
dependencies {
    implementation("org.apache.commons:commons-text:1.12.0")
}
```

The worker picks it up through `implementation(project(":features:<repo>"))`. Don't add Jackson 2 artifacts; they clash with the platform's Jackson 3.

## Log from a node

Use SLF4J. The plugins put it on the classpath, so no dependency is needed:

```kotlin
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger(WordCounterNodeModel::class.java)

// inside execute():
logger.info("Counted words in {} rows", rowNumber)
```

The template's `application.yaml` sets the root log level to `error` and your package to `debug`, so your `info` and `debug` lines show up in the worker's console while other libraries stay quiet. Don't log row contents or credentials.

## Debug a node

- **Run the worker from your IDE.** Start `App.kt` in the `worker` module with the debugger and set breakpoints in your node. The worker defaults match the local stack, so no extra configuration is needed.
- **Or attach to Gradle.** `./gradlew :worker:bootRun --debug-jvm` waits for a debugger on port 5005.
- **Run a workflow** in the Workbench to trigger the node. A breakpoint in `execute()` pauses it. Temporal may time the activity out if you stay paused for a long time, so step through quickly.
- Prefer a **unit test** when you can: it reproduces most logic bugs without Docker. Add a failing test, fix the code, keep the test.

Next: if something doesn't work, see [Troubleshooting](./troubleshooting.md).
