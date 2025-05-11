import type { EmojiAlias, SubgroupAlias } from "@/entities/CategoryAlias";
import type { CategoryAliasRepo } from "./CategoryAliasRepo.Interface";
import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { YamlFile } from "@/utils/YamlFile";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export type CategoryAliasYamlFileRaw = {
  name: string;
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

export type CategoryAliasYamlFileContent = {
  name: string;
  subGroups: {
    name: string;
    alias: string[];
    emojis: {
      emoji: string;
      name: string;
      alias: string[];
    }[];
  }[];
};

export class CategoryAliasRepoYaml implements CategoryAliasRepo {
  constructor(private readonly dir: string) {}

  private safeFileName(group: string): string {
    return `${encodeURIComponent(group).replace(/%/g, "_")}.yaml`;
  }

  async loadGroupContent(group: string): Promise<CategoryAliasYamlFileContent> {
    const file = new YamlFile<CategoryAliasYamlFileRaw>(
      this.dir,
      this.safeFileName(group),
      { name: group, subGroups: [] },
    );
    const existing = await file.read();

    const subGroups = existing.subGroups.map((sg) => ({
      name: sg.name,
      alias: sg.alias ? [sg.alias] : [],
      emojis: sg.emojis.map((e) => ({
        emoji: e.emoji,
        name: e.name,
        alias: e.alias ? [e.alias] : [],
      })),
    }));

    return {
      name: existing.name,
      subGroups,
    };
  }

  async saveGroupContent(group: string, context: CategoryAliasYamlFileContent) {
    const file = new YamlFile<CategoryAliasYamlFileRaw>(
      this.dir,
      this.safeFileName(group),
      { name: group, subGroups: [] },
    );
    const raw = {
      name: context.name,
      subGroups: context.subGroups.map((sg) => ({
        name: sg.name,
        alias: sg.alias.length > 0 ? sg.alias.join(" ") : undefined,
        emojis: sg.emojis.map((e) => ({
          emoji: e.emoji,
          name: e.name,
          alias: e.alias.length > 0 ? e.alias.join(" ") : undefined,
        })),
      })),
    };
    await file.write(raw);
  }

  async mergeDefinitions(defs: EmojiDefinition[]): Promise<void> {
    // 先將 defs 按 group 分組
    const grouped = new Map<string, EmojiDefinition[]>();
    for (const def of defs) {
      if (!grouped.has(def.group)) grouped.set(def.group, []);
      grouped.get(def.group)!.push(def);
    }

    for (const [group, mergeDefs] of grouped) {
      // 讀取現有的 YAML 檔案
      const existing = await this.loadGroupContent(group);

      // 合併 emoji 依據 subgroup 分組
      const subgroupMap = new Map<string, EmojiDefinition[]>();
      for (const mergeDef of mergeDefs) {
        if (!subgroupMap.has(mergeDef.subgroup))
          subgroupMap.set(mergeDef.subgroup, []);
        subgroupMap.get(mergeDef.subgroup)!.push(mergeDef);
      }

      const mergedSubGroups = Array.from(subgroupMap.entries()).map(
        ([subgroup, mergeDefs]) => {
          const existingGroup = existing.subGroups.find(
            (g) => g.name === subgroup,
          );
          const existingEmojis = existingGroup?.emojis ?? [];
          const existingEmojiMap = new Map<
            string,
            (typeof existingEmojis)[number]
          >();
          for (const existingEmoji of existingEmojis)
            existingEmojiMap.set(existingEmoji.emoji, existingEmoji);

          for (const mergeDef of mergeDefs) {
            if (!existingEmojiMap.has(mergeDef.emoji)) {
              existingEmojiMap.set(mergeDef.emoji, {
                emoji: mergeDef.emoji,
                name: mergeDef.name,
                alias: [],
              });
            }
          }

          return {
            name: subgroup,
            alias: existingGroup?.alias ?? [],
            emojis: Array.from(existingEmojiMap.values()),
          };
        },
      );

      const merged: CategoryAliasYamlFileContent = {
        name: group,
        subGroups: mergedSubGroups,
      };

      await this.saveGroupContent(group, merged);
    }
  }

  async getEmojiByGroup(group: string): Promise<EmojiDefinition[]> {
    const yaml = await this.loadGroupContent(group);
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
    const yaml = await this.loadGroupContent(group);
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
      const yaml = await this.loadGroupContent(group);
      if (!yaml) continue;
      for (const sg of yaml.subGroups) {
        for (const e of sg.emojis) {
          result.push({ emoji: e.emoji, alias: e.alias ?? "" });
        }
      }
    }
    return result;
  }

  async getSubgroupAliases(): Promise<SubgroupAlias[]> {
    const groups = await this.getAllGroups();
    const result: SubgroupAlias[] = [];
    for (const group of groups) {
      const yaml = await this.loadGroupContent(group);
      if (!yaml) continue;
      for (const sg of yaml.subGroups) {
        result.push({
          group: yaml.name,
          subgroup: sg.name,
          alias: sg.alias,
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

  patchSubgroupAliases(aliases: SubgroupAlias[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  patchEmojiAliases(aliases: EmojiAlias[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
