---
sidebar_label: "📊 Base Analytics"
sidebar_position: 1
---

# Base Analytics Nodes

[`continuum-feature-base`](https://github.com/projectcontinuum-org/continuum-feature-base) ships 16 production-ready nodes for data transformation, filtering, aggregation, REST integration, scripting, and anomaly detection.

<Badges>
  <Badge color="purple">16 nodes</Badge>
  <Badge color="cyan">Kotlin / Spring Boot</Badge>
  <Badge color="green">Data · Transform · Filter · REST · Scripting</Badge>
</Badges>

| Category | Node | Description |
|----------|------|-------------|
| Data | Create Table | Creates a structured table from FreeMarker template configuration |
| Data | Column Join | Joins two columns from left and right tables into one output column |
| Data | Joint Node | Joins input strings into one |
| Data | Join on Multiple Keys | Performs inner join on two tables using two key columns from each table |
| Transform | Pivot Columns | Pivots table so pivot column values become new columns with value column as cell values |
| Transform | JSON Exploder | Parses JSON strings and flattens keys into new columns |
| Transform | Column Splitter | Splits a column into two parts |
| Transform | Kotlin Script | Runs a Kotlin script for each row, adding a `script_result` column |
| Filter | Dynamic Row Filter | Filters rows where the specified column value is greater than the threshold |
| Filter | Conditional Splitter | Splits rows into two outputs based on threshold comparison |
| Aggregation | Time Window Aggregator | Aggregates values into time windows, summing by window buckets |
| Aggregation | Batch Accumulator | Groups rows into batches and adds `batch_id` and `row_count` columns |
| Text | Text Normalizer | Normalizes text by trimming, lowercasing, and removing non-alphanumeric characters |
| Security | Crypto Hasher | Generates SHA-256 hash of column values |
| Analytics | Anomaly Detector (Z-Score) | Detects outliers using Z-score method (flags values with \|Z\| > 2) |
| Integration | REST Client | Makes HTTP requests for each row using FreeMarker templated URLs and payloads |

See the [`continuum-feature-base` README](https://github.com/projectcontinuum-org/continuum-feature-base) for build instructions and dependencies.
