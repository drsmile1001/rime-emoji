import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { YamlFile } from "@/utils/YamlFile";
import type { FilterStrategyReporter } from "./FilterStrategyReporter.Interface";

export class FilterStrategyReporterYaml implements FilterStrategyReporter {
  constructor(private outputDir: string) {}

  async report(
    strategyId: string,
    blocked: EmojiDefinition[],
    input: EmojiDefinition[],
  ): Promise<void> {
    const blockedSet = new Set(blocked.map((d) => d.emoji));

    const grouped = new Map<
      string,
      { group: string; subgroup: string; emojis: string[] | string }
    >();

    for (const def of input) {
      const key = `${def.group}///${def.subgroup}`;
      const mark = blockedSet.has(def.emoji) ? "🔴" : "🟢";
      const entry = `${mark} ${def.emoji} ${def.name}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          group: def.group,
          subgroup: def.subgroup,
          emojis: [],
        });
      }
      (grouped.get(key)!.emojis as string[]).push(entry);
    }

    const report = Array.from(grouped.values());
    for (const group of report) {
      group.emojis = (group.emojis as string[]).join("\n");
    }
    const yamlFile = new YamlFile(
      this.outputDir,
      `${strategyId}.report.yaml`,
      {},
    );
    await yamlFile.write(report);
  }
}
