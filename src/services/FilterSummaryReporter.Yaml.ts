import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { YamlFile } from "@/utils/YamlFile";
import type { FilterSummaryReporter } from "./FilterSummaryReporter.Interface";

export class FilterSummaryReporterYaml implements FilterSummaryReporter {
  constructor(private outputDir: string) {}

  async reportSummary(summary: {
    finalOutput: EmojiDefinition[];
    strategyRuns: {
      id: string;
      input: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[];
  }): Promise<void> {
    const { finalOutput, strategyRuns } = summary;

    // ✅ blocked.pass.report.yaml
    await this.writeGroupedReport(
      "blocked.pass.report.yaml",
      finalOutput,
      new Set(),
    );

    // ✅ blocked.summary.yaml
    const totalBlocked = strategyRuns.reduce(
      (sum, run) => sum + run.blocked.length,
      0,
    );
    const stat = {
      totalKept: finalOutput.length,
      totalBlocked,
      byStrategy: strategyRuns.map((run) => ({
        id: run.id,
        input: run.input.length,
        blocked: run.blocked.length,
        kept: run.input.length - run.blocked.length,
      })),
    };
    const yamlFile = new YamlFile(this.outputDir, "blocked.summary.yaml", {});
    await yamlFile.write(stat);
  }

  private async writeGroupedReport(
    fileName: string,
    input: EmojiDefinition[],
    blockedSet: Set<string>,
  ) {
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

    const yamlFile = new YamlFile(this.outputDir, fileName, {});
    await yamlFile.write(report);
  }
}
