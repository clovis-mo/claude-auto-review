# Claude Code approval reviewer

An experimental personal Claude Code plugin that resolves covered pending tool-permission requests with the session's native model. It preserves downstream allows and denials, reviews only verified `ask` decisions, and returns a one-shot `allow` or `deny` without writing permission rules.

Claude Code `2.1.280` on macOS with zsh is the verified configuration. Native function hooks are early access, and this plugin reviews covered pending permission requests—not every action Claude Code performs. GitHub installation does not imply compatibility with other builds, platforms, shells, accounts, or organization policies.

## Requirements

- Claude Code `2.1.280` and an existing Claude Code login.
- Account and organization access to Claude Code's `sonnet` family alias.
- GitHub access to `prvious/claude-auto-review`; private repositories require working Git credentials on each machine.
- `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` in the environment before Claude Code starts.

Normal use needs no Anthropic API key, Node, Bun, repository clone, build step, SoloTerm, Codex, supervising process, or external service. Installation and shell setup are local to each machine and are not synchronized by GitHub.

## Enable function hooks

For the verified macOS/zsh setup, add this once to `~/.zshrc`:

```sh
export CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1
```

Open a new terminal, or reload and verify the current one:

```sh
source ~/.zshrc
printenv CLAUDE_CODE_ENABLE_FUNCTION_HOOKS
```

The expected output is `1`. The variable must reach the Claude process before startup. On build `2.1.280`, configuring it through `~/.claude/settings.json` did not enable the early function-hook test command, so that is not a verified substitute for the launch environment.

Shell startup files affect only processes that inherit that shell environment. GUI or IDE launches may need separate verified setup. Repeat this setup on every laptop; other shells and operating systems remain unverified. See Anthropic's [environment variable reference](https://code.claude.com/docs/en/env-vars) for the general environment mechanism.

## Install

```sh
claude plugin marketplace add prvious/claude-auto-review --scope user
claude plugin install approval-reviewer@prvious-plugins --scope user
claude plugin list
```

User scope makes the plugin available across local projects for that user. After installation, launch normally:

The installer may report that the optional `model` setting is not yet set. Leaving it unset uses the built-in `sonnet` default; configure it only when you intentionally want an owner override.

```sh
claude
```

For normal terminal launches, no `--plugin-dir` argument is required. Some
desktop integrations need the app-specific workaround below because they do
not preserve the normal Claude Code launch environment or plugin registry.

## Verify

Verify all of the following:

1. `claude plugin list` reports `approval-reviewer@prvious-plugins` at version `0.1.1`.
2. A plain `claude` launch uses no `--plugin-dir` argument.
3. The footer reaches `approval reviewer active`.
4. `/approval-history` is available.
5. In a disposable workspace, a harmless covered action creates a new history entry and the expected real side effect.

`checking` is not ready. `unavailable` means requests that need model review fail closed; a verified workspace-local mutation may still use the deterministic path below when session integrity is intact. An `all asks deny` integrity failure blocks that path too until a clean session restart. No reviewer status means the plugin or function-hook support did not load.

An action already allowed by native settings does not prove reviewer handling. Prove a deny with both a matching history entry and absence of the prohibited side effect; Claude declining to submit a tool call is inconclusive.

## Pen and similar desktop apps (macOS)

On Pen `1.2.13` with Claude Code `2.1.280`, resumed sessions used a temporary
`CLAUDE_CONFIG_DIR` that lost the installed plugin. A wrapper reloads it
explicitly. Wrapper launch checks passed; permission handling across Pen
resumes still needs end-to-end verification. Other apps remain unverified.

Copy this entire prompt to your coding agent. For another app, add
`Target app: <name>` above it.

