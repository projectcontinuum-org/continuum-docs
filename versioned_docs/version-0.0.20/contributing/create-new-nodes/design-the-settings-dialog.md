---
sidebar_position: 7.5
sidebar_label: "Design the settings dialog"
title: "Design the settings dialog"
---

# Design the settings dialog

<Lead>

Use the **JSONForms Playground** to design your node's settings form in the browser. Edit the schemas, see the form update as you type, then paste the result into your node. You don't need to build or run a worker.

</Lead>

<Badges>
  <Badge color="blue">Any time after Step 4</Badge>
  <Badge color="green">No install needed</Badge>
</Badges>

**Open it: [playground.tools.projectcontinuum.org](https://playground.tools.projectcontinuum.org)**

## Why use it

A node's settings dialog is described by two JSON documents in its metadata: `propertiesSchema` (what settings exist and what is valid) and `propertiesUiSchema` (how the form is laid out). See [Step 4](./step-4-write-your-node.md#settings-and-validation). Getting the layout right by rebuilding the worker and reloading the Workbench is slow. The playground gives you the same form in a second.

It uses the same [JSON Forms](https://jsonforms.io/) version, Material UI theme and custom renderers as the Workbench, so the form you design there should look and behave the same in the Workbench. The custom renderers are the code editor and the credential picker.

## What you can do

| Area | What it does |
|------|--------------|
| **Schema**, **UI Schema** and **Data** editors | Three editors for `propertiesSchema`, `propertiesUiSchema` and the default `properties`. The form re-renders as you type. Invalid JSON is reported next to the editor that has the problem. |
| **Form preview** | The rendered form. Editing a field in the form updates the **Data** editor, and the other way round. A chip shows **Valid** or the number of validation errors. |
| **Example** picker | Start from a built-in Continuum example (basic node, array of objects, categorization, code editor field, credential field) or from the upstream JSON Forms examples. |
| **Dialog preview** | Opens the form in a popup that mimics the Workbench's *Node Settings* dialog, with its title bar and default size, so you can check how the form fits. |
| **Light and dark themes** | Check that the form reads well in both. |

## A typical workflow

<Steps>

1. Open the playground and pick the closest **Example**, or start from the blank one.
2. Write your `propertiesSchema` in the **Schema** editor: the settings, their types, `required`, `minimum` and defaults.
3. Write your `propertiesUiSchema` in the **UI Schema** editor: layouts, groups, tabs and show or hide rules.
4. Use the form: fill it in, trigger validation errors, and check the **Data** editor shows the values you expect.
5. Open the **Dialog preview** to see it as the Workbench shows it.
6. Copy the three documents into your node: the schema and UI schema into `propertiesSchema` and `propertiesUiSchema`, and the data into `properties` (the defaults). In Kotlin or Java these are JSON strings, as in [Step 4](./step-4-write-your-node.md).

</Steps>

:::tip
Keep the schemas in the playground until the form feels right, then paste them into your node once. Escaping JSON inside Kotlin or Java strings is the part that's easy to get wrong, so do it last.
:::

## Credentials and code editors

Controls with `options.format` set to `"credential"` or `"code"` render with the same pickers and editors as the Workbench. See [Use a credential](./recipes.md#use-a-credential) for how a node reads the value.

In the playground, the credential picker shows **mock credentials**. It doesn't connect to a real credentials server, so use it to check the layout, not to test credential access.

## Load a real node from your platform

You can also load the schemas of nodes that are already registered with a running platform, for example to tweak the form of an existing node.

1. Start the platform, for example with [`continuum-local-setup`](../../getting-started/local-setup.md).
2. In the playground, turn on **Load from API** and enter the **API Server URL**. The default is `http://localhost:8081`.
3. Pick a node under **Load Node from API Server**. Use the refresh button to reload the catalog.

The playground reads the node catalog through the API server's node-explorer endpoint (`/api/v1/node-explorer/children`).

:::note
The hosted playground runs in your browser and calls the API server directly from there. The API server therefore has to allow cross-origin requests from `https://playground.tools.projectcontinuum.org`. If your API server doesn't, the playground shows **API server unreachable**. In that case, run the playground locally instead:

```bash
git clone https://github.com/projectcontinuum-org/continuum-jsonform-playground.git
cd continuum-jsonform-playground
npm install
npm run dev
```

Then open `http://localhost:4300`.
:::

## Found a difference from the Workbench?

The playground only helps if it matches the Workbench. If a form looks or behaves differently in the Workbench, please open an issue in the [playground repository](https://github.com/projectcontinuum-org/continuum-jsonform-playground/issues).

Next: [test and run your node](./step-5-test-and-run.md), or go back to the [recipes](./recipes.md).
