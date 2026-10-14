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

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes it to GitHub Pages.

## Related repositories

See [Ecosystem](docs/ecosystem/repositories.md) for the full list of Project Continuum repositories.
