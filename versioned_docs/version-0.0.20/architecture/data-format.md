---
sidebar_position: 3
---

# Data Format

All data passed between workflow nodes is **Apache Parquet** (Snappy-compressed, Avro schema `DataRow`) — not JSON. This keeps data columnar, compressed, and query-ready from the moment it leaves a node.

- `NodeOutputWriter.OutputPortWriter` writes rows to the node's output port(s).
- `NodeInputReader` reads rows from each connected input port.
- Output files are named `output.{portId}.parquet`; input files `input.{portId}.parquet`.
- Files are staged in a local cache path before upload to (or after download from) MinIO, the platform's S3-compatible object store.

Because every node reads and writes the same Parquet/Avro format regardless of which worker or language implements it, nodes written in different feature repos — base analytics, cheminformatics, AI/ML — can be freely wired together in the same workflow graph.
