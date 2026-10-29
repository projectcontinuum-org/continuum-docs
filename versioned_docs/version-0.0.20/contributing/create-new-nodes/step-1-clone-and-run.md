---
sidebar_position: 2
sidebar_label: "1. Clone and run"
title: "Step 1: Clone the template and run it"
---

# Step 1: Clone the template and run it

<Badges>
  <Badge color="purple">Step 1 of 6</Badge>
  <Badge color="blue">About 10 minutes</Badge>
</Badges>

Before you change anything, get the unmodified template running. You'll see the two example nodes on a canvas, and from then on you know that any breakage comes from your own changes.

## 1. Get the code

On GitHub, open [`continuum-feature-template`](https://github.com/projectcontinuum-org/continuum-feature-template) and click **Use this template**. That creates a copy in your own organisation without the template's git history. Then clone your copy:

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
```

## 2. Build it

```bash
./gradlew build
```

This compiles both example modules, runs their unit tests, checks that every node is annotated correctly and packages the worker jar. The Gradle wrapper is already in the repo; you only need JDK 21.

## 3. Start the local Continuum stack

```bash
cd docker
docker compose up -d
```

Wait until `docker compose ps` shows the services as healthy. The `temporal-search-attributes-init` container exits when its setup is done; that's expected. The stack needs about 8 GB of RAM.

## 4. Start your worker

From the repository root:

```bash
./gradlew :worker:bootRun
```

The worker connects to Temporal, registers its nodes with the platform and serves on port `8090`.

## 5. See your nodes in the Workbench

1. Open the Workbench at [http://localhost:3002](http://localhost:3002).
2. In the node palette, find **Hello World** and **Hello Java** under **Examples**.
3. Drag a table source onto the canvas (for example **Create Table**), connect it to **Hello World**, and run the workflow.

Each row gets a new `greeting` column.

:::tip[It worked if you see the nodes]
If the palette is empty, the worker didn't register. Check [http://localhost:8090/actuator/health](http://localhost:8090/actuator/health) and see [Troubleshooting](./troubleshooting.md).
:::

## Local endpoints

| Service | URL |
|---------|-----|
| Workbench | [http://localhost:3002](http://localhost:3002) |
| API server | [http://localhost:8080](http://localhost:8080) |
| Your worker | [http://localhost:8090/actuator/health](http://localhost:8090/actuator/health) |
| Temporal UI | [http://localhost:38081](http://localhost:38081) |
| Kafka UI | [http://localhost:38082](http://localhost:38082) |
| MinIO console | [http://localhost:39001](http://localhost:39001) (`minioadmin` / `minioadmin`) |

Next: [take a tour of what you just ran](./step-2-tour-the-template.md).
