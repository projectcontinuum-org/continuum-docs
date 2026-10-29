---
sidebar_position: 4
sidebar_label: "3. Make it yours"
title: "Step 3: Make it yours"
---

# Step 3: Make it yours

<Badges>
  <Badge color="purple">Step 3 of 6</Badge>
  <Badge color="blue">About 5 minutes with the script, 20 by hand</Badge>
</Badges>

The template carries its own name in many files. This step replaces it with yours and removes the example module in the language you don't use. It's mechanical, and you only do it once.

You have two ways to do it: run a [script](#option-a-run-the-rename-script) that does the whole job, or work through the [manual checklist](#option-b-the-manual-checklist). Both end at the same [leftover check](#check-for-leftovers).

## Pick your values

Pick these first, and check the other Continuum repositories to make sure the names aren't already in use:

| Placeholder | Example | Used for | Changing it later |
|-------------|---------|----------|-------------------|
| `<org>` | `acme` | Your GitHub organisation or user, and your Docker Hub organisation | Easy. |
| `<repo>` | `continuum-feature-demo` | Repository, Gradle root project, feature module, Helm chart, worker and Docker image name | Possible, but you repeat this whole step. |
| `<package>` | `com.acme.demo` | Package for your nodes (the node classes go in `<package>.node`) | Breaks saved workflows that use your nodes, because the package is part of each node's identity. Don't change it after shipping. |
| `<TASK_QUEUE>` | `CONTINUUM_FEATURE_DEMO_TASK_QUEUE` | Temporal task queue. **Must be unique across all workers in your Continuum instance.** | Change it in `application.yaml` and the chart together. |
| `<valuesKey>` | `featureDemo` | The key under `continuum:` in the Helm chart's values | Easy, but change it in every chart file. |

:::warning[Pick a package you own]
Use a package that starts with a domain you control (`com.acme.demo`) or `io.github.<your-user>`. Don't use `org.projectcontinuum.*`: that namespace belongs to the platform. The feature module's Maven `group` is set to your package, and **Maven Central only accepts a group whose namespace you've verified**. If you don't plan to publish your feature modules as libraries, you can ignore this and [switch publishing off in Step 6](./step-6-ship-it.md#3-add-repository-secrets).
:::

:::danger[Pick a unique task queue now]
Every worker needs its own task queue. If two workers share one, Temporal gives a node's work to whichever worker polls first, including one that doesn't have that node, and the node fails at random. Search the other Continuum repositories before you pick a name.
:::

## Which example do you keep?

The template ships the same Hello World node twice: `features/continuum-feature-hello` (Kotlin) and `features/continuum-feature-hello-java` (Java). Keep the one that matches the language you write and delete the other. Mixing languages in one module isn't supported by the template; if you want both, keep both modules and run through the checklist for each.

## Option A: Run the rename script

The script below does everything in [Option B](#option-b-the-manual-checklist) except editing the descriptions and the README. It's been tested on a fresh clone of the template for both the Kotlin and the Java variants, followed by `./gradlew build`.

1. Commit or stash anything you changed so you can review the result with `git diff`.
2. Save the script as `rename.sh` **outside** the repository (for example in your home folder).
3. Edit the six values at the top, including `LANGUAGE`.
4. Run it from anywhere inside your clone: `bash ~/rename.sh`.

It needs `bash` and `perl`, which macOS and Linux have. On Windows, use WSL or Git Bash.

<details>
<summary>rename.sh</summary>

```bash
#!/usr/bin/env bash
set -euo pipefail

# ---- Edit these six values ---------------------------------------------
export ORG=acme                                  # your GitHub organisation or user
export REPO=continuum-feature-demo               # repository, module, chart and worker name
export PKG=com.acme.demo                         # package for your nodes (without .node)
export TASK_QUEUE=CONTINUUM_FEATURE_DEMO_TASK_QUEUE
export VALUES_KEY=featureDemo                    # key under `continuum:` in the Helm values
export IMAGE=acme/continuum-feature-demo         # Docker image, without a tag
LANGUAGE=kotlin                                  # kotlin or java: which example module to keep
# -------------------------------------------------------------------------

cd "$(git rev-parse --show-toplevel)"

if [ "$LANGUAGE" = kotlin ]; then
  KEEP=continuum-feature-hello
  export OLD_PKG=org.projectcontinuum.feature.example
  export DROP_RE='continuum-feature-hello-java'
  export DROP_PLUGIN='id\("org\.projectcontinuum\.feature-java"\)'
  DROP=continuum-feature-hello-java
else
  KEEP=continuum-feature-hello-java
  export OLD_PKG=org.projectcontinuum.feature.example.java
  export DROP_RE='continuum-feature-hello(?!-java)'
  export DROP_PLUGIN='id\("org\.projectcontinuum\.feature"\)'
  DROP=continuum-feature-hello
fi
export SHORT="${REPO#continuum-}"
OLD_PATH="${OLD_PKG//.//}"
NEW_PATH="${PKG//.//}"

# 1. Remove the example module you don't need
rm -rf "features/$DROP"
perl -ni -e 'print unless /$ENV{DROP_RE}/' \
  settings.gradle.kts worker/build.gradle.kts .github/workflows/build-module.yml
perl -ni -e 'print unless /$ENV{DROP_PLUGIN}/' settings.gradle.kts
perl -0pi -e 's/^ *- module: features:$ENV{DROP_RE}\n(?: +publish_\w+: \w+\n)+//m' \
  .github/workflows/on-release.yml

# 2. Rename the module, package folders and chart folder
mv "features/$KEEP" "features/$REPO"
for d in src/main/kotlin src/main/java src/main/resources src/test/kotlin src/test/java; do
  src="features/$REPO/$d/$OLD_PATH"
  if [ -d "$src" ]; then
    mkdir -p "features/$REPO/$d/$(dirname "$NEW_PATH")"
    mv "$src" "features/$REPO/$d/$NEW_PATH"
  fi
done
find "features/$REPO" -type d -empty -delete
mv charts/continuum-feature-template "charts/$REPO"

# 3. Replace the template's names inside files
find . \( -name .git -o -name .gradle -o -name .kotlin -o -name build -o -name .idea \
          -o -path ./docker -o -path ./gradle \) -prune -o -type f ! -name 'gradlew*' -print0 |
  xargs -0 perl -pi -e '
    s{org\.projectcontinuum\.feature\.example(\.java)?}{$ENV{PKG}}g;
    s{projectcontinuum/continuum-feature-template}{$ENV{IMAGE}}g;
    s{projectcontinuum-org/continuum-feature-template}{$ENV{ORG}/$ENV{REPO}}g;
    s{continuum-feature-hello(-java)?}{$ENV{REPO}}g;
    s{continuum-feature-template}{$ENV{REPO}}g;
    s{CONTINUUM_FEATURE_TEMPLATE_TASK_QUEUE}{$ENV{TASK_QUEUE}}g;
    s{featureTemplate}{$ENV{VALUES_KEY}}g;
    s{feature-template}{$ENV{SHORT}}g;
  '
perl -pi -e 's{org\.projectcontinuum\.app\.worker\.example}{$ENV{PKG}.app.worker}g' worker/build.gradle.kts

echo "Done. Still to do by hand: the description lines in build.gradle.kts and Chart.yaml, and README.md."
echo "Leftovers (expect none):"
grep -rIn "feature-template\|featureTemplate\|FEATURE_TEMPLATE\|feature\.example\|feature-hello" \
  --exclude-dir=.git --exclude-dir=.gradle --exclude-dir=.kotlin --exclude-dir=build . || true
```

</details>

When it finishes, the "Leftovers" list at the end of its output should be empty. Then finish by hand:

- [ ] The `description` lines in `features/<repo>/build.gradle.kts`, `worker/build.gradle.kts` and `charts/<repo>/Chart.yaml`. The script renames words but can't rewrite a sentence.
- [ ] `README.md`, `CONTRIBUTING.md` and `AGENTS.md`: the script fixes names and links, but the text still describes the template (badges, the "Ownership" list in `AGENTS.md`, and so on). Rewrite what no longer applies.

Skip ahead to [Check for leftovers](#check-for-leftovers).

## Option B: The manual checklist

Work through this in order and commit when the build is green. `<example-module>` below means the module you keep: `continuum-feature-hello` (Kotlin) or `continuum-feature-hello-java` (Java).

### 1. Project identity

- [ ] `settings.gradle.kts`: set `rootProject.name = "<repo>"`.
- [ ] `gradle.properties`: set `repoName=<org>/<repo>`. Leave the version lines as they are.

### 2. Remove the example you don't need

- [ ] Delete the other module's folder under `features/`.
- [ ] Remove its `include(...)` line from `settings.gradle.kts`.
- [ ] Remove its `implementation(project(...))` line from `worker/build.gradle.kts`.
- [ ] `settings.gradle.kts` also declares the Gradle plugins in `pluginManagement { plugins { … } }`. Remove the `id("org.projectcontinuum.feature-java")` line if you keep Kotlin, or the `id("org.projectcontinuum.feature")` line if you keep Java.
- [ ] `.github/workflows/on-release.yml`: delete its `- module:` entry in the matrix, including the `publish_*` lines under it.
- [ ] `.github/workflows/build-module.yml`: delete its line in the `options:` list.

### 3. The feature module

Rename the folder `features/<example-module>/` to `features/<repo>/` and then:

- [ ] `settings.gradle.kts`: change `include(":features:<example-module>")` to `include(":features:<repo>")`.
- [ ] `features/<repo>/build.gradle.kts`: change `group` to `<package>` and rewrite `description`.
- [ ] Rename the package folders under `src/main/kotlin` (or `src/main/java`), `src/test/…` and `src/main/resources`. The old path is `org/projectcontinuum/feature/example` for Kotlin and `org/projectcontinuum/feature/example/java` for Java. Replace it with your `<package>` path. Update the `package` line in every file you moved.
- [ ] `AutoConfigure.kt` (or `AutoConfigure.java`): update the `basePackages` value in `@ComponentScan` to `<package>`.
- [ ] `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`: change the line to `<package>.AutoConfigure`.

:::tip[Use your IDE's rename]
In IntelliJ, use **Refactor → Rename** on the package and module folders. It updates `package` lines and imports for you. You still have to edit `basePackages`, the `.imports` file and the Gradle files by hand.
:::

### 4. The worker

- [ ] `worker/build.gradle.kts`:
  - `implementation(project(":features:<repo>"))` must point at your renamed module.
  - Change `jibToImage` to the image you will publish, for example `<org>/<repo>:${project.version}`.
  - Change `group` and `description`.
- [ ] `worker/src/main/resources/application.yaml`:
  - `spring.application.name` → `<repo>-worker`
  - the default of `node-task-queue` → `<TASK_QUEUE>`
  - the `org.projectcontinuum.feature.example` log level → `<package>`

### 5. The Helm chart

The chart folder, its helper templates and its values keys all carry the template's name. Replace them together or Helm will fail with "template not found".

- [ ] Rename `charts/continuum-feature-template/` to `charts/<repo>/`.
- [ ] `Chart.yaml`: change `name`, `description` and `home`.
- [ ] `values.yaml` and `values-dev.yaml`:
  - the `featureTemplate:` key → `<valuesKey>`
  - `image.repository` → your image from `jibToImage`
  - `taskQueue` → `<TASK_QUEUE>` (**the same value as in `application.yaml`**)
- [ ] `templates/*.yaml`, `templates/_helpers.tpl` and `templates/NOTES.txt`: replace every `continuum-feature-template` with `<repo>`, every `.featureTemplate.` with `.<valuesKey>.`, and the `feature-template` component label with your own.
- [ ] `Chart.yaml` `appVersion` must equal `featureVersion` in `gradle.properties` (both `0.0.1` as shipped).

### 6. CI and release workflows

- [ ] `.github/workflows/on-release.yml`: update the `module:` entry for your module in the matrix.
- [ ] `.github/workflows/build-module.yml`: update the `options:` list to your module name.

### 7. Text files

- [ ] `README.md`, `CONTRIBUTING.md` and `AGENTS.md`: replace the template's name, badges, links and descriptions.

## Check for leftovers

Run this from the repository root. It prints nothing when every rename is done:

```bash
grep -rIn "feature-template\|featureTemplate\|FEATURE_TEMPLATE\|feature\.example\|feature-hello" \
  --exclude-dir=.git --exclude-dir=.gradle --exclude-dir=.kotlin --exclude-dir=build .
```

Any line it prints is a missed rename. (`AGENTS.md` and `README.md` are the files most often missed.)

Then confirm nothing broke:

```bash
./gradlew build
```

If you changed the chart, also run `helm lint charts/<repo>`.

At this point the build contains the template's **Hello World** node under your name. That's expected: you replace it in the next step.

### Before you move on

- [ ] The module folder, the `include(...)` line in `settings.gradle.kts` and the `implementation(project(...))` line in `worker/build.gradle.kts` all use the same module name.
- [ ] The `.imports` file names your real `AutoConfigure` class.
- [ ] `node-task-queue` in `application.yaml` equals `taskQueue` in the chart's `values.yaml`.
- [ ] `featureVersion` in `gradle.properties` equals `appVersion` in `Chart.yaml`.
- [ ] The leftover grep above prints nothing.
- [ ] `./gradlew build` passes, and `helm lint charts/<repo>` passes.

:::info[What you can skip for now]
You can postpone the Helm chart and the workflow files until you are ready to deploy ([Step 6](./step-6-ship-it.md)). The build, tests and local run only need the project, module and worker sections. If you postpone them, the leftover grep will still report the chart and workflows.
:::

Next: [write your node](./step-4-write-your-node.md).
