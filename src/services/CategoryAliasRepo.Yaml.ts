import type { EmojiAlias, SubgroupAlias } from "@/entities/CategoryAlias";
import type { CategoryAliasRepo } from "./CategoryAliasRepo.Interface";
import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { YamlFile } from "@/utils/YamlFile";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { toCodePoints } from "@/utils/CodePoints";

export type CategoryAliasYamlFileRaw = {
  group: string;
  subgroup: string;
  alias?: string;
  emojis: {
    emoji: string;
    name: string;
    alias?: string;
  }[];
};

export type CategoryAliasYamlFileContent = {
  group: string;
  subgroup: string;
  alias: string[];
  emojis: {
    emoji: string;
    name: string;
    alias: string[];
  }[];
};

export class CategoryAliasRepoYaml implements CategoryAliasRepo {
  constructor(private readonly dir: string) {}

  private buildFileName(group: string, subgroup: string): string {
    return `${encodeURIComponent(`${group}__${subgroup}`).replace(
      /%/g,
      "_",
    )}.yaml`;
  }

  async loadContent(fileName: string): Promise<CategoryAliasYamlFileContent> {
    const file = new YamlFile<CategoryAliasYamlFileRaw>(this.dir, fileName, {
      group: "",
      subgroup: "",
      emojis: [],
    });
    const existing = await file.read();

    const emojis = existing.emojis.map((e) => ({
      emoji: e.emoji,
      name: e.name,
      alias: this.rawAliasToAlias(e.alias),
    }));

    return {
      group: existing.group,
      subgroup: existing.subgroup,
      alias: this.rawAliasToAlias(existing.alias),
      emojis,
    };
  }

  aliasToRawAlias(alias: string[]): string | undefined {
    if (alias.length === 0) return undefined;
    return alias.join(" ");
  }

  rawAliasToAlias(raw: string | undefined): string[] {
    if (!raw) return [];
    return raw.split(" ");
  }

  async saveGroupContent(
    fileName: string,
    context: CategoryAliasYamlFileContent,
  ) {
    const file = new YamlFile<CategoryAliasYamlFileRaw>(this.dir, fileName, {
      group: "",
      subgroup: "",
      emojis: [],
    });
    const raw: CategoryAliasYamlFileRaw = {
      group: context.group,
      subgroup: context.subgroup,
      alias: this.aliasToRawAlias(context.alias),
      emojis: context.emojis.map((e) => ({
        emoji: e.emoji,
        name: e.name,
        alias: this.aliasToRawAlias(e.alias),
      })),
    };
    await file.write(raw);
  }

  async mergeDefinitions(defs: EmojiDefinition[]): Promise<void> {
    const fileNameGroupedDefinitions = defs.reduce((acc, e) => {
      const key = this.buildFileName(e.group, e.subgroup);
      const emojis = acc.get(key) ?? [];
      emojis.push(e);
      acc.set(key, emojis);
      return acc;
    }, new Map<string, EmojiDefinition[]>());

    for (const [fileName, defs] of fileNameGroupedDefinitions) {
      const existing = await this.loadContent(fileName);
      const groupAliases = existing.alias;
      const emojiAliasMap = existing.emojis.reduce((acc, e) => {
        acc.set(e.emoji, e.alias);
        return acc;
      }, new Map<string, string[]>());
      const group = defs[0].group;
      const subgroup = defs[0].subgroup;

      await this.saveGroupContent(fileName, {
        group,
        subgroup,
        alias: groupAliases,
        emojis: defs.map((e) => ({
          emoji: e.emoji,
          name: e.name,
          alias: emojiAliasMap.get(e.emoji) ?? [],
        })),
      });
    }
  }

  private async getAllContents(): Promise<CategoryAliasYamlFileContent[]> {
    const files = await readdir(this.dir);
    const contents: CategoryAliasYamlFileContent[] = [];
    for (const file of files) {
      if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
      const filePath = join(this.dir, file);
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) {
        const content = await this.loadContent(file);
        contents.push(content);
      }
    }
    return contents;
  }

  async getDefinitions(): Promise<EmojiDefinition[]> {
    const contents = await this.getAllContents();
    const result: EmojiDefinition[] = [];
    for (const content of contents) {
      for (const e of content.emojis) {
        result.push({
          emoji: e.emoji,
          name: e.name,
          group: content.group,
          subgroup: content.subgroup,
          codePoints: toCodePoints(e.emoji),
        });
      }
    }
    return result;
  }

  async getEmojiAliases(): Promise<EmojiAlias[]> {
    const contents = await this.getAllContents();
    return contents
      .flatMap((content) => content.emojis)
      .filter((e) => e.alias.length > 0)
      .map((e) => ({
        emoji: e.emoji,
        alias: e.alias,
      }));
  }

  async getSubgroupAliases(): Promise<SubgroupAlias[]> {
    const contents = await this.getAllContents();
    return contents
      .filter((c) => c.alias.length > 0)
      .map((c) => ({
        group: c.group,
        subgroup: c.subgroup,
        alias: c.alias,
      }));
  }

  patchSubgroupAliases(aliases: SubgroupAlias[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  patchEmojiAliases(aliases: EmojiAlias[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
