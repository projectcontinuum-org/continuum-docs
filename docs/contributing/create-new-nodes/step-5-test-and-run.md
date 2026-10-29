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

The worker logs every node it found when it starts. Look for these two lines in the `bootRun` output:

```text
Registered process nodes: [com.acme.demo.node.WordCounterNodeModel]
Registered trigger nodes: []
```

Your node's full class name should be in the list. You can also ask the worker over HTTP:

```bash
curl http://localhost:8090/api/v1/node-repo
```

Your **Word Counter** should be in the response.

If it isn't, the build passed but the worker didn't find your node. Work through the [checklist in Troubleshooting](./troubleshooting.md#my-node-doesnt-show-up-in-the-workbench). Most often, one of these is wrong: the module isn't listed in `worker/build.gradle.kts`, the `.imports` file names the wrong class or `@ComponentScan` doesn't cover your package. (A missing `@ContinuumNode` is rarely the cause, because the build catches it.)

## 4. Run it in the Workbench

1. Open [http://localhost:3002](http://localhost:3002). **Word Counter** appears under **Demo**.
2. Add a table source that has a `text` column, such as **Create Table**, and connect it to Word Counter.
3. Open the Word Counter settings to see the form you defined, then run the workflow.
4. Click the output port. Every row has a new `word_count` column.
5. Open the node's help page in the Workbench. It should show your `.doc.md` content. If it reads "Documentation not found", see [Step 4](./step-4-write-your-node.md#2-the-help-page).

Locally you don't need to set any environment variables: the worker's defaults match the local stack. When you deploy elsewhere, see the [worker configuration reference](./step-6-ship-it.md#worker-configuration-reference).

You've now changed the template into your own working worker.

Next: [ship it](./step-6-ship-it.md).
