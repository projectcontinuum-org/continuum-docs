---
sidebar_position: 5
sidebar_label: "4. Write your node"
title: "Step 4: Write your node"
---

# Step 4: Write your node

<Badges>
  <Badge color="purple">Step 4 of 6</Badge>
  <Badge color="blue">About 30 minutes</Badge>
</Badges>

You don't start from a blank file. Rename the template's **Hello World** node and change what it does. The running example here is a **Word Counter** that counts the words in a text column and appends the count as a new column.

A node is three files that share a name. Do them in this order:

1. [The node class](#1-the-node-class)
2. [The help page](#2-the-help-page)
3. [The unit test](#3-the-unit-test)

## 1. The node class

Rename `HelloWorldNodeModel.kt` to `WordCounterNodeModel.kt` (and the class inside it). The file has six parts. Only the numbered ones need your changes:

```text
@ContinuumNode                      ← required, never remove
class WordCounterNodeModel(...) : ProcessNodeModel() {
   1. ports                         what goes in and out
   2. categories                    where it appears in the palette
   3. propertiesSchema              what settings exist, and what is valid
   4. propertiesUiSchema            how the settings form looks
   5. metadata                      name, description, icon, defaults
   6. execute()                     the logic
}
```

Here is the finished Word Counter, with the six parts marked:

```kotlin
package org.projectcontinuum.feature.demo.node

import org.projectcontinuum.core.commons.annotation.ContinuumNode
import org.projectcontinuum.core.commons.exception.NodeRuntimeException
import org.projectcontinuum.core.commons.model.ContinuumWorkflowModel
import org.projectcontinuum.core.commons.node.ProcessNodeModel
import org.projectcontinuum.core.commons.protocol.progress.NodeProgressCallback
import org.projectcontinuum.core.commons.utils.NodeInputReader
import org.projectcontinuum.core.commons.utils.NodeOutputWriter
import org.springframework.http.MediaType.APPLICATION_OCTET_STREAM_VALUE
import tools.jackson.core.type.TypeReference
import tools.jackson.databind.ObjectMapper

@ContinuumNode
class WordCounterNodeModel(
  private val objectMapper: ObjectMapper
) : ProcessNodeModel() {

  private val whitespace = Regex("\\s+")

  // 1. Ports. The map keys ("data") are the port IDs you use in execute().
  final override val inputPorts = mapOf(
    "data" to ContinuumWorkflowModel.NodePort(name = "Input Table", contentType = APPLICATION_OCTET_STREAM_VALUE)
  )
  final override val outputPorts = mapOf(
    "data" to ContinuumWorkflowModel.NodePort(name = "Table with word counts", contentType = APPLICATION_OCTET_STREAM_VALUE)
  )

  // 2. Palette category
  override val categories = listOf("Demo")

  // 3. JSON Schema: the settings and their rules
  private val propertiesSchema: Map<String, Any> = objectMapper.readValue(
    """
    {
      "type": "object",
      "properties": {
        "inputCol":      { "type": "string",  "title": "Input Column" },
        "outputCol":     { "type": "string",  "title": "Output Column" },
        "minWordLength": { "type": "integer", "title": "Minimum Word Length", "minimum": 1, "default": 1 }
      },
      "required": ["inputCol", "outputCol"]
    }
    """.trimIndent(),
    object : TypeReference<Map<String, Any>>() {}
  )

  // 4. JSON Forms UI schema: the layout of the settings form
  private val propertiesUiSchema: Map<String, Any> = objectMapper.readValue(
    """
    {
      "type": "VerticalLayout",
      "elements": [
        { "type": "Control", "scope": "#/properties/inputCol" },
        { "type": "Control", "scope": "#/properties/outputCol" },
        { "type": "Control", "scope": "#/properties/minWordLength" }
      ]
    }
    """.trimIndent(),
    object : TypeReference<Map<String, Any>>() {}
  )

  // 5. Metadata: what the Workbench and the registry see
  override val metadata = ContinuumWorkflowModel.NodeData(
    id = this.javaClass.name,
    nodeModel = this.javaClass.name,
    title = "Word Counter",
    subTitle = "Count words per row",
    description = "Counts the words in a text column and appends the count as a new column",
    icon = """<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h6M18 14v6m-3-3h6"/></svg>""",
    inputs = inputPorts,
    outputs = outputPorts,
    properties = mapOf("inputCol" to "text", "outputCol" to "word_count", "minWordLength" to 1),
    propertiesSchema = propertiesSchema,
    propertiesUISchema = propertiesUiSchema
  )

  // 6. The logic
  override fun execute(
    properties: Map<String, Any>?,
    inputs: Map<String, NodeInputReader>,
    nodeOutputWriter: NodeOutputWriter,
    nodeProgressCallback: NodeProgressCallback
  ) {
    val inputCol = properties?.get("inputCol") as String?
      ?: throw NodeRuntimeException(isRetriable = false, workflowId = "", nodeId = "", message = "inputCol is not provided")
    val outputCol = properties["outputCol"] as String?
      ?: throw NodeRuntimeException(isRetriable = false, workflowId = "", nodeId = "", message = "outputCol is not provided")
    val minWordLength = (properties["minWordLength"] as Number?)?.toInt() ?: 1

    val reader = inputs["data"] ?: throw NodeRuntimeException(
      isRetriable = false, workflowId = "", nodeId = "", message = "Input port 'data' is not connected"
    )
    val totalRows = reader.getRowCount()

    nodeOutputWriter.createOutputPortWriter("data").use { writer ->
      reader.use {
        var rowNumber = 0L
        while (true) {
          val row = reader.read() ?: break
          val text = row[inputCol]?.toString() ?: ""
          val count = text.trim().split(whitespace).count { it.length >= minWordLength }

          writer.write(rowNumber, row.toMutableMap().apply { this[outputCol] = count })
          rowNumber++
          if (totalRows > 0) nodeProgressCallback.report((rowNumber * 100 / totalRows).toInt())
        }
      }
    }
  }
}
```

### Rules the platform enforces

Break one of these and the build fails, the node doesn't load, or workflows break later.

| Rule | Why |
|------|-----|
| Annotate with `@ContinuumNode`, not `@Component`. | It makes the bean prototype-scoped, so each run gets a fresh instance. The build fails without it (`validateContinuumNodeAnnotations`). |
| Extend `ProcessNodeModel` (has inputs) or `TriggerNodeModel` (source node, outputs only). | `TriggerNodeModel.execute()` has no `inputs` parameter. |
| Set `metadata.id` and `metadata.nodeModel` to `this.javaClass.name`. | The full class name is the node's identity in saved workflows. **Renaming or moving the class later breaks workflows that use it.** |
| Put the class in a package that ends in `.node`. | The platform removes that last segment to get the feature ID. |
| Import Jackson from `tools.jackson.*`. | The platform uses Jackson 3. `com.fasterxml.jackson.*` (Jackson 2) won't compile. |
| Take `ObjectMapper` as a constructor parameter. | Spring injects it. In unit tests, pass `jacksonObjectMapper()`. |

### Ports

`inputPorts` and `outputPorts` are maps:

- The **key** (for example `"data"`) is the port ID you use in `execute()` to read or write data.
- The **value** is a `ContinuumWorkflowModel.NodePort` with a `name` (shown in the Workbench) and a `contentType`.

Table ports use `APPLICATION_OCTET_STREAM_VALUE`, as in the running example. The template's example nodes do the same.

### Settings and validation

- `properties` in the metadata holds the **default values** used when a user drops the node on the canvas.
- Before `execute()` runs, the platform checks the user's settings against `propertiesSchema`. Values that break `required`, `type` or `minimum` fail the node before your code starts. Checking again in `execute()` is still worthwhile because it lets you give a clearer error message.
- `propertiesUiSchema` is a [JSON Forms](https://jsonforms.io/) layout, used only to draw the form. For credential pickers, see [Credentials](../../architecture/node-model.md#credentials). You can try schemas in the [JSON Forms playground](https://github.com/projectcontinuum-org/continuum-jsonform-playground) first.

### Reading and writing rows

- `inputs["data"]` is a `NodeInputReader`. `read()` returns the next row as a `Map<String, Any>`, or `null` at the end. If a port isn't connected, its key is missing from `inputs`.
- `createOutputPortWriter("data")` returns a writer. `write(rowNumber, row)` takes a `Long` row number that **starts at 0**.
- Wrap both in `.use { }`. The output file is only complete once the writer is closed.

Cell values must be one of these types, and never `null`. Anything else makes `write()` throw `IllegalArgumentException: Unsupported type`. Leave a key out instead of storing `null`.

| Kotlin type | Stored as |
|-------------|-----------|
| `String` | `application/vnd.continuum.x-string` |
| `Int`, `Long` | `application/vnd.continuum.x-int`, `x-long` |
| `Float`, `Double` | `application/vnd.continuum.x-float`, `x-double` |
| `Boolean` | `application/vnd.continuum.x-boolean` |
| `List<*>`, `Map<*, *>` | `application/json` |
| SVG `org.w3c.dom.Document` | `image/svg+xml` |

Convert anything else first. For example, call `toString()` on a `LocalDate`, and convert a `BigDecimal` to a `Double` or a `String`.

### Errors, retries and progress

Every node runs as a Temporal activity, so an exception thrown from `execute()` is **retried** by default (with exponential backoff). Throw `NodeRuntimeException(isRetriable = false, ...)` for errors a retry can't fix, such as:
- Missing or invalid settings (user error)
- An unconnected input port
- Invalid input data that can't be recovered from

Empty strings are fine for `workflowId` and `nodeId` in the exception.

Call `nodeProgressCallback.report(percent)` (0 to 100) as you go. The Workbench shows it as live progress on the node.

## 2. The help page

Rename `HelloWorldNodeModel.doc.md` to `WordCounterNodeModel.doc.md` and rewrite it. The Workbench shows this file next to the node.

The path must match the node's package and class name exactly. For the class `org.projectcontinuum.feature.demo.node.WordCounterNodeModel`, the file is:

```text
src/main/resources/org/projectcontinuum/feature/demo/node/WordCounterNodeModel.doc.md
```

To build the path, take the class's full name, replace each `.` with `/` and add `.doc.md`. The `node` folder is part of the package, not an extra segment.

If the file is missing or misplaced, the node still works, but its help page reads *"Documentation not found for WordCounterNodeModel"*, and the build doesn't warn you.

A good help page has four parts, as in the template's Hello World page: what the node does, a **Configuration** table, a **Ports** table, and a small **Example** with input and output tables.

## 3. The unit test

Rename `HelloWorldNodeModelTest.kt` to `WordCounterNodeModelTest.kt`. Nodes are plain classes, so you can test `execute()` with Mockito mocks. No Spring, Kafka or Docker is needed.

```kotlin
class WordCounterNodeModelTest {
  private val outputWriter = mock<NodeOutputWriter>()
  private val portWriter = mock<NodeOutputWriter.OutputPortWriter>()
  private val node = WordCounterNodeModel(jacksonObjectMapper())

  @BeforeEach
  fun setUp() {
    whenever(outputWriter.createOutputPortWriter("data")).thenReturn(portWriter)
  }

  @Test
  fun `counts words and keeps original columns`() {
    val reader = mockReader(listOf(mapOf("id" to 1, "text" to "the quick brown fox")))

    node.execute(mapOf("inputCol" to "text", "outputCol" to "word_count"), mapOf("data" to reader), outputWriter, mock())

    val rows = argumentCaptor<Map<String, Any>>()
    verify(portWriter).write(any(), rows.capture())
    assertEquals(4, rows.firstValue["word_count"])
    assertEquals(1, rows.firstValue["id"])
  }

  private fun mockReader(rows: List<Map<String, Any>>): NodeInputReader {
    val iterator = rows.iterator()
    return mock<NodeInputReader>().also { r ->
      whenever(r.read()).thenAnswer { if (iterator.hasNext()) iterator.next() else null }
      whenever(r.getRowCount()).thenReturn(rows.size.toLong())
    }
  }
}
```

The template's `HelloWorldNodeModelTest` has more cases to copy, including metadata checks and progress reporting.

:::note
These tests call `execute()` directly, so they skip the schema validation. To test validation as well, build a `ContinuumWorkflowModel.Node` and call `node.run(...)` instead.
:::

Next: [test and run your node](./step-5-test-and-run.md).
