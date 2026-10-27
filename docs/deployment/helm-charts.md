---
sidebar_label: "⎈ Helm Charts"
sidebar_position: 1
---

# Helm Charts

[`continuum-charts`](https://github.com/projectcontinuum-org/continuum-charts) publishes three Helm charts for deploying Continuum on Kubernetes, served as a standard Helm chart repository via GitHub Pages.

<Badges>
  <Badge color="blue">Kubernetes</Badge>
  <Badge color="purple">3 charts</Badge>
  <Badge color="green">GitHub Pages Helm repo</Badge>
</Badges>

| Chart | Description | Required |
|-------|-------------|----------|
| `continuum-infra` | Core infrastructure — PostgreSQL, Temporal, Kafka, Schema Registry, Kafka UI, Mosquitto, MinIO | Yes |
| `continuum-platform` | Application services — API Server, Orchestration Service, Message Bridge, Workbench | Yes |
| `continuum-sso` | Optional Single Sign-On — OAuth2 Proxy with Keycloak OIDC | No |

Feature workers (`continuum-feature-base`, `continuum-feature-cheminformatics`, `continuum-feature-ai`, `continuum-feature-knime`) are **not** part of this chart repo — each lives in its own repo with its own standalone chart, installable as an independent release into the same namespace.

## Add the repository

```bash
helm repo add continuum https://projectcontinuum.github.io/continuum-charts
helm repo update
helm search repo continuum
```

## Install

```bash
# Prerequisites: Kubernetes v1.26+, Helm v3.12+, kubectl configured

helm install continuum-infra continuum/continuum-infra \
  -n continuum --create-namespace \
  --wait --timeout 15m

helm install continuum-platform continuum/continuum-platform \
  -n continuum \
  --wait --timeout 10m
```

Want to try it in under 5 minutes with Minikube, configure external databases/S3, set up SSO, or troubleshoot an install? The [`continuum-charts` README](https://github.com/projectcontinuum-org/continuum-charts) has a full walkthrough — Minikube quick-launch, dev-vs-prod Temporal backend options, customization recipes, and a troubleshooting section.
