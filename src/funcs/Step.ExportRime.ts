import type { Step } from "./Step.Interface";
import type { DomainAliasRepo } from "@/services/DomainAliasRepo.Interface";
import type { EmojiAssignedAliasRepo } from "@/services/EmojiAssignedAliasRepo.Interface";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * 匯出為 Rime 輸入法可用的 OpenCC emoji 替換檔（.txt）
 * 每一行格式為：alias[TAB]alias emoji1 emoji2 ...
 */
export class StepExportRime implements Step {
  constructor(
    private readonly assignedRepo: EmojiAssignedAliasRepo,
    private readonly domainRepo: DomainAliasRepo,
    private readonly outputDir: string,
    private readonly fileName: string = "emoji.txt",
  ) {}

  async execute(): Promise<void> {
    const aliasMap = new Map<string, Set<string>>();

    // 來自 DomainAliasRepo
    const domainAliases = await this.domainRepo.getAll();
    for (const { alias, emojis } of domainAliases) {
      if (!alias.trim()) continue;
      if (!aliasMap.has(alias)) aliasMap.set(alias, new Set());
      emojis.forEach((e) => aliasMap.get(alias)!.add(e));
    }

    // 來自 AssignedRepo（分類別名）
    const emojiAliases = await this.assignedRepo.getEmojiAliases();
    for (const { emoji, alias } of emojiAliases) {
      if (!alias?.trim()) continue;
      if (!aliasMap.has(alias)) aliasMap.set(alias, new Set());
      aliasMap.get(alias)!.add(emoji);
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
