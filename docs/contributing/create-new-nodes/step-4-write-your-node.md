---
sidebar_position: 5
sidebar_label: "4. Write your node"
title: "Step 4: Write your node"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Step 4: Write your node

<Badges>
  <Badge color="purple">Step 4 of 6</Badge>
  <Badge color="blue">About 30 minutes</Badge>
</Badges>

You don't start from a blank file. Take the template's **Hello World** node (or **Hello Java**) and **rewrite it** into your own: rename the files and the class, then replace the ports, settings and logic. The running example here is a **Word Counter** that counts the words in a text column and appends the count as a new column.

Every code sample on this page was compiled and its tests were run against platform `0.0.20`. Pick your language in the tabs; the choice sticks across the page.

A node is three files that share a name. Do them in this order:

1. [The node class](#1-the-node-class)
2. [The help page](#2-the-help-page)
3. [The unit test](#3-the-unit-test)

Once those work, [More node recipes](./recipes.md) shows how to add a second node, write a source node, use credentials and more.

## 1. The node class

Rename `HelloWorldNodeModel.kt` (Java: `HelloJavaNodeModel.java`) to `WordCounterNodeModel.kt` (or `.java`) and the class inside it, then replace the contents. The class has six parts:

```text
@ContinuumNode                      ← required, never remove
class WordCounterNodeModel : ProcessNodeModel() {
   1. ports                         what goes in and out
   2. categories                    where it appears in the palette
   3. propertiesSchema              what settings exist, and what is valid
   4. propertiesUiSchema            how the settings form looks
   5. metadata                      name, description, icon, defaults
   6. execute()                     the logic
}
```

Here is the finished Word Counter, with the six parts marked. It lives in the package `<package>.node`, which is `com.acme.demo.node` in this example:

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
package com.acme.demo.node

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

  // 1. Ports. The map keys ("input", "output") are the port IDs you use in execute().
  final override val inputPorts = mapOf(
    "input" to ContinuumWorkflowModel.NodePort(name = "Input Table", contentType = APPLICATION_OCTET_STREAM_VALUE)
  )
  final override val outputPorts = mapOf(
    "output" to ContinuumWorkflowModel.NodePort(name = "Table with word counts", contentType = APPLICATION_OCTET_STREAM_VALUE)
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

    val reader = inputs["input"] ?: throw NodeRuntimeException(
      isRetriable = false, workflowId = "", nodeId = "", message = "Input port 'input' is not connected"
    )
    val totalRows = reader.getRowCount()

    nodeOutputWriter.createOutputPortWriter("output").use { writer ->
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

</TabItem>
<TabItem value="java" label="Java">

```java
package com.acme.demo.node;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.projectcontinuum.core.commons.annotation.ContinuumNode;
import org.projectcontinuum.core.commons.exception.NodeRuntimeException;
import org.projectcontinuum.core.commons.model.ContinuumWorkflowModel;
import org.projectcontinuum.core.commons.node.ProcessNodeModel;
import org.projectcontinuum.core.commons.protocol.progress.NodeProgressCallback;
import org.projectcontinuum.core.commons.utils.NodeInputReader;
import org.projectcontinuum.core.commons.utils.NodeOutputWriter;
import org.springframework.http.MediaType;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ContinuumNode
public class WordCounterNodeModel extends ProcessNodeModel {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    // 1. Ports. The map keys ("input", "output") are the port IDs you use in execute().
    private final Map<String, ContinuumWorkflowModel.NodePort> inputPorts = Map.of(
            "input", new ContinuumWorkflowModel.NodePort("Input Table", MediaType.APPLICATION_OCTET_STREAM_VALUE));
    private final Map<String, ContinuumWorkflowModel.NodePort> outputPorts = Map.of(
            "output", new ContinuumWorkflowModel.NodePort("Table with word counts", MediaType.APPLICATION_OCTET_STREAM_VALUE));

    @NotNull @Override public Map<String, ContinuumWorkflowModel.NodePort> getInputPorts() { return inputPorts; }
    @NotNull @Override public Map<String, ContinuumWorkflowModel.NodePort> getOutputPorts() { return outputPorts; }

    // 2. Palette category
    @NotNull @Override public List<String> getCategories() { return List.of("Demo"); }

    // 3. JSON Schema: the settings and their rules
    private static final Map<String, Object> PROPERTIES_SCHEMA = MAPPER.readValue("""
            {
              "type": "object",
              "properties": {
                "inputCol":      { "type": "string",  "title": "Input Column" },
                "outputCol":     { "type": "string",  "title": "Output Column" },
                "minWordLength": { "type": "integer", "title": "Minimum Word Length", "minimum": 1, "default": 1 }
              },
              "required": ["inputCol", "outputCol"]
            }
            """, MAP_TYPE);

    // 4. JSON Forms UI schema: the layout of the settings form
    private static final Map<String, Object> PROPERTIES_UI_SCHEMA = MAPPER.readValue("""
            {
              "type": "VerticalLayout",
              "elements": [
                { "type": "Control", "scope": "#/properties/inputCol" },
                { "type": "Control", "scope": "#/properties/outputCol" },
                { "type": "Control", "scope": "#/properties/minWordLength" }
              ]
            }
            """, MAP_TYPE);

    // 5. Metadata. Java has no default arguments, so pass all 15 parameters in order.
    private final ContinuumWorkflowModel.NodeData metadata = new ContinuumWorkflowModel.NodeData(
            getClass().getName(),                 // id
            "Counts the words in a text column and appends the count as a new column", // description
            "Word Counter",                       // title
            "Count words per row",                // subTitle
            null,                                 // icon (SVG string, or null)
            getClass().getName(),                 // nodeModel
            null,                                 // busy
            inputPorts,                           // inputs
            outputPorts,                          // outputs
            Map.of("inputCol", "text", "outputCol", "word_count", "minWordLength", 1), // default settings
            PROPERTIES_SCHEMA,                    // propertiesSchema
            PROPERTIES_UI_SCHEMA,                 // propertiesUISchema
            null,                                 // status
            null,                                 // nodeProgress
            null                                  // retryOptions (null = workflow default)
    );

    @NotNull @Override public ContinuumWorkflowModel.NodeData getMetadata() { return metadata; }

    // 6. The logic
    @Override
    public void execute(
            @Nullable Map<String, ? extends Object> properties,
            @NotNull Map<String, NodeInputReader> inputs,
            @NotNull NodeOutputWriter nodeOutputWriter,
            @NotNull NodeProgressCallback nodeProgressCallback
    ) {
        String inputCol = requireString(properties, "inputCol");
        String outputCol = requireString(properties, "outputCol");
        Object min = properties.get("minWordLength");
        int minWordLength = (min instanceof Number n) ? n.intValue() : 1;

        NodeInputReader reader = inputs.get("input");
        if (reader == null) {
            throw new NodeRuntimeException(false, "", "", "Input port 'input' is not connected");
        }
        long totalRows = reader.getRowCount();
        long rowNumber = 0;

        NodeOutputWriter.OutputPortWriter writer = nodeOutputWriter.createOutputPortWriter("output");
        try {
            Map<String, Object> row;
            while ((row = reader.read()) != null) {
                Object cell = row.get(inputCol);
                String text = cell == null ? "" : cell.toString().trim();
                int count = 0;
                if (!text.isEmpty()) {
                    for (String word : text.split("\\s+")) {
                        if (word.length() >= minWordLength) count++;
                    }
                }
                Map<String, Object> out = new HashMap<>(row);
                out.put(outputCol, count);
                writer.write(rowNumber, out);
                rowNumber++;
                if (totalRows > 0) nodeProgressCallback.report((int) (rowNumber * 100 / totalRows));
            }
        } finally {
            writer.close();
            reader.close();
        }
    }

    private static String requireString(Map<String, ?> properties, String key) {
        Object value = properties == null ? null : properties.get(key);
        if (!(value instanceof String s)) {
            throw new NodeRuntimeException(false, "", "", key + " is not provided");
        }
        return s;
    }
}
```

In Java the three overrides `getInputPorts()`, `getOutputPorts()` and `getCategories()` replace Kotlin's `override val` properties, and the `@NotNull` / `@Nullable` annotations match the Kotlin signatures. The 15 arguments to `NodeData` are in the order shown by the comments.

</TabItem>
</Tabs>

### Rules the platform enforces

Break one of these and the build fails, the node doesn't load, or workflows break later.

| Rule | Why |
|------|-----|
| Annotate with `@ContinuumNode`, not `@Component`. | It makes the bean prototype-scoped, so each run gets a fresh instance. The build fails without it (`validateContinuumNodeAnnotations`). |
| Extend `ProcessNodeModel` (has inputs) or `TriggerNodeModel` (source node, outputs only). | `TriggerNodeModel.execute()` has no `inputs` parameter. See [a source node](./recipes.md#a-source-node-with-no-inputs). |
| Set `metadata.id` and `metadata.nodeModel` to the class's full name (`this.javaClass.name` / `getClass().getName()`). | The full class name is the node's identity in saved workflows. **Renaming or moving the class later breaks workflows that use it.** |
| Put the class in a package that ends in `.node`. | By convention. The platform removes that last segment to get the feature ID (`com.acme.demo.node` → `com.acme.demo`). Without it, the whole package name becomes the feature ID, and the node still loads. |
| Import Jackson from `tools.jackson.*`. | The platform uses Jackson 3. `com.fasterxml.jackson.*` (Jackson 2) won't compile. |

Two notes on `ObjectMapper`:

- In Kotlin you can take it as a constructor parameter and Spring injects it. In unit tests, pass `jacksonObjectMapper()`.
- In Java, the example creates a `static` mapper, which works because the schemas are built once when the class loads. You can also take an `ObjectMapper` in a constructor, as in Kotlin.

If you'd rather not parse JSON strings at all, you can write the schemas as nested `mapOf(...)` / `Map.of(...)` values. The [source node](./recipes.md#a-source-node-with-no-inputs) recipe does that.

### Ports

`inputPorts` and `outputPorts` are maps:

- The **key** (here `"input"` and `"output"`) is the port ID you use in `execute()` to read or write data. The template's Hello World node uses the same two IDs, so the rest of the platform's examples look familiar.
- The **value** is a `ContinuumWorkflowModel.NodePort` with a `name` (shown in the Workbench) and a `contentType`.

Table ports use `APPLICATION_OCTET_STREAM_VALUE`, as in the running example. The template's example nodes do the same.

A node can have **several ports**. Add more entries to the map, give each a different key, and use those keys in `inputs["…"]` and `createOutputPortWriter("…")`. A node with two inputs (for example `"left"` and `"right"`) gets both readers in the `inputs` map; check each key you need, because a port that isn't connected is missing from the map.

### Settings and validation

- `properties` in the metadata holds the **default values** used when a user drops the node on the canvas.
- Before `execute()` runs, the platform checks the user's settings against `propertiesSchema`. Values that break `required`, `type` or `minimum` fail the node before your code starts. Checking again in `execute()` is still worthwhile because it lets you give a clearer error message.
- `propertiesUiSchema` is a [JSON Forms](https://jsonforms.io/) layout, used only to draw the form. For credential pickers, see [Credentials](./recipes.md#use-a-credential). You can try schemas in the [JSON Forms playground](https://github.com/projectcontinuum-org/continuum-jsonform-playground) first.

### Reading and writing rows

- `inputs["input"]` is a `NodeInputReader`. `read()` returns the next row as a `Map<String, Any>`, or `null` at the end. If a port isn't connected, its key is missing from `inputs`.
- `createOutputPortWriter("output")` returns a writer. `write(rowNumber, row)` takes a `Long` row number that **starts at 0**.
- Close both when you are done: Kotlin's `.use { }` or Java's `try { … } finally { … }`. The output file is only complete once the writer is closed.

Cell values must be one of these types, and never `null`. Anything else makes `write()` throw `IllegalArgumentException: Unsupported type`. Leave a key out instead of storing `null`.

| Kotlin / Java type | Stored as |
|--------------------|-----------|
| `String` | `application/vnd.continuum.x-string` |
| `Int`, `Long` | `application/vnd.continuum.x-int`, `x-long` |
| `Float`, `Double` | `application/vnd.continuum.x-float`, `x-double` |
| `Boolean` | `application/vnd.continuum.x-boolean` |
| `List<*>`, `Map<*, *>` | `application/json` |
| SVG `org.w3c.dom.Document` | `image/svg+xml` |

Convert anything else first. For example, call `toString()` on a `LocalDate`, and convert a `BigDecimal` to a `Double` or a `String`.

### Errors, retries and progress

Every node runs as a Temporal activity, so an exception thrown from `execute()` is **retried** by default (with exponential backoff). Throw `NodeRuntimeException(isRetriable = false, ...)` (Java: `new NodeRuntimeException(false, "", "", message)`) for errors a retry can't fix, such as:
- Missing or invalid settings (user error)
- An unconnected input port
- Invalid input data that can't be recovered from

Empty strings are fine for `workflowId` and `nodeId` in the exception.

To change the retry behaviour of one node, see [per-node retry options](./recipes.md#change-a-nodes-retry-behaviour).

Call `nodeProgressCallback.report(percent)` (0 to 100) as you go. The Workbench shows it as live progress on the node.

## 2. The help page

Rename `HelloWorldNodeModel.doc.md` (Java: `HelloJavaNodeModel.doc.md`) to `WordCounterNodeModel.doc.md` and rewrite it. The Workbench shows this file next to the node.

The path must match the node's package and class name exactly. For the class `com.acme.demo.node.WordCounterNodeModel`, the file is:

```text
src/main/resources/com/acme/demo/node/WordCounterNodeModel.doc.md
```

To build the path, take the class's full name, replace each `.` with `/` and add `.doc.md`. The `node` folder is part of the package, not an extra segment.

If the file is missing or misplaced, the node still works, but its help page reads *"Documentation not found for WordCounterNodeModel"*, and the build doesn't warn you.

A good help page has four parts, as in the template's Hello World page: what the node does, a **Configuration** table, a **Ports** table, and a small **Example** with input and output tables.

## 3. The unit test

Rename `HelloWorldNodeModelTest.kt` (Java: `HelloJavaNodeModelTest.java`) to `WordCounterNodeModelTest.kt` (or `.java`). Nodes are plain classes, so you can test `execute()` with Mockito mocks. No Spring, Kafka or Docker is needed.

<Tabs groupId="language">
<TabItem value="kotlin" label="Kotlin" default>

```kotlin
package com.acme.demo.node

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.projectcontinuum.core.commons.exception.NodeRuntimeException
import org.projectcontinuum.core.commons.utils.NodeInputReader
import org.projectcontinuum.core.commons.utils.NodeOutputWriter
import tools.jackson.module.kotlin.jacksonObjectMapper

class WordCounterNodeModelTest {
  private val outputWriter = mock<NodeOutputWriter>()
  private val portWriter = mock<NodeOutputWriter.OutputPortWriter>()
  private val node = WordCounterNodeModel(jacksonObjectMapper())

  @BeforeEach
  fun setUp() {
    whenever(outputWriter.createOutputPortWriter("output")).thenReturn(portWriter)
  }

  @Test
  fun `counts words and keeps original columns`() {
    val reader = mockReader(listOf(mapOf("id" to 1, "text" to "the quick brown fox")))

    node.execute(mapOf("inputCol" to "text", "outputCol" to "word_count"), mapOf("input" to reader), outputWriter, mock())

    val rows = argumentCaptor<Map<String, Any>>()
    verify(portWriter).write(any(), rows.capture())
    assertEquals(4, rows.firstValue["word_count"])
    assertEquals(1, rows.firstValue["id"])
  }

  @Test
  fun `ignores words shorter than the minimum length`() {
    val reader = mockReader(listOf(mapOf("text" to "a quick brown fox")))

    node.execute(
      mapOf("inputCol" to "text", "outputCol" to "word_count", "minWordLength" to 4),
      mapOf("input" to reader), outputWriter, mock()
    )

    val rows = argumentCaptor<Map<String, Any>>()
    verify(portWriter).write(any(), rows.capture())
    assertEquals(2, rows.firstValue["word_count"])
  }

  @Test
  fun `fails without retry when the input port is not connected`() {
    val error = assertThrows(NodeRuntimeException::class.java) {
      node.execute(mapOf("inputCol" to "text", "outputCol" to "word_count"), emptyMap(), outputWriter, mock())
    }
    assertEquals(false, error.isRetriable)
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

</TabItem>
<TabItem value="java" label="Java">

```java
package com.acme.demo.node;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.projectcontinuum.core.commons.protocol.progress.NodeProgressCallback;
import org.projectcontinuum.core.commons.utils.NodeInputReader;
import org.projectcontinuum.core.commons.utils.NodeOutputWriter;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

class WordCounterNodeModelTest {

    private final NodeOutputWriter outputWriter = mock(NodeOutputWriter.class);
    private final NodeOutputWriter.OutputPortWriter portWriter = mock(NodeOutputWriter.OutputPortWriter.class);
    private final WordCounterNodeModel node = new WordCounterNodeModel();

    @BeforeEach
    void setUp() {
        when(outputWriter.createOutputPortWriter("output")).thenReturn(portWriter);
    }

    @Test
    @SuppressWarnings("unchecked")
    void countsWordsAndKeepsOriginalColumns() {
        NodeInputReader reader = mockReader(List.of(Map.of("id", 1, "text", "the quick brown fox")));

        node.execute(
                Map.of("inputCol", "text", "outputCol", "word_count"),
                Map.of("input", reader), outputWriter, mock(NodeProgressCallback.class));

        ArgumentCaptor<Map<String, Object>> row = ArgumentCaptor.forClass(Map.class);
        verify(portWriter).write(anyLong(), row.capture());
        assertEquals(4, row.getValue().get("word_count"));
        assertEquals(1, row.getValue().get("id"));
    }

    private NodeInputReader mockReader(List<Map<String, Object>> rows) {
        var iterator = rows.iterator();
        NodeInputReader reader = mock(NodeInputReader.class);
        when(reader.read()).thenAnswer(i -> iterator.hasNext() ? iterator.next() : null);
        when(reader.getRowCount()).thenReturn((long) rows.size());
        return reader;
    }
}
```

</TabItem>
</Tabs>

The template's Hello World test has more cases to copy, including metadata checks and progress reporting.

:::note
These tests call `execute()` directly, so they skip the schema validation. To test validation as well, build a `ContinuumWorkflowModel.Node` and call `node.run(...)` instead.
:::

Next: [test and run your node](./step-5-test-and-run.md).
