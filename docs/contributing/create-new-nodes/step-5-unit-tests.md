---
sidebar_position: 6
sidebar_label: "5. Unit tests"
title: "Step 5: Write unit tests"
---

# Step 5: Write unit tests

<Badges>
  <Badge color="purple">Step 5 of 9</Badge>
  <Badge color="green">56% through the guide</Badge>
</Badges>

`execute()` only depends on its arguments, so you can test it with Mockito mocks and no Spring context:

**`src/test/kotlin/org/projectcontinuum/feature/demo/node/WordCounterNodeModelTest.kt`**

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
  fun `counts words and preserves original columns`() {
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

The imports come from `org.junit.jupiter.api`, `org.mockito.kotlin`, `kotlin.test` and `tools.jackson.module.kotlin.jacksonObjectMapper`. The feature plugin already adds all of them as test dependencies.

These tests call `execute()` directly, so they skip the schema validation step. To test validation too, build a `ContinuumWorkflowModel.Node` and call `node.run(...)` instead.
