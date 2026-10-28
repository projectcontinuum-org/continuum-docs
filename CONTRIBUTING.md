# Contributing to continuum-docs

Thanks for your interest in contributing to Project Continuum. This repository holds the source of the documentation site at [docs.projectcontinuum.org](https://docs.projectcontinuum.org).

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE), the same license as this project.

## Ways to contribute

- **Report a bug or request a feature** by [opening an issue](https://github.com/projectcontinuum-org/continuum-docs/issues). Include what you expected, what happened, and steps to reproduce. For bugs, include versions and relevant logs.
- **Improve the documentation**, including typos and unclear explanations. The docs live in [continuum-docs](https://github.com/projectcontinuum-org/continuum-docs).
- **Submit a pull request** for a bug fix or feature. For anything larger than a small fix, open an issue first so we can agree on the approach before you invest time.

## Development setup

You will need **Node.js 20 or later**.

```bash
git clone https://github.com/<your-username>/continuum-docs.git
cd continuum-docs

npm install
npm run start   # dev server with live reload at http://localhost:3000
npm run build   # production build; fails on broken links
```

Edit pages under `docs/`. The `versioned_docs/` folder holds snapshots of released versions, so only change it to fix an error in an already-released version.

## Pull request process

1. Fork the repository and create a branch from `main`.
2. Keep each pull request focused on one change.
3. Make sure the build and tests above pass locally, and add or update tests for behavior you change.
4. Write a clear commit message and pull request description: a short imperative summary line (for example "Fix retry config validation"), followed by the reason for the change.
5. Open the pull request against `main` and respond to review feedback. A maintainer will merge it once it is approved and CI passes.

## Other Continuum repositories

Project Continuum is split across several repositories. If your change belongs elsewhere, see the [organization overview](https://github.com/projectcontinuum-org) and the [documentation](https://docs.projectcontinuum.org).
