import { EmojiDefinitionRepoFs } from "@/core/EmojiDefinitionRepoFs";
import { applyEmojiFilterStrategies } from "@/core/EmojiFilter";
import { SkinToneStrategy } from "@/strategies/SkinToneStrategy";
import { generateBlockedReportForStrategy } from "@/utils/GenerateBlockedReport";

const INPUT_DIR = "data/pipeline/02-parse";
const OUTPUT_DIR = "data/pipeline/03-filter";

export async function runFilterCommand() {
  const inputRepo = new EmojiDefinitionRepoFs(INPUT_DIR);
  const outputRepo = new EmojiDefinitionRepoFs(OUTPUT_DIR, "definitions.yaml");

  const allDefs = await inputRepo.load();

  const strategies = [SkinToneStrategy];

  const { finalOutput, runs } = applyEmojiFilterStrategies(allDefs, strategies);

  // 儲存通過所有策略後的 emoji
  await outputRepo.save(finalOutput);

  // 為每個策略輸出 blocked.yaml + report.yaml
  for (const run of runs) {
    const id = run.strategy.id;

    const blockedRepo = new EmojiDefinitionRepoFs(
      OUTPUT_DIR,
      `blocked.${id}.yaml`,
    );
    await blockedRepo.save(run.blocked);

    await generateBlockedReportForStrategy(
      id,
      run.blocked,
      run.input,
      OUTPUT_DIR,
    );
  }

  // 統計摘要輸出
  const totalBlocked = runs.reduce((sum, run) => sum + run.blocked.length, 0);

  console.log(`✅ Filtered emoji definitions → ${OUTPUT_DIR}`);
  console.log(`✔️  Kept: ${finalOutput.length}`);
  for (const run of runs) {
    console.log(`❌ Blocked by ${run.strategy.id}: ${run.blocked.length}`);
  }
  console.log(`🧱 Total Blocked: ${totalBlocked}`);
}
