# cline-copy-last

A Cline plugin that adds a **`/copy-last`** slash command to copy the last Cline session message (assistant response, user prompt, or conversation pair) to your clipboard as clean markdown.

![Cline Plugin](https://img.shields.io/badge/cline--plugin-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What it does

Type `/copy-last` in Cline's chat input and the plugin instantly copies the last message from your most recent Cline session to your clipboard — no selecting, no copying by hand.

| Command | Description |
|---------|-------------|
| `/copy-last` | Copy last assistant response |
| `/copy-last user` | Copy last user prompt |
| `/copy-last pair` | Copy last user-agent exchange |
| `/copy-last 3` | Copy last 3 assistant responses |
| `/copy-last user 5` | Copy last 5 user prompts |
| `/copy-last pair all` | Copy all user-agent pairs |

## Installation

### Via local install (development)

```bash
cline plugin install /path/to/cline-copy-last
```

### Via npm (once published)

```bash
cline plugin install npm:cline-copy-last
```

### Via GitHub

```bash
cline plugin install https://github.com/cline/cline-copy-last.git
```

## Requirements

- **Cline** CLI v3.x or SDK-based host (CLI, Kanban)
- **macOS**: `pbcopy` (built-in) for clipboard
- **Linux**: `xclip` (install via `sudo apt install xclip`) for clipboard
- **Node.js** >= 18.0 (for local development/testing)

## How it works

1. The plugin registers a **`/copy-last`** command via Cline's plugin API
2. When you type `/copy-last [target] [N]` in Cline's chat, the plugin intercepts it **before** it reaches the AI model
3. It reads your most recent Cline session from `~/.cline/data/sessions/`
4. Extracts messages matching the target (assistant/user/pair)
5. Formats them as clean markdown (strips internal metadata like `toolCall`, `toolResult`, `id`, `ts`)
6. Copies the result to your clipboard via `pbcopy` (macOS) or `xclip` (Linux)
7. Returns a confirmation message instead of sending `/copy-last` to the model

## Plugin structure

```
cline-copy-last/
├── index.js          # Plugin entry point (single file)
├── package.json      # npm package manifest with cline.plugins manifest
├── README.md         # This file
├── LICENSE           # MIT License
└── .gitignore        # Git ignore rules
```

## Manual clipboard test

You can also use the standalone CLI script (requires no Cline host):

```bash
# From any directory
cline-copy-last
cline-copy-last user
cline-copy-last pair all
```

## Development

### Prerequisites

```bash
npm install
```

### Test the plugin loads

```bash
npm test
```

### Install locally for testing

```bash
cline plugin install /path/to/cline-copy-last
```

### Uninstall

```bash
cline plugin uninstall cline-copy-last
```

## Publishing to npm

### npm authentication

1. Create an npm access token at https://www.npmjs.com/settings/-/tokens
2. Add it as a GitHub secret:
   ```bash
   gh secret set NPM_TOKEN
   ```
   Paste your npm token when prompted (values are encrypted at rest).

### Via GitHub Actions (auto-publish on version tag)

Push a version tag to trigger automatic publishing:

```bash
git tag v1.0.0
git push --tags
```

The `publish.yml` workflow will automatically run `npm publish` when a tag matching `v*` is pushed.

### Manual publish

```bash
npm login
npm publish --access public
```

## Building for npm publish

```bash
# Ensure everything is committed
git add . && git commit -m "Release v1.0.0"
git tag v1.0.0
git push --tags

# Publish
npm publish --access public
```

## Capabilities

This plugin uses the following Cline plugin capabilities:

| Capability | Purpose |
|------------|---------|
| `commands` | `api.registerCommand()` for `/copy-last` slash command |
| `hooks` | `beforeModel()` hook to intercept `/copy-last` before it reaches the model |

## Compatibility

Tested with:
- Cline CLI v3.x
- Cline SDK hosts

Should work with any Cline host that supports the plugin system (CLI, Kanban).

## Limitations

- **Clipboard**: Requires `pbcopy` (macOS, built-in) or `xclip` (Linux). Windows clipboard support not yet implemented.
- **Session detection**: Always uses the most recent session by modification time. If Cline has multiple concurrent sessions, only the latest is used.
- **No server clipboard**: Clipboard access is local only. Does not support remote sessions over SSH (unless SSH has local port forwarding for clipboard).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'Add my feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.
