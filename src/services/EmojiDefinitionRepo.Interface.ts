import type { EmojiDefinition } from "@/entities/EmojiDefinition";

export interface EmojiDefinitionRepo {
  getAll(): Promise<EmojiDefinition[]>;
  saveAll(defs: EmojiDefinition[]): Promise<void>;
}
