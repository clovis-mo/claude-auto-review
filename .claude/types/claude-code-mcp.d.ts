// The inputs of the MCP tools this session had, from each server's tools/list
// inputSchema; written by `/plugin-types` (src/plugins/functionHooks/mcp-tool-types/mcp-tool-declarations.ts).
// Merges into the engine's ToolCallInput (types/ McpToolInputs) so
// `e.tool === "mcp__<server>__<tool>"` narrows to the tool's arguments.
// Regenerate rather than edit.
export {}
declare module 'claude-code' {
  interface McpToolInputs {
    /** Create a doc, or apply several operations to one doc atomically. */
    mcp__claude_ai_Claude_Docs__batch: {
      batch?: unknown[]
      container?: {
        create?: {}
        id?: string
        kind: string
      }
      opId?: string
      verbose?: boolean
    }
    /** Create one object in a doc: a tab, its contents, a comment, an upload record. */
    mcp__claude_ai_Claude_Docs__create: {
      artifact?: string
      container?: {
        id: string
        kind: string
        version?: string
      }
      engine?: string
      object: "file" | "node" | "utterance" | "enum" | "blob"
      opId?: string
      payload: {} | string
      verbose?: boolean
    }
    /** Delete one object from a doc: a tab, its contents, a comment, an upload record. A doc keeps at least one tab (deleting its last refuses `last_tab`): to start over, rewrite that tab's contents with `update`, never delete and recreate the tab. */
    mcp__claude_ai_Claude_Docs__delete: {
      container?: {
        id: string
        kind: string
        version?: string
      }
      engine?: string
      opId?: string
      payload?: {} | string
      ref: {
        id: string
        object: "project" | "file" | "node" | "utterance"
      }
      verbose?: boolean
    }
    /** Export one tab inline as base64: pdf, docx, html, text, markdown or notion (Notion-flavored markdown, what notion-create-pages takes). To just keep the file in the doc's files, create a blob {from: {object: "file", id}, format} instead (no large result). */
    mcp__claude_ai_Claude_Docs__export: {
      container: {
        id: string
        kind: string
        version?: string
      }
      file: string
      format: "markdown" | "text" | "html" | "docx" | "pdf" | "notion"
      maxBytes?: number
      paper?: "letter" | "a4"
    }
    /** Docs guides: topic.instructions repeats the server instructions. Read it only if your client dropped them. Also topic.<name>, refusal.<code>. After a doc's birth → ["topic.index"]. */
    mcp__claude_ai_Claude_Docs__guide: {
      /** topic.<name> (instructions, index, editing, tabs, comments, charts, chart-definition, uploads, skill) or refusal.<code>; several per call is fine. */
      items?: unknown[]
    }
    /** List a tab's or a doc's comment history (threads, replies, resolves). */
    mcp__claude_ai_Claude_Docs__query: {
      container?: {
        id: string
        kind: string
        version?: string
      }
      object?: "utterance"
      payload?: {} | string
    }
    /** Read a doc (lists its tabs), a tab's contents, or a comment. A claude.ai/[code/]artifact/[<title>-]<id> link → `ref {"object":"project","id":"<id>"}` first; reads inside it take `container {"kind":"project","id":"<id>"}`. */
    mcp__claude_ai_Claude_Docs__read: {
      container?: {
        id: string
        kind: string
        version?: string
      }
      engine?: string
      payload?: {} | string
      ref: {
        id: string
        object: "project" | "file" | "node" | "utterance" | "enum" | "blob"
      }
    }
    /** Edit a tab's contents, rename a doc or tab, or change a stored value. */
    mcp__claude_ai_Claude_Docs__update: {
      answering?: string
      container?: {
        id: string
        kind: string
        version?: string
      }
      engine?: string
      opId?: string
      payload: {} | string
      ref: {
        id: string
        object: "project" | "file" | "node" | "utterance" | "enum"
      }
      verbose?: boolean
    }
    /** Use get_app_state if you don't have execute documentation */
    mcp__pencil__execute: {
      /** The id of the failed snippet to patch, as printed in that call's failure message. Send it only together with `edits`, and always use a valid editId that is referencing a failed execute call. Never send it alongside `input`. */
      editId?: string
      /** When an execute call fails, ALWAYS retry with this instead of resending the snippet in `input`. Each edit replaces `find` with `replace` in the failed snippet, then the patched snippet re-runs from scratch. Edits apply in order: each `find` must match the snippet as already modified by the preceding edits. Requires `editId`; omit `input` when using it. If the patched snippet fails again, keep fixing it with further `edits` under the same editId - `find` must then match the already-patched snippet. */
      edits?: Array<{
        /** Replace every occurrence instead of requiring a unique match. */
        all?: boolean
        /** Exact text in the failed snippet to replace. Must match exactly once unless `all` is true. */
        find: string
        /** The replacement text. */
        replace: string
      }>
      /** An optional file path to access a .pen file. */
      filePath: string
      /** The JavaScript snippet to execute. Required unless `edits` is provided. */
      input?: string
    }
    /** Get info about the current state of the pen.dev app., current user selections and other essential information to get started on a task. */
    mcp__pencil__get_app_state: {}
    /** Load visual style archetypes for working with .pen files. Styles provide configurable fonts, colors, and imagery. Styles do not save variables, they only provide reference values. Usage: 1. get_style(): list available styles 2. get_style({ name }): load style with no params or get required params when required 3. get_style({ name, params }): load style */
    mcp__pencil__get_style: {
      /** Style name from the listing */
      name?: string
      /** Key-value pairs for required params returned in step 2 */
      params?: {}
    }
    /** Read the pen-dev skill that teaches how to design on the pen.dev canvas. Usage: 1. read_skill(): returns the skill's SKILL.md 2. read_skill({ path }): read a file referenced from SKILL.md (e.g. "execute.md", "guide/web-app.md") */
    mcp__pencil__read_skill: {
      /** Relative path of a file referenced from SKILL.md. Omit to read SKILL.md itself. */
      path?: string
    }
    /** Clear Solo's saved output for one process without touching the PTY. */
    mcp__solo__clear_output: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
    }
    /** Remove a stored terminal/agent; commands use stop/restart. Self-close requires confirm_self_close. */
    mcp__solo__close_process: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** Required only when the current MCP session is closing its own Solo process. Set this only when the user explicitly asked this process itself to close. */
      confirm_self_close?: boolean
    }
    /** Register or import an existing local directory as a Solo project without opening app onboarding UI. Optional workspace_id imports into that workspace; omitting it uses the default workspace. */
    mcp__solo__create_project: {
      /** Existing local directory to register or import as a Solo project. */
      path: string
      /** Optional stored project name. Ignored when the canonical path is already registered. */
      name?: string
      /** Optional workspace to import into. Ignored when the canonical path is already registered. */
      workspace_id?: number
    }
    /** Create a global or project prompt template using app validation and same-scope uniqueness rules. */
    mcp__solo__create_prompt_template: {
      /** Optional project scope override. */
      project_id?: number
      name: string
      /** Optional plain-text description. Empty or omitted descriptions are stored as empty strings. */
      description?: string
      /** Markdown prompt body. Saved exactly as provided. */
      body: string
    }
    /** Create a Solo workspace. */
    mcp__solo__create_workspace: {
      /** Workspace display name. */
      name: string
      /** Optional workspace icon initials. */
      icon?: string
      /** Optional workspace color token. */
      color?: string
    }
    /** Delete the effective project; requires confirm_delete and, for active processes, confirm_stop_running. */
    mcp__solo__delete_project: {
      /** Optional project scope override. */
      project_id?: number
      /** Required confirmation that this call should delete the project and its Solo-owned state. */
      confirm_delete?: boolean
      /** Required when the project has running, starting, or stopping processes. */
      confirm_stop_running?: boolean
      /** What to do with project-scoped prompt templates owned by the project. Defaults to deleting them. */
      prompt_template_policy?: unknown /* $ref #/$defs/PromptTemplateProjectDeletionPolicy */
    }
    /** Delete one prompt template by ID. MCP bulk delete is not supported. */
    mcp__solo__delete_prompt_template: {
      template_id: number
    }
    /** Delete a Solo workspace, optionally moving its projects to destination_workspace_id. */
    mcp__solo__delete_workspace: {
      /** Workspace row ID to delete. */
      workspace_id: number
      /** Optional workspace that receives projects from the deleted workspace. */
      destination_workspace_id?: number
    }
    /** Export prompt templates as Markdown files to a destination directory Solo can write. Uses the same frontmatter, slugged filenames, and duplicate numbering rules as the app export command. */
    mcp__solo__export_prompt_templates: {
      /** Prompt template IDs to export. The generated Markdown filenames follow the same slugging and duplicate numbering rules as the app export command. */
      template_ids: number[]
      /** Destination directory for the exported Markdown files. Solo creates it when missing. */
      destination_dir: string
    }
    /** Return recent rendered terminal output for one process selected by `process_id` or `process_name`. Defaults to 50 rows, max 200. Supports an optional `project_id` override. */
    mcp__solo__get_process_output: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** Max lines to return (default 50, max 200). */
      lines?: number
    }
    /** Return detected ports and URLs for one process and its children. Useful for localhost URL lookup, service discovery, and readiness checks. */
    mcp__solo__get_process_ports: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
    }
    /** Return recent raw terminal output, including cleared/alternate-screen bytes; defaults to 50 lines, max 200. */
    mcp__solo__get_process_raw_output: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** Max lines to return (default 50, max 200). */
      lines?: number
    }
    /** Read detailed status for one process. */
    mcp__solo__get_process_status: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
    }
    /** Read metadata for the effective project scope. Supports an optional `project_id` override. */
    mcp__solo__get_project: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Return CPU and memory usage for project processes. Supports an optional `project_id` override. */
    mcp__solo__get_project_stats: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Read project metadata and current processes for the effective project scope. Supports an optional `project_id` override. */
    mcp__solo__get_project_status: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Get one prompt template by ID, including parsed placeholders. MCP get updates last_selected. */
    mcp__solo__get_prompt_template: {
      /** Prompt template ID. MCP get updates last_selected. */
      template_id: number
    }
    /** Discover Solo MCP capabilities and official docs; omit arguments for overview, pass topic for local guidance, or query for one best-effort hosted documentation search returning absolute Markdown/web URLs. */
    mcp__solo__help: {
      /** Topic to get help on. Omit for an overview of all capabilities. Available topics: processes, timers, coordination, locks, scratchpads, todos, spawning, inspection, readiness, projects, docs, solo.yml. Common aliases such as services, ports, urls, ready, status, inspect, kv, projects, docs, howto, guide, yml, and yaml also work. */
      topic?: string
      /** Natural-language Solo product question. Makes one best-effort request to Solo's hosted documentation search and returns ranked excerpts plus absolute Markdown and web URLs. The query is the only caller-provided data; no project, process, or session context is sent. Cannot be combined with topic. Length: 2-200 characters. */
      query?: string
    }
    /** Identify this session by auto-detection, own solo_process_id/SOLO_PROCESS_ID, or external actor; never use it to target another process. */
    mcp__solo__identify_session: {
      /** Optional host OS PID fallback (from $$ in shell or os.getpid() in Python). Used only when no explicit identity assertion is provided. */
      pid?: number
      /** This MCP client's own Solo-managed process ID from SOLO_PROCESS_ID, not a host OS PID and not a timer target. */
      solo_process_id?: number
      /** External actor details for callers that are not Solo-managed processes. */
      external?: unknown /* $ref #/$defs/IdentifySessionExternalParams */
    }
    /** Delete a shared JSON value by key. Returns `{ "project_id": number, "key": string, "deleted": boolean }`. */
    mcp__solo__kv_delete: {
      /** Optional project scope override. */
      project_id?: number
      key: string
    }
    /** Get a shared JSON value by key. */
    mcp__solo__kv_get: {
      /** Optional project scope override. */
      project_id?: number
      key: string
    }
    /** List shared JSON values, optionally filtered by key prefix. */
    mcp__solo__kv_list: {
      /** Optional project scope override. */
      project_id?: number
      prefix?: string
      limit?: number
    }
    /** Set a shared JSON value, optionally with a TTL. */
    mcp__solo__kv_set: {
      /** Optional project scope override. */
      project_id?: number
      key: string
      /** Any valid JSON value. */
      value: unknown
      /** Optional TTL in seconds. Omit for non-expiring state. */
      ttl_seconds?: number
    }
    /** List configured agent runtimes. Use each returned `id` as `agent_tool_id` for `spawn_agent` or `spawn_process(kind="agent")`. */
    mcp__solo__list_agent_tools: {}
    /** List process entries in the effective project scope. Supports an optional `project_id` override. */
    mcp__solo__list_processes: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** List Solo projects, optionally by workspace_id. Omit workspace_id to keep the global list and single-project auto-select. */
    mcp__solo__list_projects: {
      /** Optional workspace filter. Omit to preserve the global project list and single-project auto-select behavior. */
      workspace_id?: number
    }
    /** List prompt template summaries from global plus project pools; use get_prompt_template for full body/placeholders. Does not update last_selected. */
    mcp__solo__list_prompt_templates: {
      /** Optional project scope override. */
      project_id?: number
      /** Search template name/description. */
      query?: string
      /** Sort order for returned templates. Defaults to picker order: last selected descending, then name. */
      sort?: unknown /* $ref #/$defs/PromptTemplateListSortParam */
    }
    /** List Solo workspaces. */
    mcp__solo__list_workspaces: {}
    /** Try to acquire a lease lock. Acquisition is non-blocking. */
    mcp__solo__lock_acquire: {
      /** Optional project scope override. */
      project_id?: number
      lock_key: string
      lease_ttl_seconds: number
    }
    /** Release a lease lock owned by the current actor. Returns `{ "project_id": number, "lock_key": string, "released": boolean }`. */
    mcp__solo__lock_release: {
      /** Optional project scope override. */
      project_id?: number
      lock_key: string
    }
    /** Return the current state of one lease lock. */
    mcp__solo__lock_status: {
      /** Optional project scope override. */
      project_id?: number
      lock_key: string
    }
    /** Run a disposable MCP smoke test in the effective project, then clean up the scratchpad and todo it creates. */
    mcp__solo__mcp_smoke_test: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** List enabled Solo MCP tools by category with one-line descriptions and no input schemas. */
    mcp__solo__mcp_tools_summary: {}
    /** Move a project, including any linked checkout group, into a workspace. Optional before_project_id and after_project_id placement hints are mutually exclusive. */
    mcp__solo__move_project_to_workspace: {
      /** Project ID to move. */
      project_id: number
      /** Destination workspace ID. */
      workspace_id: number
      /** Optional placement hint: insert before this project in the destination workspace. */
      before_project_id?: number
      /** Optional placement hint: insert after this project in the destination workspace. */
      after_project_id?: number
    }
    /** Rename a process in the Solo UI. */
    mcp__solo__rename_process: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** The new process name */
      new_name: string
    }
    /** Set or clear the display name for the effective project scope. Pass `display_name` as a string to set it, or null to clear it. Supports an optional `project_id` override. */
    mcp__solo__rename_project: {
      /** Optional project scope override. */
      project_id?: number
      /** Project display name to set. Pass null to clear the custom display name. */
      display_name: unknown /* $ref #/$defs/ProjectDisplayNameUpdateParam */
    }
    /** Reorder Solo workspaces by passing every workspace ID in desired order. */
    mcp__solo__reorder_workspaces: {
      /** Workspace IDs in desired display order. Must contain every workspace exactly once. */
      workspace_ids: number[]
    }
    /** Restart all trusted command processes in the effective project scope. Running commands are stopped first. Terminals and agents are skipped. Supports an optional `project_id` override. */
    mcp__solo__restart_all_commands: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Restart an existing command/terminal/agent by ID or name; commands must be trusted. Use spawn tools to create new processes. */
    mcp__solo__restart_process: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
    }
    /** Add multiple tags to a scratchpad in one revision bump. Returns `{ "project_id": number, "scratchpad_id": number, "revision": number }`. */
    mcp__solo__scratchpad_add_tags: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Tag labels to add in one revision bump. */
      tags: string[]
      expected_revision: number
    }
    /** Append to a scratchpad; use append_section for an existing heading or edit for targeted replacement. Optional expected_revision. */
    mcp__solo__scratchpad_append: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      content: string
      /** Optional current revision guard. When omitted, append still bumps the revision and cannot clobber existing content. */
      expected_revision?: number
    }
    /** Append under an existing markdown heading; heading match is normalized and case-insensitive. Optional expected_revision. */
    mcp__solo__scratchpad_append_section: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Markdown heading text to append under. Matching is whitespace-normalized and case-insensitive. */
      heading: string
      content: string
      /** Optional current revision guard. When omitted, append still bumps the revision and inserts into the current matching section. */
      expected_revision?: number
    }
    /** Hide a scratchpad from lists without deleting it. Returns `{ "project_id": number, "scratchpad_id": number, "archived": boolean }`. */
    mcp__solo__scratchpad_archive: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
    }
    /** Clear a scratchpad at an expected revision. Returns `{ "project_id": number, "scratchpad_id": number, "revision": number }`. */
    mcp__solo__scratchpad_clear: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      expected_revision: number
    }
    /** Delete a scratchpad at an expected revision. Returns `{ "project_id": number, "scratchpad_id": number, "deleted": true }`. */
    mcp__solo__scratchpad_delete: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      expected_revision: number
    }
    /** Replace one scratchpad section or line range at expected_revision; section edits preserve heading unless content starts with one. */
    mcp__solo__scratchpad_edit: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Edit target. Use `{"type":"section","section_heading":"..."}` or `{"type":"line_range","offset":0,"limit":1}`. */
      target: {
        type: "section"
        /** Markdown section heading to replace. Matching is whitespace-normalized and case-insensitive. */
        section_heading: string
      } | {
        type: "line_range"
        /** Zero-based body-content line offset. */
        offset: number
        /** Number of body-content lines to replace. */
        limit: number
      }
      /** Replacement content. Section edits replace the whole section when this starts with a markdown heading; otherwise they preserve the matched heading and replace that section's body. */
      content: string
      expected_revision: number
    }
    /** Search one scratchpad for literal text without returning the whole document; supports scope, case sensitivity, limit, and context lines. */
    mcp__solo__scratchpad_find: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Literal substring to search for. Empty strings are rejected. */
      query: string
      /** Search all lines, markdown headings only, or content lines only. Defaults to all. */
      scope?: unknown /* $ref #/$defs/ScratchpadFindScope */
      /** When true, match query with exact case. Defaults to false. */
      case_sensitive?: boolean
      /** Maximum matching lines to return. Defaults to 20 and is clamped to 1..=100. */
      limit?: number
      /** Number of surrounding lines to include before and after each match. Defaults to 1 and is clamped to 0..=3. */
      context_lines?: number
    }
    /** List scratchpads in a project without returning full content. Optionally filter by keyword query or tags and paginate with offset/limit. Query results include matched_fields and a short content snippet when content matched. */
    mcp__solo__scratchpad_list: {
      /** Optional project scope override. */
      project_id?: number
      /** Case-insensitive keyword query matched against scratchpad names and content. */
      query?: string
      /** Match any of these tags. */
      tags?: string[]
      /** Zero-based list offset. */
      offset?: number
      /** Maximum number of scratchpads to return. */
      limit?: number
    }
    /** Load UTF-8 text into a scratchpad; leading H1 overrides name as title and relative paths stay inside the project. */
    mcp__solo__scratchpad_load_from_file: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id?: number
      name: string
      /** Filesystem path to read. Absolute paths are used as-is. Relative paths resolve inside the project directory. */
      path: string
      /** Expected current revision. Omit or set null to create a new scratchpad. */
      expected_revision?: number
    }
    /** Read scratchpad content, revision, and metadata before edits; supports full/content, headings, section, line slice, and content_only modes. */
    mcp__solo__scratchpad_read: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Line offset to start reading from (0-indexed). Default: 0. */
      offset?: number
      /** Maximum number of lines to return. Default: all remaining lines. */
      limit?: number
      /** When true, return raw content text and move revision/url details into `_meta`. */
      content_only?: boolean
      /** Read mode. `full` and `content` return the scratchpad body, `headings` returns a markdown heading outline, and `section` returns one markdown section. */
      mode?: unknown /* $ref #/$defs/ScratchpadReadMode */
      /** Required when `mode=section`. Matches a heading text from `mode=headings`; matching is whitespace-normalized and case-insensitive. */
      section_heading?: string
    }
    /** Remove multiple tags from a scratchpad in one revision bump. Returns `{ "project_id": number, "scratchpad_id": number, "revision": number }`. */
    mcp__solo__scratchpad_remove_tags: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Tag labels to remove in one revision bump. */
      tags: string[]
      expected_revision: number
    }
    /** Rename a scratchpad at an expected revision without rewriting its content. Returns `{ "project_id": number, "scratchpad_id": number, "revision": number, "name": string }`. */
    mcp__solo__scratchpad_rename: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      name: string
      expected_revision: number
    }
    /** Write one scratchpad to a filesystem path as UTF-8 text, including its title as a leading H1. Absolute paths are used as-is. Relative paths resolve inside the target project directory. */
    mcp__solo__scratchpad_save_to_file: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Filesystem path to write. Absolute paths are used as-is. Relative paths resolve inside the project directory. */
      path: string
    }
    /** List distinct scratchpad tags in a project. */
    mcp__solo__scratchpad_tags_list: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Return the last N lines of one scratchpad using tail-style line semantics. Defaults to 10 lines; pass `lines=0` for empty content with metadata. */
    mcp__solo__scratchpad_tail: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      /** Number of trailing lines to return. Defaults to 10. Use 0 for an empty tail response with metadata. */
      lines?: number
    }
    /** Move a scratchpad to another project at an expected revision. */
    mcp__solo__scratchpad_transfer: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id: number
      target_project_id: number
      /** Expected current revision of the source scratchpad. */
      expected_revision: number
    }
    /** Create/replace full scratchpad content and tags at expected_revision; prefer edit/append tools for targeted changes. Leading H1 overrides name as title. */
    mcp__solo__scratchpad_write: {
      /** Optional project scope override. */
      project_id?: number
      scratchpad_id?: number
      name: string
      content: string
      /** Optional tag labels applied to the scratchpad. */
      tags?: string[]
      /** Expected current revision. Omit or set null to create a new scratchpad. */
      expected_revision?: number
    }
    /** Search rendered terminal output for one process. Returns matching lines with 1-based row numbers. Defaults to 20 matches, max 100. */
    mcp__solo__search_output: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** The pattern to search for (case-insensitive substring match) */
      pattern: string
      /** Max matches to return (default 20, max 100). */
      max_results?: number
    }
    /** Search raw terminal output, including cleared/alternate-screen bytes; defaults to 20 matches, max 100. */
    mcp__solo__search_raw_output: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** The pattern to search for (case-insensitive substring match) */
      pattern: string
      /** Max matches to return (default 20, max 100). */
      max_results?: number
    }
    /** Select a process in the Solo UI so its terminal surface is attached and rendered. Supports an optional `project_id` override. */
    mcp__solo__select_process: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
    }
    /** Select which project later MCP tools should act on. */
    mcp__solo__select_project: {
      /** The project ID to select for this session */
      project_id: number
    }
    /** Send text or raw bytes to a running process. wait_ms returns latest rendered tail; clamped 250ms-10000ms. */
    mcp__solo__send_input: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** Text to type; appends newline unless submit=false. */
      input?: string
      /** Append newline after text. */
      submit?: boolean
      /** Raw PTY bytes, e.g. [13] Enter or [3] Ctrl-C; overrides input/submit. */
      bytes?: number[]
      /** Wait before returning output; clamped 250ms-10000ms. */
      wait_ms?: number
    }
    /** List project-local services detected from running processes. Useful for service discovery, readiness, health, and localhost URL/port lookup. Supports an optional `project_id` override. */
    mcp__solo__services_list: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Add or update Solo MCP docs in `CLAUDE.md` or `AGENTS.md` for the effective project scope. Supports an optional `project_id` override. */
    mcp__solo__setup_agent_integration: {
      /** Optional project scope override. */
      project_id?: number
      /** Target file: "claude" (CLAUDE.md) or "agents" (AGENTS.md). Default: "claude" */
      target?: string
    }
    /** Create a Solo agent from agent_tool_id, then send prompts with send_input. Alias for `spawn_process(kind="agent")`; returns process_id/name/agent_instructions. */
    mcp__solo__spawn_agent: {
      /** Optional project scope override. */
      project_id?: number
      /** The agent tool ID to use (from list_agent_tools). */
      agent_tool_id: number
      /** The environment-specific agent tool installation ID to use. Preferred when available from project-scoped runnable agent discovery. */
      agent_tool_installation_id?: number
      /** Optional custom name for the spawned agent. If omitted, an auto-generated name is used. */
      name?: string
      /** Optional per-launch arguments appended to the resolved agent command without mutating the saved agent tool defaults. */
      extra_args?: string[]
      /** Include caller-facing bootstrap instructions in the response. Defaults to true. */
      include_agent_instructions?: boolean
    }
    /** Create a terminal or agent. For agents, prefer spawn_agent or pass kind="agent" plus agent_tool_id. Returns process_id/name/agent_instructions; use send_input. */
    mcp__solo__spawn_process: {
      /** Optional project scope override. */
      project_id?: number
      /** The kind of process to spawn: "terminal" for an interactive shell, or "agent" for an agent process */
      kind: string
      /** For agents: the agent tool ID to use (from list_agent_tools). Ignored for terminals. */
      agent_tool_id?: number
      /** For agents: the environment-specific agent tool installation ID to use. Preferred when available from project-scoped runnable agent discovery. */
      agent_tool_installation_id?: number
      /** Optional custom name for the spawned process. If omitted, an auto-generated name is used. */
      name?: string
      /** For agents: optional per-launch arguments appended to the resolved agent command without mutating the saved agent tool defaults. */
      extra_args?: string[]
      /** For agents: include caller-facing bootstrap instructions in the response. Defaults to true. Ignored for terminals. */
      include_agent_instructions?: boolean
    }
    /** Start all trusted command processes in the effective project scope. Terminals and agents are skipped. Supports an optional `project_id` override. */
    mcp__solo__start_all_commands: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Start an existing command/terminal/agent by ID or name; commands must be trusted. Use spawn tools to create new processes. */
    mcp__solo__start_process: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
    }
    /** Gracefully stop all running command processes in the effective project scope. Terminals and agents are skipped. Supports an optional `project_id` override. */
    mcp__solo__stop_all_commands: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Gracefully stop one running process. */
    mcp__solo__stop_process: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
    }
    /** Open Solo's feedback form with a drafted bug, friction, or feature request. */
    mcp__solo__submit_solo_feedback: {
      /** Feedback about the Solo application itself. Include concrete bugs, friction, or feature requests. */
      message: string
      /** Optional email for follow-up from the Solo team. */
      email?: string
      /** When true, append MCP session and process context to the submitted message. Defaults to true. */
      include_context?: boolean
    }
    /** Cancel one pending timer owned by the current actor. Returns `{ "project_id": number, "timer_id": number, "cancelled": boolean }`. */
    mcp__solo__timer_cancel: {
      /** Optional project scope override. */
      project_id?: number
      timer_id: number
    }
    /** Wake when all watched processes are idle or max_wait_ms elapses; all-idle returns already_satisfied, so inspect and reschedule if needed; worker quiet, not service readiness; body becomes a fresh user turn. */
    mcp__solo__timer_fire_when_idle_all: {
      /** Optional project scope override. */
      project_id?: number
      /** Agent process to receive the timer body; defaults to this session. */
      delivery_process_id?: number
      /** Processes to watch for idle transitions: ID, name, or target object. */
      processes: Array<unknown /* $ref #/$defs/IdleTimerProcessParams */>
      /** Hard deadline in milliseconds. */
      max_wait_ms: number
      body: string
      metadata?: {}
    }
    /** Wake when any watched process is idle or max_wait_ms elapses; already-idle returns already_satisfied, so inspect and reschedule if needed; worker quiet, not service readiness; body becomes a fresh user turn. */
    mcp__solo__timer_fire_when_idle_any: {
      /** Optional project scope override. */
      project_id?: number
      /** Agent process to receive the timer body; defaults to this session. */
      delivery_process_id?: number
      /** Processes to watch for idle transitions: ID, name, or target object. */
      processes: Array<unknown /* $ref #/$defs/IdleTimerProcessParams */>
      /** Hard deadline in milliseconds. */
      max_wait_ms: number
      body: string
      metadata?: {}
    }
    /** List pending timers owned by the current actor. */
    mcp__solo__timer_list: {
      /** Optional project scope override. */
      project_id?: number
      limit?: number
    }
    /** Pause one pending timer owned by the current actor. Returns `{ "project_id": number, "timer_id": number, "paused": boolean }`. */
    mcp__solo__timer_pause: {
      /** Optional project scope override. */
      project_id?: number
      timer_id: number
    }
    /** Resume one paused timer owned by the current actor. Returns `{ "project_id": number, "timer_id": number, "resumed": boolean }`. */
    mcp__solo__timer_resume: {
      /** Optional project scope override. */
      project_id?: number
      timer_id: number
    }
    /** Schedule a one-shot or repeating agent timer (delay_ms, loop/repeat_every_ms); delivery_process_id targets another agent; body is injected as a fresh user turn. */
    mcp__solo__timer_set: {
      /** Optional project scope override. */
      project_id?: number
      /** Agent process to receive the timer body; defaults to this session. */
      delivery_process_id?: number
      /** Delay in milliseconds. */
      delay_ms: number
      /** Repeat using delay_ms as the interval. */
      loop?: boolean
      /** Repeat interval in milliseconds; omitted means one-shot. */
      repeat_every_ms?: number
      body: string
      metadata?: {}
    }
    /** Add one blocker without replacing other blockers; response_mode: slim summary or rich full todo. */
    mcp__solo__todo_add_blocker: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      blocker_id: number
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Add one tag without replacing other tags; response_mode: slim summary or rich full todo. */
    mcp__solo__todo_add_tag: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      tag: string
      /** Optional response shape. `slim` (default) returns `{ "project_id": number, "todo_id": number, "tag": string }`; `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Add a todo comment; response_mode: slim summary or rich full comment. */
    mcp__solo__todo_comment_create: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      body: string
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id", "comment_id" }`. `rich` returns the full comment payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Delete a todo comment; returns project_id, todo_id, and comment_id. */
    mcp__solo__todo_comment_delete: {
      /** Optional project scope override. */
      project_id?: number
      comment_id: number
    }
    /** List comments for a todo, optionally paginated with offset/limit. */
    mcp__solo__todo_comment_list: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      /** Zero-based list offset. */
      offset?: number
      /** Maximum number of comments to return. */
      limit?: number
    }
    /** Update a todo comment; response_mode: slim summary or rich full comment. */
    mcp__solo__todo_comment_update: {
      /** Optional project scope override. */
      project_id?: number
      comment_id: number
      body: string
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id", "comment_id" }`. `rich` returns the full comment payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Mark a todo complete/incomplete; releases lock unless release_lock=false. response_mode: slim summary or rich full todo. */
    mcp__solo__todo_complete: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      completed: boolean
      /** Whether completing the todo should release this actor's todo lock. Defaults to true. */
      release_lock?: boolean
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id", "completed", "affected_todo_ids" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Create a project-scoped todo item. Optional `response_mode`: `slim` (default) returns `{ "project_id": number, "todo_id": number }`; `rich` returns the full todo payload. */
    mcp__solo__todo_create: {
      /** Optional project scope override. */
      project_id?: number
      title: string
      body?: string
      priority?: string
      /** Optional tag labels applied to the todo. */
      tags?: string[]
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Delete a project-scoped todo item. Returns `{ "project_id": number, "todo_id": number, "affected_todo_ids": number[] }`. */
    mcp__solo__todo_delete: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
    }
    /** Read one todo and optionally include its comments. */
    mcp__solo__todo_get: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      /** Include comments in the response. */
      include_comments?: boolean
    }
    /** List todo summaries with filters/sort/pagination; defaults to 50 items, max 200. Use todo_get for full body/comments. */
    mcp__solo__todo_list: {
      /** Optional project scope override. */
      project_id?: number
      /** Filter by status. */
      status?: string
      /** Filter by completion state. */
      completed?: boolean
      /** Filter by unresolved blockers. */
      is_blocked?: boolean
      /** Filter by priority. */
      priority?: string
      /** Search todo title/body/comments. */
      query?: string
      /** Match any of these tags. */
      tags?: string[]
      /** Sort order. */
      sort?: string
      /** Zero-based list offset. */
      offset?: number
      /** Max todos to return (default 50, max 200). */
      limit?: number
    }
    /** Lock a todo for coordinated editing. Optional `response_mode`: `slim` (default) returns `{ "project_id": number, "todo_id": number }`; `rich` returns the full todo payload. */
    mcp__solo__todo_lock: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      /** Optional lease duration in seconds. Defaults to 300 for MCP callers. */
      lease_ttl_seconds?: number
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Remove one blocker without replacing other blockers; response_mode: slim summary or rich full todo. */
    mcp__solo__todo_remove_blocker: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      blocker_id: number
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Remove one tag without replacing other tags; response_mode: slim summary or rich full todo. */
    mcp__solo__todo_remove_tag: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      tag: string
      /** Optional response shape. `slim` (default) returns `{ "project_id": number, "todo_id": number, "tag": string }`; `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Replace a todo's full blocker list; response_mode: slim summary or rich full todo. */
    mcp__solo__todo_set_blockers: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      blocker_ids?: number[]
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** List distinct todo tags in a project. */
    mcp__solo__todo_tags_list: {
      /** Optional project scope override. */
      project_id?: number
    }
    /** Move a todo to another project, preserving comments/completion and clearing blockers/locks. response_mode: slim summary or rich full todo. */
    mcp__solo__todo_transfer: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      target_project_id: number
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id", "target_project_id", "affected_todo_ids" }`. `rich` returns the full transferred todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Release a todo edit lock you currently own. Optional `response_mode`: `slim` (default) returns `{ "project_id": number, "todo_id": number }`; `rich` returns the full todo payload. */
    mcp__solo__todo_unlock: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Update todo fields; omitted optional fields are preserved. response_mode: slim summary or rich full todo. */
    mcp__solo__todo_update: {
      /** Optional project scope override. */
      project_id?: number
      todo_id: number
      /** Optional title replacement. Omit to preserve the current title. */
      title?: string
      /** Optional body replacement. Omit to preserve the current body. */
      body?: string
      /** Optional priority replacement (`high`, `medium`, or `low`). Omit to preserve the current priority. */
      priority?: string
      /** Optional status replacement (`open`, `in_progress`, `backlog`, or `completed`). Omit to preserve the current status. */
      status?: string
      /** Optional tag labels applied to the todo. */
      tags?: string[]
      /** Optional response shape. `slim` (default) returns `{ "project_id", "todo_id" }`. `rich` returns the full todo payload. */
      response_mode?: unknown /* $ref #/$defs/TodoWriteResponseMode */
    }
    /** Patch prompt template name/description/body; omitted or null fields are preserved, scope is immutable. */
    mcp__solo__update_prompt_template: {
      template_id: number
      /** Optional replacement name. Omitted or null preserves the existing name. */
      name?: string
      /** Optional replacement description. Omitted or null preserves the existing description; an empty string clears it. */
      description?: string
      /** Optional replacement Markdown body. Omitted or null preserves the existing body; an empty string clears it. */
      body?: string
    }
    /** Update a Solo workspace. Pass workspace_id plus one or more of name, icon, or color. */
    mcp__solo__update_workspace: {
      /** Workspace row ID to update. */
      workspace_id: number
      /** Optional replacement workspace display name. */
      name?: string
      /** Optional replacement workspace icon initials. */
      icon?: string
      /** Optional replacement workspace color token. */
      color?: string
    }
    /** Wait for a project-local process to expose a bound port; optional process target and timeout. Use for dev-server readiness or URL lookup. */
    mcp__solo__wait_for_bound_port: {
      /** Optional project scope override. */
      project_id?: number
      /** Solo process ID target. */
      process_id?: number
      /** Solo process name target; numeric or <slug>--<id> also resolves. */
      process_name?: string
      /** Maximum time to wait in milliseconds. */
      timeout_ms?: number
    }
    /** Show this MCP session's identified Solo process, session-scoped actor, and effective project scope. Pass an OS PID only as a fallback when the session is not already identified. Pass verbose=true for expanded tool hints. */
    mcp__solo__whoami: {
      /** Optional host OS PID fallback (from $$ in shell or os.getpid() in Python). Ignored once this MCP session is already identified as a Solo process. */
      pid?: number
      /** Include expanded MCP tool hints such as starter-tool names and spawning workflow text. */
      verbose?: boolean
    }
  }
}
