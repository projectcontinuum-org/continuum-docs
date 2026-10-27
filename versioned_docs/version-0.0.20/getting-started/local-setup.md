---
sidebar_position: 1
---

# Local Setup

The [`continuum-local-setup`](https://github.com/projectcontinuum-org/continuum-local-setup) repo gives you a single `docker compose up` that launches the **complete** Project Continuum stack — infrastructure services, platform backend, browser IDE, and feature workers — all wired together and ready to go.

No builds. No cloning five repos. Just Docker.

## Prerequisites

| Requirement | Minimum |
|-------------|---------|
| Docker | 20.10+ |
| Docker Compose | v2.0+ |
| RAM | 8 GB available for containers |
| Disk | ~5 GB for images + volumes |

## Quick start

```bash
git clone https://github.com/projectcontinuum-org/continuum-local-setup.git
cd continuum-local-setup/docker
docker compose up -d
```

Wait for all containers to become healthy, then open the [Continuum Workbench](http://127.0.0.1:3002/#/home/node/example-workflows). Example workflows are pre-loaded under `/home/node/example-workflows/`.

Verify everything is running:

```bash
docker compose ps
```

All services should show `running` (the `temporal-search-attributes-init` container exits after setup — that's expected).

Stop everything:

```bash
docker compose down       # keep data
docker compose down -v    # also remove volumes
```

## What's inside

The compose stack has three layers: infrastructure, platform services, and feature workers.

### Infrastructure services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 35432 | Database backing Temporal's workflow state and history |
| Temporal | 7233 | Durable workflow execution engine — orchestrates node-by-node execution, handles retries and crash recovery |
| Temporal UI | [localhost:38081](http://localhost:38081) | Inspect running workflows, view execution history, debug |
| Kafka (3-node KRaft cluster) | 39092–39094 | Carries real-time node execution events from workers to the browser |
| Schema Registry | [localhost:38080](http://localhost:38080) | Avro schemas for Kafka messages |
| Kafka UI | [localhost:38082](http://localhost:38082) | Browse Kafka topics, messages, consumer groups |
| Mosquitto | 31883 (TCP), 31884 (WS) | MQTT broker — last hop pushing execution events to the browser over WebSockets |
| MinIO | [localhost:39000](http://localhost:39000) (API), [localhost:39001](http://localhost:39001) (Console) | S3-compatible storage for Parquet data files passed between nodes |

### Platform services

| Service | Port | Purpose |
|---------|------|---------|
| continuum-api-server | [localhost:8080](http://localhost:8080) | REST API — workflows, node registry, execution trigger. Single entry point for the workbench UI |
| continuum-message-bridge | — | Kafka-to-MQTT bridge for live browser updates |
| continuum-workbench | [localhost:3002](http://localhost:3002) | Browser IDE — Eclipse Theia + React Flow canvas |

### Feature workers

| Service | Nodes | Purpose |
|---------|-------|---------|
| continuum-feature-base | 16 nodes | Core analytics — table ops, filtering, REST, scripting, anomaly detection |
| continuum-feature-cheminformatics | RDKit nodes | Molecular descriptors and cheminformatics operations |

Want AI nodes? Add the `continuum-feature-ai` worker image to the compose file for LLM fine-tuning with Unsloth.

## Example workflows

The `docker/example-workflows/` directory is mounted into the workbench container:

| Workflow | What it demonstrates |
|----------|---------------------|
| `SensorDataPipeline.cwf` | IoT sensor data → anomaly detection → conditional routing → batch alerts via REST |
| `AnomalyDetector.cwf` | Z-score anomaly detection with conditional splitting |
| `RESTNode.cwf` | Making HTTP requests to external APIs from a workflow |
| `Unsloth.cwf` | LLM fine-tuning configuration (requires the AI worker) |

## Troubleshooting

**Containers keep restarting?** Check logs: `docker compose logs <service-name> --tail 100`

**Temporal not starting?** PostgreSQL needs to be healthy first — give it 30–60 seconds on first run.

**Workbench shows connection errors?** The API server may still be starting. Wait until `docker compose ps` shows all services as `running`.

**Out of memory?** Kafka + Temporal + all services need ~6–8 GB. Increase Docker's memory limit in Docker Desktop settings.

See the full [continuum-local-setup README](https://github.com/projectcontinuum-org/continuum-local-setup) for more detail.
