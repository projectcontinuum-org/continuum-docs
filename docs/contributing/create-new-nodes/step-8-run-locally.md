---
sidebar_position: 9
sidebar_label: "8. Run locally"
title: "Step 8: Run the worker against the local stack"
---

# Step 8: Run the worker against the local stack

1. Start the platform with the [Local Setup](../../getting-started/local-setup.md) compose file and wait until every service is healthy.
2. Start your worker:

   ```bash
   ./gradlew :worker:bootRun
   ```

3. Check that the worker loaded your node. This endpoint returns the node tree that the worker serves:

   ```bash
   curl http://localhost:8090/api/v1/node-repo
   ```

4. Open the [workbench](http://127.0.0.1:3002). **Word Counter** appears under the **Demo** category. Drop it onto the canvas after a node that outputs a `text` column, such as **Create Table**, and run the workflow.
