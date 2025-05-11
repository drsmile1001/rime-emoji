import type {
  EmojiAlias,
  GroupAlias,
  SubgroupAlias,
} from "@/entities/DefinitionAlias";
import type { DefinitionAliasRepo } from "./DefinitionAliasRepo.Interface";
import type { EmojiDefinition } from "@/entities/EmojiDefinition";

export class MemoryDefinitionAliasRepo implements DefinitionAliasRepo {
  private emojiDefs: EmojiDefinition[] = [];

  private groupAliasMap = new Map<string, string>(); // group → alias
  private subgroupAliasMap = new Map<string, string>(); // `${group}:::${subgroup}` → alias
  private emojiAliasMap = new Map<string, string>(); // emoji → alias

  async saveDefinitions(defs: EmojiDefinition[]): Promise<void> {
    this.emojiDefs = [...defs];

    // 初始化 alias 為空（但不清除 patch 過的 alias）
    for (const def of defs) {
      if (!this.groupAliasMap.has(def.group)) {
        this.groupAliasMap.set(def.group, "");
      }

      const subgroupKey = this.encodeSubgroupKey(def.group, def.subgroup);
      if (!this.subgroupAliasMap.has(subgroupKey)) {
        this.subgroupAliasMap.set(subgroupKey, "");
      }

      if (!this.emojiAliasMap.has(def.emoji)) {
        this.emojiAliasMap.set(def.emoji, "");
      }
    }
  }

  async patchGroupAliases(aliases: GroupAlias[]): Promise<void> {
    for (const { group, alias } of aliases) {
      this.groupAliasMap.set(group, alias);
    }
  }

  async patchSubgroupAliases(aliases: SubgroupAlias[]): Promise<void> {
    for (const { group, subgroup, alias } of aliases) {
      this.subgroupAliasMap.set(this.encodeSubgroupKey(group, subgroup), alias);
    }
  }

  async patchEmojiAliases(aliases: EmojiAlias[]): Promise<void> {
    for (const { emoji, alias } of aliases) {
      this.emojiAliasMap.set(emoji, alias);
    }
  }

  async getGroupAliases(): Promise<GroupAlias[]> {
    return Array.from(this.groupAliasMap.entries()).map(([group, alias]) => ({
      group,
      alias,
    }));
  }

  async getSubgroupAliases(): Promise<SubgroupAlias[]> {
    const result: SubgroupAlias[] = [];
    for (const def of this.emojiDefs) {
      const key = this.encodeSubgroupKey(def.group, def.subgroup);
      const alias = this.subgroupAliasMap.get(key) ?? "";
      if (
        !result.some(
          (r) => r.group === def.group && r.subgroup === def.subgroup,
        )
      ) {
        result.push({
          group: def.group,
          subgroup: def.subgroup,
          alias,
        });
      }
    }
    return result;
  }

  async getEmojiAliases(): Promise<EmojiAlias[]> {
    return this.emojiDefs.map((def) => ({
      emoji: def.emoji,
      alias: this.emojiAliasMap.get(def.emoji) ?? "",
    }));
  }

  async getEmojiByGroup(group: string): Promise<EmojiDefinition[]> {
    return this.emojiDefs.filter((def) => def.group === group);
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
}
