# Continuum Docs

Documentation site for [Project Continuum](https://projectcontinuum.org) — deployed to [docs.projectcontinuum.org](https://docs.projectcontinuum.org) via GitHub Pages.

Built with [Docusaurus](https://docusaurus.io/).

## Local development

```bash
npm install
npm run start
```

Starts a local dev server at `http://localhost:3000` with live reload.

## Build

```bash
npm run build
```

Generates static content into `build/`.

## Versioning

The docs are versioned by **Continuum platform version** and readers pick one from the version dropdown in the navbar.

| Folder | Served at | What it is |
|--------|-----------|------------|
| `docs/` | `/docs/next/` | Next (unreleased): edit here for upcoming platform changes |
| `versioned_docs/version-<x.y.z>/` | `/docs/` (newest) or `/docs/<x.y.z>/` | Frozen snapshot for a released platform version |

`versions.json` lists the released versions, newest first. The first entry is the default version served at `/docs/`.

**When a new platform version is released**, update `docs/` for it, then snapshot it:

```bash
npm run docusaurus docs:version 0.0.21
```

This copies `docs/` to `versioned_docs/version-0.0.21/`, copies the sidebar to `versioned_sidebars/`, and adds the version to `versions.json`.

**To fix a mistake in a released version**, edit its file under `versioned_docs/` as well as in `docs/` if the fix applies to the next version too.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes it to GitHub Pages.

## Related repositories

See [Ecosystem](docs/ecosystem/repositories.md) for the full list of Project Continuum repositories.
