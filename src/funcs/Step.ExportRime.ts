import type { CategoryAliasRepo } from "@/services/CategoryAliasRepo.Interface";
import type { Step } from "./Step.Interface";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SemanticAliasRepo } from "@/services/SemanticAliasRepo.Interface";

/**
 * 匯出為 Rime 輸入法可用的 OpenCC emoji 替換檔（.txt）
 * 每一行格式為：alias[TAB]alias emoji1 emoji2 ...
 */
export class StepExportRime implements Step {
  constructor(
    private readonly categoryRepo: CategoryAliasRepo,
    private readonly semanticRepo: SemanticAliasRepo,
    private readonly outputDir: string,
    private readonly fileName: string = "emoji.txt",
  ) {}

  async execute(): Promise<void> {
    const aliasMap = new Map<string, Set<string>>();

    const defs = await this.categoryRepo.getDefinitions();

    // 來自 CategoryRepo（分類別名）
    const emojiAliases = await this.categoryRepo.getEmojiAliases();
    for (const { emoji, alias: aliases } of emojiAliases) {
      if (!aliases.length) continue;
      for (const alias of aliases) {
        if (!aliasMap.has(alias)) aliasMap.set(alias, new Set());
        aliasMap.get(alias)!.add(emoji);
      }
    }

    const subgroupAliases = await this.categoryRepo.getSubgroupAliases();
    for (const { group, subgroup, alias: aliases } of subgroupAliases) {
      if (!aliases.length) continue;
      for (const aliase of aliases) {
        if (!aliasMap.has(aliase)) aliasMap.set(aliase, new Set());
        const emojis = defs.filter(
          (d) => d.group === group && d.subgroup === subgroup,
        );
        emojis.forEach((e) => aliasMap.get(aliase)!.add(e.emoji));
      }
    }

    // 來自 SemanticAliasRepo
    const semanticAliases = await this.semanticRepo.getAll();
    for (const { alias, emojis } of semanticAliases) {
      if (!alias.trim()) continue;
      if (!aliasMap.has(alias)) aliasMap.set(alias, new Set());
      emojis.forEach((e) => aliasMap.get(alias)!.add(e));
    }

    // 匯出
    await mkdir(this.outputDir, { recursive: true });
    const lines: string[] = [];
    for (const [alias, emojis] of aliasMap.entries()) {
      lines.push(`${alias}\t${alias} ${Array.from(emojis).join(" ")}`);
    }
    await writeFile(
      join(this.outputDir, this.fileName),
      lines.join("\n"),
      "utf8",
    );
  }
}
