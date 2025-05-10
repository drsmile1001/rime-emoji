import type { EmojiDefinition } from "@/types";
import { writeFile } from "fs/promises";
import { join } from "path";
import yaml from "yaml";

/**
 * 為指定策略產生 blocked.report.yaml
 * - input: 此策略接收到的 emoji（含已被前一策略過濾的）
 * - blocked: 該策略實際排除的 emoji
 */
export async function generateBlockedReportForStrategy(
  strategyId: string,
  blocked: EmojiDefinition[],
  input: EmojiDefinition[],
  outputDir: string,
) {
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

  const reportPath = join(outputDir, `blocked.${strategyId}.report.yaml`);
  await writeFile(reportPath, yaml.stringify(report, { lineWidth: 0 }), "utf8");
}
