import { CopyLastCommandParser } from "../../domain/command/copy-last-command-parser.service.js";
import { MarkdownMessageFormatter } from "../../domain/message/markdown-message-formatter.service.js";
import { MessageSelector } from "../../domain/message/message-selector.service.js";
import type { ClipboardWriter } from "../../domain/ports/clipboard-writer.port.js";
import type { SessionReader } from "../../domain/ports/session-reader.port.js";
import type { CopyLastRequest } from "./copy-last.request.js";
import { CopyLastResponse } from "./copy-last.response.js";

export class CopyLastUseCase {
  constructor(
    private readonly sessionReader: SessionReader,
    private readonly clipboardWriter: ClipboardWriter,
    private readonly commandParser: CopyLastCommandParser,
    private readonly messageSelector: MessageSelector,
    private readonly messageFormatter: MarkdownMessageFormatter,
  ) {}

  async execute(request: CopyLastRequest): Promise<CopyLastResponse> {
    const command = this.commandParser.parse(request.args);
    const messages = await this.sessionReader.read(request.sessionID, request.excludeMessageID);
    const selected = this.messageSelector.select(messages, command);
    const copiedText = this.messageFormatter.format(selected);
    await this.clipboardWriter.write(copiedText);

    return new CopyLastResponse(command, copiedText);
  }
}
