# Cline Copy Last

[![npm](https://img.shields.io/npm/v/cline-copy-last)](https://www.npmjs.com/package/cline-copy-last)
[![license](https://img.shields.io/npm/l/cline-copy-last)](https://github.com/itshak/cline-copy-last/blob/main/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/cline-copy-last)](https://www.npmjs.com/package/cline-copy-last)

Copy the latest agent, user, or user-agent exchange from your current Cline session directly to the clipboard.

Cline port of [`@jfrz38/opencode-copy-last`](https://github.com/jfrz38/opencode-copy-last) — same syntax, same output format, same behaviour. Only the session/clipboard adapters are Cline-specific.

## Why?

`cline-copy-last` is a small Cline plugin for quickly reusing recent conversation context without selecting text manually.

It helps when you want to:

- Paste the last agent answer into an issue, PR, note, or chat.
- Copy your latest prompt exactly as you wrote it.
- Export recent user-agent exchanges as clean Markdown.
- Keep useful context before restarting Cline, switching branches, or moving to another tool.

## Install

Install via CLI (local path):

```bash
cline plugin install ./cline-copy-last
```

Install from npm (once published):

```bash
cline plugin install npm:cline-copy-last
```

Install from git:

```bash
cline plugin install https://github.com/itshak/cline-copy-last.git
```

Or drop the built plugin into a discovery folder:

```bash
mkdir -p .cline/plugins
cp -r cline-copy-last .cline/plugins/
```

Restart Cline after changing plugin configuration.

## Usage

```text
/copy-last [agent|user|pair] [count|all]
```

By default, it copies the latest agent message:

```text
/copy-last
```

## Examples

Copy the latest agent response:

```text
/copy-last
```

Copy the latest two agent responses:

```text
/copy-last agent 2
```

Copy your latest prompt:

```text
/copy-last user
```

Copy the latest three user-agent exchanges:

```text
/copy-last pair 3
```

Copy all complete user-agent exchanges:

```text
/copy-last pair all
```

Use shorter aliases when you prefer:

```text
/copy-last me
/copy-last us 2
```

## Targets

- `agent`: copies the latest assistant/agent messages.
- `user`: copies the latest user messages.
- `pair`: copies complete user-agent exchanges.
- `me`: alias for `user`.
- `us`: alias for `pair`.

`you` is intentionally unsupported because it is ambiguous.

## Count

- `count`: copies the latest matching messages or pairs, from `1` to `20`.
- `all`: copies every matching message or complete pair for the selected target.

## Output Format

Single messages are copied as trimmed Markdown content.

Pairs are copied like this:

```md
## User

Your prompt here

## Agent

The agent response here
```

Multiple copied items are separated with a Markdown horizontal rule:

```md
---
```

## How It Works

The plugin registers the `/copy-last` command with Cline via `api.registerCommand`. When you run `/copy-last`, the handler reads the current Cline session from `~/.cline/data/sessions/<sessionId>/<sessionId>.messages.json` (falling back to the most recently modified session when no session id is forwarded), selects the requested messages, formats them as Markdown, copies the result to the clipboard via `clipboardy`, and returns a `Copied … to clipboard` confirmation.

Because the command is handled locally by the plugin, running `/copy-last` does not send a new prompt to the model.

Only `type: "text"` blocks are copied — `thinking`, `tool_use`, `tool_result` and other block types are skipped, and the `/copy-last` invocation itself is excluded.

## Development

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

Or run everything with:

```bash
npm run check
```

## Plugin structure

```text
cline-copy-last/
├── src/
│   ├── index.ts                                    # Cline AgentPlugin entry (registerCommand)
│   ├── application/copy-last/                      # request / response / use-case (upstream verbatim)
│   ├── domain/command/                             # target, count, parser (upstream verbatim)
│   ├── domain/message/                             # role, message, selector, formatter (upstream verbatim)
│   ├── domain/ports/                               # session-reader, clipboard, notifier ports (verbatim)
│   ├── domain/errors/                              # typed errors (upstream verbatim)
│   └── infrastructure/
│       ├── clipboard/                              # clipboardy writer (upstream verbatim)
│       └── cline/                                  # Cline adapters (session reader/mapper, command mapper, notifier)
├── test/                                           # vitest suites (domain/app verbatim, infra ported to Cline)
├── package.json                                    # ESM + cline.plugins manifest (capabilities: ["commands"])
└── README.md
```

## Compatibility

- Cline CLI / SDK / Kanban hosts that support `api.registerCommand` with the `commands` capability.
- Node.js >= 20.
- Clipboard via [`clipboardy`](https://www.npmjs.com/package/clipboardy) (macOS, Linux, Windows).

## License

MIT License — see [LICENSE](LICENSE) for details. Upstream project: [@jfrz38/opencode-copy-last](https://github.com/jfrz38/opencode-copy-last) (MIT).
