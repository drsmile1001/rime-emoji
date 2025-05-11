import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { deepClone } from "@/utils/deepClone";
import type { EmojiDefinitionRepo } from "./EmojiDefinitionRepo.Interface";

export class EmojiDefinitionRepoMemory implements EmojiDefinitionRepo {
  private store: EmojiDefinition[] = [];

  async getAll(): Promise<EmojiDefinition[]> {
    return deepClone(this.store);
  }

  async saveAll(defs: EmojiDefinition[]): Promise<void> {
    this.store = [...defs];
  }
}
