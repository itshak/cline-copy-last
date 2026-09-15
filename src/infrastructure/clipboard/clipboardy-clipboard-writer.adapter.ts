import clipboardy from "clipboardy";
import type { ClipboardWriter } from "../../domain/ports/clipboard-writer.port.js";

export class ClipboardyClipboardWriter implements ClipboardWriter {
  async write(text: string): Promise<void> {
    await clipboardy.write(text);
  }
}