```text
Set up approval-reviewer for Pen on this Mac. Inspect before changing anything,
perform the work yourself, keep the wrapper outside the plugin repository, and
do not commit changes.

1. Discover the real Claude executable and record its absolute path and version.
   Do not assume `~/.local/bin/claude` or point the wrapper back to itself. If
   the user-scoped plugin is missing, run with the real executable:

       claude plugin marketplace add prvious/claude-auto-review --scope user
       claude plugin install approval-reviewer@prvious-plugins --scope user
       claude plugin list

2. Create executable `~/.local/bin/claude-pen-reviewer`. On every invocation:
   - Read the permanent user's
     `~/.claude/plugins/installed_plugins.json`, ignoring Pen's temporary
     `CLAUDE_CONFIG_DIR`.
   - Resolve `approval-reviewer@prvious-plugins` at runtime and select exactly
     one valid user-scoped entry. Inspect all entries; never assume index 0.
   - Validate `installPath/.claude-plugin/plugin.json`; fail clearly on stderr
     if missing or ambiguous, and keep stdout clean.
   - Export `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`.
   - `exec` the real Claude binary with `--plugin-dir "$plugin_dir"` followed by
     `"$@"`, preserving arguments, stdio, and exit status.
   Use only macOS-provided `/bin/sh` and `/usr/bin/plutil`. If the user has an
   intentional permanent custom Claude config directory, inspect and use it.

3. Fully quit Pen and save its previous Claude executable setting for rollback.
   Verify `~/Library/Application Support/Pen/config.json` and its
   `claudeExecutablePath` key exist, then change only that key to the wrapper's
   absolute path. This is also Pen's advanced executable setting.

4. Check wrapper syntax and `--version`, including with `CLAUDE_CONFIG_DIR`
   pointing at an empty disposable directory. Validate the resolved plugin.
   Verify the app path, then launch diagnostics from an attached terminal:

       DEBUG_CLAUDE_AGENT_SDK=1 /Applications/Pen.app/Contents/MacOS/Pen

5. In a disposable workspace, test harmless covered allow and deny requests in
   both a fresh conversation and after Pen resumes following a question. Prove
   reviewer handling with history or other concrete execution evidence and the
   actual side effect or its absence. Already-allowed actions and load messages
   are insufficient. Never answer covered permission prompts on the reviewer's
   behalf; reaching manual approval fails the test. Do not relax permission,
   sandbox, or organization controls. Login and plugin trust are separate.

For another app, first prove it launches a configurable local Claude executable
with native function-hook support. Discover its settings and resume behavior;
do not reuse Pen's paths or assume compatibility.

Report paths, tested builds, observed results, and unverified coverage. Explain
rollback: quit the app, restore its previous executable, and relaunch without
diagnostic flags. Restore the executable before removing the wrapper; explicit
`--plugin-dir` loading may remain active despite marketplace disable.
```

## Behavior

- Existing downstream `allow` and `deny` decisions pass through unchanged.
- A correlated engine/core `ask` is held while native `$.model.complete()` returns a structured assessment; strict validation and a deterministic policy matrix produce the final decision.
- Explicit prohibitions, malicious untrusted instructions, Critical risk, unresolved decision-critical uncertainty, and Plan violations deny.
- Evidence gathering is read-only, restricted to the verified cwd/root, and bounded by path, entry, file, and total-size limits.
- Each review has a 60-second deadline from the matching `tool.call`; cancellation or stale context makes a late result unusable.
- A same-runtime resume of the exact session reactivates its validated retained context with a new generation; pending approvals are discarded. Live end-to-end verification on another laptop remains pending.
- `ExitPlanMode` asks are denied directly so the plugin never approves leaving Plan mode.
- `/approval-history` shows recent sanitized decisions for the current conversation.

### Workspace-local file mutations

Verified structured file mutations inside the active workspace are allowed without
another model review after the normal call-correlation, session, mode, and
freshness checks succeed. This covers only:

- `Edit.file_path`, for an existing file;
- `Write.file_path`, for an existing file or a new file; and
- `NotebookEdit.notebook_path`, for an existing notebook, including cell edits.

