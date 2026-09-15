import type { AgentPlugin, Message } from "@cline/core";
import type { AgentExtensionApi, PluginSetupContext } from "@cline/shared";
import type { AgentTool } from "@cline/core";
import { CopyLastRequest } from "./application/copy-last/copy-last.request.js";
import { CopyLastUseCase } from "./application/copy-last/copy-last.use-case.js";
import { CopyLastCommandParser } from "./domain/command/copy-last-command-parser.service.js";
import { isCopyLastError } from "./domain/errors/copy-last.error.js";
import { MarkdownMessageFormatter } from "./domain/message/markdown-message-formatter.service.js";
import { MessageId } from "./domain/message/message-id.value-object.js";
import { MessageSelector } from "./domain/message/message-selector.service.js";
import { ClipboardyClipboardWriter } from "./infrastructure/clipboard/clipboardy-clipboard-writer.adapter.js";
import { ClineCommandEventMapper } from "./infrastructure/cline/cline-command-event.mapper.js";
import { ClineCommandEventParser } from "./infrastructure/cline/cline-command-event-parser.adapter.js";
import { ClineNotifier } from "./infrastructure/cline/cline-notifier.adapter.js";
import { ClineSessionMessageMapper } from "./infrastructure/cline/cline-session-message.mapper.js";
import { ClineSessionReader } from "./infrastructure/cline/cline-session-reader.adapter.js";
import { ClineValueReader } from "./infrastructure/cline/cline-value-reader.js";

/**
 * Cline port of `@jfrz38/opencode-copy-last`.
 *
 * Domain + application layers are verbatim copies of the upstream OpenCode
 * plugin; only the infrastructure adapters are Cline-specific:
 *
 * - `ClineSessionReader` reads `~/.cline/data/sessions/<id>/<id>.messages.json`
 *   instead of calling `client.session.messages`.
 * - `ClineSessionMessageMapper` normalizes Cline `{ id, role, content, ts }`
 *   entries (plus the OpenCode `{ info, parts }` envelope for fixtures).
 * - `ClineCommandEventMapper` normalizes the `registerCommand` handler input.
 * - `ClineNotifier` formats the same `Copied … to clipboard` confirmation;
 *   Cline surfaces the handler's return value in chat.
 *
 * Usage: `/copy-last [agent|user|pair] [count|all]` (aliases: `me` -> `user`, `us` -> `pair`).
 */
const valueReader = new ClineValueReader();
const commandEventParser = new ClineCommandEventParser(new ClineCommandEventMapper(valueReader));
const sessionMessageMapper = new ClineSessionMessageMapper(valueReader);
const sessionReader = new ClineSessionReader(sessionMessageMapper);
const clipboardWriter = new ClipboardyClipboardWriter();
const notifier = new ClineNotifier();
const useCase = new CopyLastUseCase(
  sessionReader,
  clipboardWriter,
  new CopyLastCommandParser(),
  new MessageSelector(),
  new MarkdownMessageFormatter(),
);

const plugin: AgentPlugin = {
  name: "cline-copy-last",
  manifest: {
    capabilities: ["commands"],
  },
  setup(api: AgentExtensionApi<AgentTool, Message[]>, ctx: PluginSetupContext) {
    api.registerCommand({
      name: "copy-last",
      description: "Copy recent session messages to the clipboard",
      handler: async (input: string) => {
        const event = commandEventParser.parse(input) ?? {
          sessionID: ctx.session?.sessionId ?? "",
          arguments: input,
          messageID: undefined,
        };
        const sessionID = event.sessionID || ctx.session?.sessionId || "current";
        try {
          const result = await useCase.execute(
            new CopyLastRequest(event.arguments, sessionID, event.messageID),
          );
          await notifier.success(result.command);
          return notifier.getLastMessage();
        } catch (error) {
          const message = isCopyLastError(error) ? error.message : "Failed to copy messages";
          await notifier.error(message);
          return notifier.getLastMessage();
        }
      },
    });
    ctx.logger?.log?.("[cline-copy-last] /copy-last command registered");
  },
};

export default plugin;
export { MessageId };
