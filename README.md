# Claude Code approval reviewer

Reviews pending Claude Code tool permissions with your signed-in Claude model. It respects existing allow and deny rules and does not save new permission rules.

## Install

Requires Claude Code with function-hook support and access to Sonnet. Add this to `~/.claude/settings.json` (merge it into your existing `env` object if you have one):

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1"
  }
}
```

Then install the plugin for your user:

```sh
claude plugin marketplace add prvious/claude-auto-review --scope user
claude plugin install approval-reviewer@prvious-plugins --scope user
```

Start a new `claude` session. The footer should show `approval reviewer active`; use `/approval-history` to see its decisions.
