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

## Search

Full-text search uses [`@easyops-cn/docusaurus-search-local`](https://github.com/easyops-cn/docusaurus-search-local). The index is built with the site, so there's no external service or API key. Search only works in a production build (`npm run build && npm run serve`), not with `npm run start`. Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> to focus the search box. Results come from the docs version you're reading.

## Writing docs

Pages are Markdown with MDX, so besides normal Markdown, admonitions (`:::tip[Title]`) and ` ```mermaid ` diagrams, every page can use these components without importing them ([src/components/DocBlocks](src/components/DocBlocks/index.tsx)):

| Component | Use it for |
|-----------|------------|
| `<Lead>` | A larger intro paragraph under the page title |
| `<Badges>` / `<Badge color="green">` | A row of small coloured tags |
| `<CardGrid cols={3}>` / `<Card icon="🚀" title="…" color="pink" doc="getting-started/local-setup">` | Feature or link cards. `doc` takes a doc id and links within the version being viewed; use `href` for external links |
| `<Steps>` | Wrap a Markdown numbered list to show it as connected, numbered steps |

Colours: `purple`, `pink`, `amber`, `green`, `cyan`, `blue`, `red`, `lime`. Leave a blank line inside `<Lead>` and `<Steps>` so their content is parsed as Markdown.

Sidebar icons come from a leading emoji in `sidebar_label` or a category `label`. Categories with an emoji also set `link.title` and `link.slug` so the page heading and URL stay clean.

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
