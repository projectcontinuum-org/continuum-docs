---
sidebar_position: 5
sidebar_label: "4. Node documentation"
title: "Step 4: Add node documentation"
---

# Step 4: Add node documentation

Each node has a Markdown help page that the workbench shows next to it. It's loaded from the classpath on startup, at a path that matches the node's package and class name exactly:

```text
src/main/resources/org/projectcontinuum/feature/demo/node/WordCounterNodeModel.doc.md
```

If the file is missing, the node still works, but its help page reads *"Documentation not found for WordCounterNodeModel"*. A good help page covers what the node does, its ports, a properties table, and a small input/output example. See the `.doc.md` files in [`continuum-feature-base`](https://github.com/projectcontinuum-org/continuum-feature-base) for the house style.
