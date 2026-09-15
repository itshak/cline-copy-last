import { CopyTarget } from "../../domain/command/copy-target.js";
import type { MessageId } from "../../domain/message/message-id.value-object.js";
import { SessionMessage, type SessionMessageRole } from "../../domain/message/session-message.js";
import type { ClineValueReader } from "./cline-value-reader.js";

export interface ClineSessionMessageMapperContract {
  toSessionMessages(entry: unknown, excludeMessageID?: MessageId): SessionMessage[]
}

/**
 * Maps raw Cline session entries (`~/.cline/data/sessions/<id>/<id>.messages.json`)
 * to domain {@link SessionMessage}s.
 *
 * Cline message shape:
 * ```json
 * { "id": "msg_...", "role": "user" | "assistant", "content": [{ "type": "text", "text": "..." }], "ts": 123 }
 * ```
 *
 * Only `type: "text"` parts are copied — `thinking`, `tool_use`,
 * `tool_result`, images and other block types are skipped, mirroring the
 * OpenCode mapper which only copies `type: "text"` parts. Entries without
 * any text content are dropped. Roles are normalized through
 * {@link CopyTarget.fromAlias} so `assistant` maps to the `agent` copy target.
 *
 * The mapper also understands the OpenCode envelope (`{ info, parts }`) so
 * fixtures shared with the upstream project keep working.
 */
export class ClineSessionMessageMapper implements ClineSessionMessageMapperContract {
  constructor(private readonly valueReader: ClineValueReader) { }

  toSessionMessages(entry: unknown, excludeMessageID?: MessageId): SessionMessage[] {
    if (!this.valueReader.isRecord(entry)) {
      return [];
    }

    const info = this.valueReader.isRecord(entry.info) ? entry.info : entry;
    const id = this.valueReader.string(info.id) ?? this.valueReader.string(info.messageID);
    if (excludeMessageID?.equals(id)) {
      return [];
    }

    const role = this.normalizeRole(this.valueReader.string(info.role) ?? this.valueReader.string(info.author));
    if (!role) {
      return [];
    }

    const content = this.extractContent(entry).trim();
    if (!content) {
      return [];
    }

    const time = this.valueReader.isRecord(info.time) ? info.time : undefined;
    return [SessionMessage.create({ id, role, content, createdAt: this.valueReader.string(info.createdAt) ?? this.valueReader.string(time?.created) ?? this.timestamp(info.ts) })];
  }

  private timestamp(value: unknown): string | undefined {
    return typeof value === "number" ? new Date(value).toISOString() : undefined;
  }

  private extractContent(entry: Record<string, unknown>): string {
    const direct = this.valueReader.string(entry.content) ?? this.valueReader.string(entry.text);
    if (direct) {
      return direct;
    }

    const info = this.valueReader.isRecord(entry.info) ? entry.info : undefined;
    const infoText = info ? this.valueReader.string(info.content) ?? this.valueReader.string(info.text) : undefined;
    if (infoText) {
      return infoText;
    }

    // Cline stores blocks in `content: [...]`; OpenCode uses `parts: [...]`. Support both.
    const blocks = Array.isArray(entry.content) ? entry.content : Array.isArray(entry.parts) ? entry.parts : undefined;
    if (!blocks) {
      return "";
    }
    return blocks.map((part) => this.extractPartText(part)).filter(Boolean).join("\n\n");
  }

  private extractPartText(part: unknown): string {
    if (typeof part === "string") {
      return part;
    }
    if (!this.valueReader.isRecord(part)) {
      return "";
    }
    const type = this.valueReader.string(part.type);
    if (type && type !== "text") {
      return "";
    }
    return this.valueReader.string(part.text) ?? this.valueReader.string(part.content) ?? "";
  }

  private normalizeRole(role: string | undefined): SessionMessageRole | undefined {
    return role ? CopyTarget.fromAlias(role)?.toMessageRole() : undefined;
  }
}
