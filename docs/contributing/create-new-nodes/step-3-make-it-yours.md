---
sidebar_position: 4
sidebar_label: "3. Make it yours"
title: "Step 3: Make it yours"
---

# Step 3: Make it yours

<Badges>
  <Badge color="purple">Step 3 of 6</Badge>
  <Badge color="blue">About 20 minutes</Badge>
</Badges>

The template carries its own name in many files. This step replaces it with yours. It's tedious but mechanical, and you only do it once. Work through the checklist in order and commit when the build is green.

The examples below use these placeholders. Pick your values first:

| Placeholder | Example | Used for |
|-------------|---------|----------|
| `<repo>` | `continuum-feature-demo` | Repository, Gradle root project, Helm chart and Docker image name |
| `<package>` | `org.projectcontinuum.feature.demo` | Kotlin/Java package for your nodes |
| `<TASK_QUEUE>` | `CONTINUUM_FEATURE_DEMO_TASK_QUEUE` | Temporal task queue. **Must be unique.** |

## Checklist

### 1. Project identity

- [ ] `settings.gradle.kts`: set `rootProject.name = "<repo>"`.
- [ ] `gradle.properties`: set `repoName=<your-org>/<repo>`. Leave the version lines as they are.

### 2. The feature module

Rename the folder `features/continuum-feature-hello/` to `features/<repo>/` and then:

- [ ] `settings.gradle.kts`: change `include(":features:continuum-feature-hello")` to `include(":features:<repo>")`.
- [ ] `features/<repo>/build.gradle.kts`: change `group` and `description`.
- [ ] Rename the package folders under `src/main/kotlin`, `src/test/kotlin` and `src/main/resources`, from `org/projectcontinuum/feature/example` to your `<package>` path. Update the `package` line in every file you moved.
- [ ] `AutoConfigure.kt`: update the `basePackages` value in `@ComponentScan` to `<package>`.
- [ ] `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`: change the line to `<package>.AutoConfigure`.

:::tip[Use your IDE's rename]
In IntelliJ, use **Refactor → Rename** on the package and module folders. It updates `package` lines and imports for you. You still have to edit the three text files above by hand: `AutoConfigure.kt`'s `basePackages`, the `.imports` file and the Gradle files.
:::

### 3. Java example (optional)

- [ ] If you only write Kotlin, delete `features/continuum-feature-hello-java/` and remove its `include(...)` from `settings.gradle.kts`, its `implementation(project(...))` from `worker/build.gradle.kts`, and its `id("org.projectcontinuum.feature-java")` line from `settings.gradle.kts`.
- [ ] If you keep it, repeat step 2 for it.

### 4. The worker

- [ ] `worker/build.gradle.kts`:
  - `implementation(project(":features:<repo>"))` must point at your renamed module.
  - Change `jibToImage` to the image you will publish, for example `<your-dockerhub-org>/<repo>:${project.version}`.
  - Change `group` and `description`.
- [ ] `worker/src/main/resources/application.yaml`:
  - `spring.application.name` → `<repo>-worker`
  - the default of `node-task-queue` → `<TASK_QUEUE>`
  - the `org.projectcontinuum.feature.example` log level → `<package>`

:::danger[Pick a unique task queue now]
Every worker needs its own task queue. If two workers share one, Temporal gives a node's work to whichever worker polls first, including one that doesn't have that node, and the node fails at random. Search the other Continuum repositories before you pick a name.
:::

### 5. The Helm chart

The chart folder, its helper templates and its values keys all carry the template's name. Replace them together or Helm will fail with "template not found".

- [ ] Rename `charts/continuum-feature-template/` to `charts/<repo>/`.
- [ ] `Chart.yaml`: change `name`, `description` and `home`.
- [ ] `values.yaml` and `values-dev.yaml`:
  - the `featureTemplate:` key → a name for your worker (for example `featureDemo:`)
  - `image.repository` → your image from `jibToImage`
  - `taskQueue` → `<TASK_QUEUE>` (**the same value as in `application.yaml`**)
- [ ] `templates/*.yaml`, `templates/_helpers.tpl` and `templates/NOTES.txt`: replace every `continuum-feature-template` with `<repo>`, every `.featureTemplate.` with your new values key, and the `feature-template` component label with your own.
- [ ] `Chart.yaml` `appVersion` must equal `featureVersion` in `gradle.properties` (both `0.0.1` as shipped).

### 6. CI and release workflows

- [ ] `.github/workflows/on-release.yml`: update the `module:` entries in the matrix to your module names.
- [ ] `.github/workflows/build-module.yml`: update the `options:` list to your module names.

### 7. Text files

- [ ] `README.md` and `CONTRIBUTING.md`: replace the template's name, badges and links.

## Check for leftovers

Run this from the repository root. It should print nothing when you're done:

```bash
grep -rIn "feature-template\|featureTemplate\|FEATURE_TEMPLATE\|feature\.example\|feature-hello" \
  --exclude-dir=.git --exclude-dir=.gradle --exclude-dir=.kotlin --exclude-dir=build .
```

If you kept the Java example or its folder name, `feature-hello` will still match; that's fine. Anything else is a missed rename.

Then confirm nothing broke:

```bash
./gradlew build
```

If you changed the chart, also run `helm lint charts/<repo>`.

:::info[What you can skip for now]
You can postpone the Helm chart and the workflow files until you are ready to deploy ([Step 6](./step-6-ship-it.md)). The build, tests and local run only need sections 1 to 4.
:::

Next: [write your node](./step-4-write-your-node.md).
