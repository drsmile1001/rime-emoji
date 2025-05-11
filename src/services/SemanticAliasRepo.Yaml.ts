import { YamlFile } from "@/utils/YamlFile";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { SemanticAliasRepo } from "./SemanticAliasRepo.Interface";
import type { SemanticAlias } from "@/entities/SemanticAlias";

export type SemanticAliasYamlEntry = {
  alias: string;
  emojis: string; // 空格分割
};

export class SemanticAliasRepoYaml implements SemanticAliasRepo {
  constructor(private readonly dir: string) {}

  async saveAll(data: SemanticAlias[]): Promise<void> {
    const grouped = new Map<string, SemanticAlias[]>();
    for (const item of data) {
      if (!grouped.has(item.semantic)) grouped.set(item.semantic, []);
      grouped.get(item.semantic)!.push(item);
    }

    for (const [semantic, list] of grouped) {
      const entries: SemanticAliasYamlEntry[] = list.map((x) => ({
        alias: x.alias,
        semantic: x.semantic,
        emojis: x.emojis.join(" "),
      }));
      const file = new YamlFile<SemanticAliasYamlEntry[]>(
        this.dir,
        `${semantic}.yaml`,
        [],
      );
      await file.write(entries);
    }
  }

  async getAll(): Promise<SemanticAlias[]> {
    const files = await readdir(this.dir);
    const result: SemanticAlias[] = [];

    for (const file of files) {
      if (!file.endsWith(".yaml")) continue;
      const path = join(this.dir, file);
      const statInfo = await stat(path);
      if (!statInfo.isFile()) continue;

      const yamlFile = new YamlFile<SemanticAliasYamlEntry[]>(
        this.dir,
        file,
        [],
      );
      const data = await yamlFile.read();
      const das = data.map((x) => ({
        alias: x.alias,
        semantic: file,
        emojis: x.emojis.split(" "),
      }));
      result.push(...das);
    }

    return result;
  }

  async getByAlias(alias: string): Promise<SemanticAlias[]> {
    const all = await this.getAll();
    return all.filter((x) => x.alias === alias);
  }

  async getByDomain(semantic: string): Promise<SemanticAlias[]> {
    const file = new YamlFile<SemanticAlias[]>(
      this.dir,
      `${semantic}.yaml`,
      [],
    );
    return await file.read();
  }
}
