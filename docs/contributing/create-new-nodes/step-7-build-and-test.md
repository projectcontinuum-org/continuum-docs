---
sidebar_position: 8
sidebar_label: "7. Build and test"
title: "Step 7: Build and test"
---

# Step 7: Build and test

<Badges>
  <Badge color="purple">Step 7 of 9</Badge>
  <Badge color="green">78% through the guide</Badge>
</Badges>

```bash
./gradlew build
```

This compiles every module, runs `validateContinuumNodeAnnotations`, runs the unit tests and builds `worker/build/libs/worker-<version>.jar`.

To check that the annotation guard works, swap `@ContinuumNode` for `@Component` and run `./gradlew classes`. The build fails with:

```text
> Task :features:continuum-feature-demo:validateContinuumNodeAnnotations FAILED
  Continuum Node Annotation Validation Failed
  The following classes implement ContinuumNodeModel but are missing the @ContinuumNode annotation:
```
