import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { MessageId } from "../../domain/message/message-id.value-object.js";
import type { SessionMessage } from "../../domain/message/session-message.js";
import type { SessionReader } from "../../domain/ports/session-reader.port.js";
import type { ClineSessionMessageMapperContract } from "./cline-session-message.mapper.js";

export interface ClineSessionReaderOptions {
  /** Override for tests. Defaults to `~/.cline/data/sessions`. */
  sessionsDir?: string;
}

/**
 * Reads Cline session messages from disk.
 *
 * Layout: `~/.cline/data/sessions/<sessionId>/<sessionId>.messages.json`
 * with shape `{ messages: [{ id, role, content, ts }] }`.
 *
 * When a `sessionID` matches a directory on disk it is read directly.
 * Otherwise the most recently modified `*.messages.json` file is used — this
 * mirrors the previous single-file plugin behaviour and keeps `/copy-last`
 * working when the host does not forward a session id.
 */
export class ClineSessionReader implements SessionReader {
  private readonly sessionsDir: string;

  constructor(
    private readonly mapper: ClineSessionMessageMapperContract,
    options: ClineSessionReaderOptions = {},
  ) {
    this.sessionsDir = options.sessionsDir ?? path.join(homedir(), ".cline", "data", "sessions");
  }

  async read(sessionID: string, excludeMessageID?: MessageId): Promise<SessionMessage[]> {
    const file = await this.resolveMessagesFile(sessionID);
    if (!file) {
      return [];
    }
    let raw: unknown;
    try {
      raw = JSON.parse(await fs.readFile(file, "utf-8"));
    } catch {
      return [];
    }
    const entries = this.toEntries(raw);
    return entries.flatMap((entry) => this.mapper.toSessionMessages(entry, excludeMessageID));
  }

  private toEntries(raw: unknown): unknown[] {
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw && typeof raw === "object") {
      const record = raw as Record<string, unknown>;
      if (Array.isArray(record.messages)) {
        return record.messages;
      }
    }
    return [];
  }

  private async resolveMessagesFile(sessionID: string): Promise<string | undefined> {
    const direct = path.join(this.sessionsDir, sessionID, `${sessionID}.messages.json`);
    try {
      const stat = await fs.stat(direct);
      if (stat.isFile()) {
        return direct;
      }
    } catch {
      // fall through to most-recent scan
    }
    return this.findMostRecentMessagesFile();
  }

  private async findMostRecentMessagesFile(): Promise<string | undefined> {
    let lastFile: string | undefined;
    let lastMtime = 0;
    let dirs: string[];
    try {
      dirs = await fs.readdir(this.sessionsDir);
    } catch {
      return undefined;
    }
    for (const dir of dirs) {
      const dirPath = path.join(this.sessionsDir, dir);
      let stat;
      try {
        stat = await fs.stat(dirPath);
      } catch {
        continue;
      }
      if (!stat.isDirectory()) {
        continue;
      }
      let files: string[];
      try {
        files = await fs.readdir(dirPath);
      } catch {
        continue;
      }
      for (const file of files.filter((f) => f.endsWith(".messages.json"))) {
        const filePath = path.join(dirPath, file);
        try {
          const fileStat = await fs.stat(filePath);
          if (fileStat.mtimeMs > lastMtime) {
            lastMtime = fileStat.mtimeMs;
            lastFile = filePath;
          }
        } catch {
          continue;
        }
      }
    }
    return lastFile;
  }
}
