import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { CategoryAliasRepo } from "./CategoryAliasRepo.Interface";
import type { EmojiAlias, SubgroupAlias } from "@/entities/CategoryAlias";

export class CategoryAliasRepoMemory implements CategoryAliasRepo {
  private emojiDefs: EmojiDefinition[] = [];

  private subgroupAliasMap = new Map<string, string[]>(); // `${group}:::${subgroup}` → alias[]
  private emojiAliasMap = new Map<string, string[]>(); // emoji → alias[]

  async mergeDefinitions(defs: EmojiDefinition[]): Promise<void> {
    this.emojiDefs = [...defs];

    for (const def of defs) {
      const subgroupKey = this.encodeSubgroupKey(def.group, def.subgroup);
      if (!this.subgroupAliasMap.has(subgroupKey)) {
        this.subgroupAliasMap.set(subgroupKey, []);
      }

      if (!this.emojiAliasMap.has(def.emoji)) {
        this.emojiAliasMap.set(def.emoji, []);
      }
    }
  }

  async patchSubgroupAliases(aliases: SubgroupAlias[]): Promise<void> {
    for (const { group, subgroup, alias } of aliases) {
      const key = this.encodeSubgroupKey(group, subgroup);
      this.subgroupAliasMap.set(key, alias);
    }
  }

  async patchEmojiAliases(aliases: EmojiAlias[]): Promise<void> {
    for (const { emoji, alias } of aliases) {
      this.emojiAliasMap.set(emoji, alias);
    }
  }

  async getSubgroupAliases(): Promise<SubgroupAlias[]> {
    const seen = new Set<string>();
    const result: SubgroupAlias[] = [];

    for (const def of this.emojiDefs) {
      const key = this.encodeSubgroupKey(def.group, def.subgroup);
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          group: def.group,
          subgroup: def.subgroup,
          alias: this.subgroupAliasMap.get(key) ?? [],
        });
      }
    }

    return result;
  }

  async getEmojiAliases(): Promise<EmojiAlias[]> {
    return this.emojiDefs.map((def) => ({
      emoji: def.emoji,
      alias: this.emojiAliasMap.get(def.emoji) ?? [],
    }));
  }

  async getEmojiBySubgroup(
    group: string,
    subgroup: string,
  ): Promise<EmojiDefinition[]> {
    return this.emojiDefs.filter(
      (def) => def.group === group && def.subgroup === subgroup,
    );
  }

  private encodeSubgroupKey(group: string, subgroup: string): string {
    return `${group}:::${subgroup}`;
  }

  getDefinitions(): Promise<EmojiDefinition[]> {
    return Promise.resolve(this.emojiDefs);
  }
}
