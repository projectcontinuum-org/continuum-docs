---
sidebar_position: 6
sidebar_label: "5. Test and run"
title: "Step 5: Test and run your node"
---

# Step 5: Test and run your node

<Badges>
  <Badge color="purple">Step 5 of 6</Badge>
  <Badge color="blue">About 10 minutes</Badge>
</Badges>

You ran the template unchanged in [Step 1](./step-1-clone-and-run.md). Now run it again with your changes.

## 1. Build and test

```bash
./gradlew build
```

This compiles every module, runs your unit tests, runs `validateContinuumNodeAnnotations` and builds the worker jar. To run one test class:

```bash
./gradlew :features:<repo>:test --tests "*WordCounterNodeModelTest"
```

:::note[The annotation check]
`validateContinuumNodeAnnotations` fails the build when a class extends `ProcessNodeModel` or `TriggerNodeModel` without `@ContinuumNode`. If you see it fail, that's the cause.
:::

## 2. Run the worker

Make sure the local stack from Step 1 is still up (`docker compose ps` in `docker/`), then:

```bash
./gradlew :worker:bootRun
```

## 3. Check the node was loaded

Ask the worker which nodes it serves:

```bash
curl http://localhost:8090/api/v1/node-repo
```

Your **Word Counter** should be in the response. If it isn't, the worker didn't find your node. The usual causes are, in order:

1. The `.imports` file names the wrong class, or `AutoConfigure`'s `basePackages` doesn't cover your package ([Step 3](./step-3-make-it-yours.md#2-the-feature-module)).
2. `worker/build.gradle.kts` doesn't list your module.
3. The class is missing `@ContinuumNode`.

## 4. Run it in the Workbench

1. Open [http://localhost:3002](http://localhost:3002). **Word Counter** appears under **Demo**.
2. Add a table source that has a `text` column, such as **Create Table**, and connect it to Word Counter.
3. Open the Word Counter settings to see the form you defined, then run the workflow.
4. Click the output port. Every row has a new `word_count` column.

You've now changed the template into your own working worker.

Next: [ship it](./step-6-ship-it.md).
