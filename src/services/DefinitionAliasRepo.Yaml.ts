import type {
  EmojiAlias,
  GroupAlias,
  SubgroupAlias,
} from "@/entities/DefinitionAlias";
import type { DefinitionAliasRepo } from "./DefinitionAliasRepo.Interface";
import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { YamlFile } from "@/utils/YamlFile";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * YAML 檔案格式定義
 */
export type YamlDefinitionAlias = {
  name: string;
  alias?: string;
  subGroups: {
    name: string;
    alias?: string;
    emojis: {
      emoji: string;
      name: string;
      alias?: string;
    }[];
  }[];
};

export class YamlDefinitionAliasRepo implements DefinitionAliasRepo {
  constructor(private readonly dir: string) {}

  private safeFileName(group: string): string {
    return `${encodeURIComponent(group).replace(/%/g, "_")}.yaml`;
  }

  async saveDefinitions(defs: EmojiDefinition[]): Promise<void> {
    const grouped = new Map<string, EmojiDefinition[]>();
    for (const def of defs) {
      if (!grouped.has(def.group)) grouped.set(def.group, []);
      grouped.get(def.group)!.push(def);
    }

    for (const [group, items] of grouped) {
      const file = new YamlFile<YamlDefinitionAlias>(
        this.dir,
        this.safeFileName(group),
        { name: group, subGroups: [] },
      );
      const existing = await file.read();

      const subgroupMap = new Map<string, EmojiDefinition[]>();
      for (const def of items) {
        if (!subgroupMap.has(def.subgroup)) subgroupMap.set(def.subgroup, []);
        subgroupMap.get(def.subgroup)!.push(def);
      }

      const mergedSubGroups = Array.from(subgroupMap.entries()).map(
        ([subgroup, defs]) => {
          const existingGroup = existing.subGroups.find(
            (g) => g.name === subgroup,
          );
          const existingEmojis = existingGroup?.emojis ?? [];
          const emojiMap = new Map<string, (typeof existingEmojis)[number]>();
          for (const e of existingEmojis) emojiMap.set(e.emoji, e);

          for (const def of defs) {
            if (!emojiMap.has(def.emoji)) {
              emojiMap.set(def.emoji, { emoji: def.emoji, name: def.name });
            }
          }

          return {
            name: subgroup,
            alias: existingGroup?.alias,
            emojis: Array.from(emojiMap.values()),
          };
        },
      );

      const merged: YamlDefinitionAlias = {
        name: group,
        alias: existing.alias,
        subGroups: mergedSubGroups,
      };

      await file.write(merged);
    }
  }

  async getEmojiByGroup(group: string): Promise<EmojiDefinition[]> {
    const yaml = await this.loadYaml(group);
    if (!yaml) return [];
    return yaml.subGroups.flatMap((sg) =>
      sg.emojis.map((e) => ({
        emoji: e.emoji,
        name: e.name,
        group: yaml.name,
        subgroup: sg.name,
        codePoints: [],
      })),
    );
  }

  async getEmojiBySubgroup(
    group: string,
    subgroup: string,
  ): Promise<EmojiDefinition[]> {
    const yaml = await this.loadYaml(group);
    if (!yaml) return [];
    const sg = yaml.subGroups.find((g) => g.name === subgroup);
    if (!sg) return [];
    return sg.emojis.map((e) => ({
      emoji: e.emoji,
      name: e.name,
      group: yaml.name,
      subgroup: sg.name,
      codePoints: [],
    }));
  }

  async getEmojiAliases(): Promise<EmojiAlias[]> {
    const result: EmojiAlias[] = [];
    const groups = await this.getAllGroups();
    for (const group of groups) {
      const yaml = await this.loadYaml(group);
      if (!yaml) continue;
      for (const sg of yaml.subGroups) {
        for (const e of sg.emojis) {
          result.push({ emoji: e.emoji, alias: e.alias ?? "" });
        }
      }
    }
    return result;
  }

  async getGroupAliases(): Promise<GroupAlias[]> {
    const groups = await this.getAllGroups();
    const result: GroupAlias[] = [];
    for (const group of groups) {
      const yaml = await this.loadYaml(group);
      if (yaml) {
        result.push({ group: yaml.name, alias: yaml.alias ?? "" });
      }
    }
    return result;
  }

  async getSubgroupAliases(): Promise<SubgroupAlias[]> {
    const groups = await this.getAllGroups();
    const result: SubgroupAlias[] = [];
    for (const group of groups) {
      const yaml = await this.loadYaml(group);
      if (!yaml) continue;
      for (const sg of yaml.subGroups) {
        result.push({
          group: yaml.name,
          subgroup: sg.name,
          alias: sg.alias ?? "",
        });
      }
    }
    return result;
  }

  // --- helpers ---
  private async getAllGroups(): Promise<string[]> {
    const files = await readdir(this.dir);
    const result: string[] = [];
    for (const f of files) {
      if (!f.endsWith(".yaml")) continue;
      const filePath = join(this.dir, f);
      const st = await stat(filePath);
      if (!st.isFile()) continue;
      const encoded = f.replace(/\.yaml$/, "").replace(/_/g, "%");
      result.push(decodeURIComponent(encoded));
    }
    return result;
  }

  private async loadYaml(
    group: string,
  ): Promise<YamlDefinitionAlias | undefined> {
    const file = new YamlFile<YamlDefinitionAlias>(
      this.dir,
      this.safeFileName(group),
      { name: group, subGroups: [] },
    );
    const result = await file.read();
    if (!result || !result.name || !Array.isArray(result.subGroups))
      return undefined;
    return result;
  }

  patchGroupAliases(aliases: GroupAlias[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  patchSubgroupAliases(aliases: SubgroupAlias[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  patchEmojiAliases(aliases: EmojiAlias[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
