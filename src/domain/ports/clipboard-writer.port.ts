export interface ClipboardWriter {
  write(text: string): Promise<void>
}
