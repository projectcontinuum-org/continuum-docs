---
sidebar_position: 4
sidebar_label: "3. Write the node"
title: "Step 3: Write the node"
---

# Step 3: Write the node

<Badges>
  <Badge color="purple">Step 3 of 9</Badge>
  <Badge color="green">33% through the guide</Badge>
</Badges>

Put node classes in a `.node` subpackage. The platform derives your **feature ID** by removing the trailing `.node` segment from the class name. For example, `org.projectcontinuum.feature.demo.node.WordCounterNodeModel` gets the feature ID `org.projectcontinuum.feature.demo`.

**`src/main/kotlin/org/projectcontinuum/feature/demo/node/WordCounterNodeModel.kt`**

```kotlin
package org.projectcontinuum.feature.demo.node

import org.projectcontinuum.core.commons.annotation.ContinuumNode
import org.projectcontinuum.core.commons.exception.NodeRuntimeException
import org.projectcontinuum.core.commons.model.ContinuumWorkflowModel
import org.projectcontinuum.core.commons.node.ProcessNodeModel
import org.projectcontinuum.core.commons.protocol.progress.NodeProgressCallback
import org.projectcontinuum.core.commons.utils.NodeInputReader
import org.projectcontinuum.core.commons.utils.NodeOutputWriter
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType.TEXT_PLAIN_VALUE
import tools.jackson.core.type.TypeReference
import tools.jackson.databind.ObjectMapper

@ContinuumNode
class WordCounterNodeModel(
  private val objectMapper: ObjectMapper
) : ProcessNodeModel() {
  companion object {
    private val LOGGER = LoggerFactory.getLogger(WordCounterNodeModel::class.java)
    private val WHITESPACE = Regex("\\s+")
  }

  // 1. Ports: the map keys ("data") are the port IDs used in execute()
  final override val inputPorts = mapOf(
    "data" to ContinuumWorkflowModel.NodePort(name = "input table", contentType = TEXT_PLAIN_VALUE)
  )
  final override val outputPorts = mapOf(
    "data" to ContinuumWorkflowModel.NodePort(name = "table with word counts", contentType = TEXT_PLAIN_VALUE)
  )

  // 2. Where the node appears in the workbench node explorer
  override val categories = listOf("Demo")

  // 3. JSON Schema for the node's properties
  val propertiesSchema: Map<String, Any> = objectMapper.readValue(
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

  // 4. JSON Forms UI schema: layout of the configuration dialog
  val propertiesUiSchema: Map<String, Any> = objectMapper.readValue(
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

  // 5. Metadata: what the workbench and registry see
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

  // 6. The node's logic
  override fun execute(
    properties: Map<String, Any>?,
    inputs: Map<String, NodeInputReader>,
    nodeOutputWriter: NodeOutputWriter,
    nodeProgressCallback: NodeProgressCallback
  ) {
    val inputCol = properties?.get("inputCol") as String?
      ?: throw NodeRuntimeException(workflowId = "", nodeId = "", message = "inputCol is not provided")
    val outputCol = properties["outputCol"] as String?
      ?: throw NodeRuntimeException(workflowId = "", nodeId = "", message = "outputCol is not provided")
    val minWordLength = (properties["minWordLength"] as Number?)?.toInt() ?: 1

    val reader = inputs["data"] ?: throw NodeRuntimeException(
      isRetriable = false, workflowId = "", nodeId = "", message = "Input port 'data' is not connected"
    )
    val totalRows = reader.getRowCount()

    nodeOutputWriter.createOutputPortWriter("data").use { writer ->
      reader.use {
        var row = reader.read()
        var rowNumber = 0L
        while (row != null) {
          val text = row[inputCol]?.toString() ?: ""
          val count = text.trim().split(WHITESPACE).count { it.length >= minWordLength }

          writer.write(rowNumber, row.toMutableMap().apply { this[outputCol] = count })
          rowNumber++
          if (totalRows > 0) nodeProgressCallback.report((rowNumber * 100 / totalRows).toInt())
          row = reader.read()
        }
        LOGGER.info("Counted words in $rowNumber rows")
      }
    }
  }
}
```

## The node contract

| Rule | Why |
|------|-----|
| Annotate with `@ContinuumNode`, not `@Component`. | `@ContinuumNode` makes the bean prototype-scoped, so each execution gets a fresh instance. The build fails if a node class is missing it (see [Step 7](./step-7-build-and-test.md)). |
| Extend `ProcessNodeModel` for nodes with inputs, or `TriggerNodeModel` for source nodes. | `TriggerNodeModel` has only `outputPorts` and `execute(properties, nodeOutputWriter)`. |
| Set `metadata.id` and `metadata.nodeModel` to `this.javaClass.name`. | The fully qualified class name is the node's identity in the registry and in saved workflows. Renaming or moving the class breaks existing workflows that use it. |
| Use Jackson 3 imports (`tools.jackson.*`). | Platform `0.0.20` is on Spring Boot 4 / Jackson 3. `com.fasterxml.jackson.databind` isn't on the classpath and won't compile. |
| Take `ObjectMapper` as a constructor parameter. | Spring injects it. In unit tests, pass `jacksonObjectMapper()`. |

## Properties and validation

- `metadata.properties` holds the default values used when a node is dropped onto the canvas.
- Before `execute()` is called, `ProcessNodeModel.run()` **validates the configured properties against `propertiesSchema`**. Values that break `required`, `type`, `minimum` and similar rules fail the node before your code runs. You can still check values in `execute()` for clearer error messages.
- `propertiesUISchema` is a [JSON Forms](https://jsonforms.io/) UI schema, used only by the workbench to draw the configuration dialog. For credential pickers (`options.format = "credential"`), see [Credentials](../../architecture/node-model.md#credentials). You can try schemas in the [JSON Forms playground](https://github.com/projectcontinuum-org/continuum-jsonform-playground) before wiring them into a node.

## Reading and writing rows

- `inputs[portId]` is a `NodeInputReader`. `read()` returns the next row as `Map<String, Any>`, or `null` at the end of the table. `getRowCount()` returns the total number of rows.
- `nodeOutputWriter.createOutputPortWriter(portId)` returns a writer. `write(rowNumber, row)` takes a `Long` row index starting at `0`.
- Wrap both reader and writer in `.use { }`. The output Parquet file is only complete once the writer is closed.
- If an input port isn't connected, its key is missing from `inputs`.

Cell values must be one of these types. Any other type makes `write()` throw `IllegalArgumentException: Unsupported type`.

| Kotlin type | Stored as |
|-------------|-----------|
| `String` | `application/vnd.continuum.x-string` |
| `Int`, `Long` | `application/vnd.continuum.x-int`, `x-long` |
| `Float`, `Double` | `application/vnd.continuum.x-float`, `x-double` |
| `Boolean` | `application/vnd.continuum.x-boolean` |
| `List<*>`, `Map<*, *>` | `application/json` |
| SVG `org.w3c.dom.Document` | `image/svg+xml` |

Convert anything else first, for example call `toString()` on a `LocalDate` or `BigDecimal`. A `null` value can't be stored either: leave the key out instead.

## Errors and retries

Every node runs as a Temporal activity, so an exception thrown from `execute()` is **retried** by default. Throw `NodeRuntimeException(isRetriable = false, ...)` for errors that a retry won't fix, such as missing configuration or a disconnected port. You can pass empty strings for `workflowId` and `nodeId`. The existing nodes do the same.

## Progress

Call `nodeProgressCallback.report(percent)` with a value from 0 to 100 as you go. The workbench uses it to show live progress on the node.
