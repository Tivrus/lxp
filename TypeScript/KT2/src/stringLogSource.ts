import type { ILogSource } from "./interfaces.js";

export class StringLogSource implements ILogSource {
  private readonly content: string;
  constructor(content: string) {
    this.content = content;
  }

  readLines(): string[] {
    return this.content.split('\n').filter((line) => line.length > 0);
  }
}
