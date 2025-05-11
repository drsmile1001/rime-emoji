import type { DomainAlias, DomainAliasRepo } from "./DomainAliasRepo.Interface";
import { YamlFile } from "@/utils/YamlFile";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

type DomainAliasEntry = {
  alias: string;
  domain: string;
  emojis: string; // 空格分割
};

export class YamlDomainAliasRepo implements DomainAliasRepo {
  constructor(private readonly dir: string) {}

  async saveAll(data: DomainAlias[]): Promise<void> {
    const grouped = new Map<string, DomainAlias[]>();
    for (const item of data) {
      if (!grouped.has(item.domain)) grouped.set(item.domain, []);
      grouped.get(item.domain)!.push(item);
    }

    for (const [domain, list] of grouped) {
      const entries: DomainAliasEntry[] = list.map((x) => ({
        alias: x.alias,
        domain: x.domain,
        emojis: x.emojis.join(" "),
      }));
      const file = new YamlFile<DomainAliasEntry[]>(
        this.dir,
        `${domain}.yaml`,
        [],
      );
      await file.write(entries);
    }
  }

  async getAll(): Promise<DomainAlias[]> {
    const files = await readdir(this.dir);
    const result: DomainAlias[] = [];

    for (const file of files) {
      if (!file.endsWith(".yaml")) continue;
      const path = join(this.dir, file);
      const statInfo = await stat(path);
      if (!statInfo.isFile()) continue;

      const yamlFile = new YamlFile<DomainAliasEntry[]>(this.dir, file, []);
      const data = await yamlFile.read();
      const das = data.map((x) => ({
        alias: x.alias,
        domain: x.domain,
        emojis: x.emojis.split(" "),
      }));
      result.push(...das);
    }

    return result;
  }

  async getByAlias(alias: string): Promise<DomainAlias[]> {
    const all = await this.getAll();
    return all.filter((x) => x.alias === alias);
  }

  async getByDomain(domain: string): Promise<DomainAlias[]> {
    const file = new YamlFile<DomainAlias[]>(this.dir, `${domain}.yaml`, []);
    return await file.read();
  }
}