The boundary is the canonical Claude session root, so this is workspace-wide and
is not limited to the process's current working directory. It is not a blanket
permission for the rest of the machine: the current working directory must be
inside that root, and a root of `/` disables this fast path. If Claude is
intentionally launched with the home directory as its root, the home directory
is consequently the workspace; launching from the repository or worktree root
is the safer documented setup. Additional `--add-dir` roots are not
automatically included in this fast path and remain reviewed.

The plugin resolves and validates each target. Any `.git` or `.claude` path
component, including nested occurrences, is excluded from the fast path and
remains model-reviewed. Paths outside the root, shell commands or redirections,
deletes, moves, renames, MCP actions, unknown tools, and anything whose location
cannot be classified conclusively continue through the normal reviewer. A
new `Write` qualifies only when target lookup reports `ENOENT` and a validated
parent listing proves the exact basename absent. A workspace fast-path allow is
one-shot and creates no standing permission rule.
This path intentionally trusts the coding agent and its ordinary subagents for
application-level correctness; it does not perform a second semantic review of
source or tests, including enforcement of natural-language edit prohibitions.

The default reviewer is Claude Code's `sonnet` family alias, with an optional owner-configured override. Inference uses the current Claude Code login. Each logical review has up to three total native completions: normally one, or two when a valid first completion requests the single evidence round. Invalid JSON, response-shape errors, and invalid assessment enums may trigger bounded repair completions within that same total; other validation failures do not. All completions use the same frozen request context and 60-second deadline. Valid decisions, model/provider exceptions, stale or cancelled requests, deadline expiration, evidence failures, and denied actions are not retried. The plugin does not discover API keys, call a public Models API, set model effort controls, fall back, escalate models, or imitate Auto mode. If the selected model is unavailable or prohibited, requests requiring model review fail closed; the verified workspace fast path does not require the model.

The plugin writes no standing permission rule and changes no permission mode, sandbox, or organization setting.

## Update

```sh
claude plugin marketplace update prvious-plugins
claude plugin update approval-reviewer@prvious-plugins --scope user
```

Restart Claude Code and confirm the active footer again. Updates are documented as manual until background behavior has been tested for this marketplace.

Maintainers must increment `plugin.json` for every released plugin change. Recover from a bad release by publishing reverted code under a new version rather than reusing an existing version/cache identity.

## Disable, enable, or uninstall

```sh
claude plugin disable approval-reviewer@prvious-plugins --scope user
claude plugin enable approval-reviewer@prvious-plugins --scope user
claude plugin uninstall approval-reviewer@prvious-plugins --scope user
```

Optionally remove the marketplace after uninstalling:

```sh
claude plugin marketplace remove prvious-plugins --scope user
```

Removing the function-hooks export is separate and is appropriate only when no other plugin needs it.

## Develop from source

`--plugin-dir` is a development mechanism that loads the working copy for one session and takes precedence over an identically named installed copy:

```sh
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 \
claude --plugin-dir /absolute/path/to/claude-auto-review
```

Developer checks:

```sh
node --test hooks/*.node-test.ts
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude plugin test .
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 \
  claude plugin validate --strict .claude-plugin/plugin.json
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 \
  claude plugin validate --strict .claude-plugin/marketplace.json
```

Node is development/test infrastructure only. Production uses only Claude Code's native function-hook APIs.

## Compatibility and limitations

- Only Claude Code `2.1.280` on the recorded macOS/zsh setup has been verified.
- Function hooks may change in later Claude Code releases.
- The plugin is not an operating-system security boundary and cannot protect a session in which it failed to load.
- Model availability, usage limits, and organization restrictions still apply.

The repository may remain private for personal use or become public for opt-in use. Public reuse should have an explicit owner-selected license before release.

## Maintainer publishing notes

Before publishing, validate both manifests, run the full regression, review every staged file, increment the plugin version for later releases, and test a clean GitHub installation.

Marketplace format and hosting details are in Anthropic's [plugin marketplace documentation](https://code.claude.com/docs/en/plugin-marketplaces).
