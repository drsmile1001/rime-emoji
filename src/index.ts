import { YamlDomainAliasRepo } from "@/services/DomainAliasRepo.Yaml";
import { StepBuildDomainAliasFromAssigned } from "@/funcs/Step.BuildDomainAliasFromAssigned";
import { StepExportRime } from "@/funcs/Step.ExportRime";
import { StepFetchLatestDefinition } from "@/funcs/Step.FetchLatestDefinition";
import { StepFilterEmojiDefinition } from "@/funcs/Step.FilterEmojiDefinition";
import { UnicodeEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Unicode";
import { SkinToneStrategy } from "@/services/EmojiFilterStrategy.SkinTone";
import { GenderSymbolStrategy } from "@/services/EmojiFilterStrategy.GenderSymbol";
import { GenderedRoleStrategy } from "@/services/EmojiFilterStrategy.GenderedRole";
import { YamlStrategyReporter } from "@/services/StrategyReporter.Yaml";
import { YamlFilterEmojiDefinitionResultReporter } from "@/services/FilterEmojiDefinitionResultReporter.Yaml";
import { cac } from "cac";
import { mkdir } from "node:fs/promises";
import { YamlEmojiAssignedAliasRepo } from "./services/EmojiAssignedAliasRepo.Yaml";
import { YamlEmojiDefinitionRepo } from "./services/EmojiDefinitionRepo.Yaml";
import { StepMergeDefinition } from "./funcs/Step.MergeDefinition";
import { StepValidateDefinitionAlias } from "./funcs/Step.ValidateDefinitionAlias";
import { EmptyAliasValidator } from "./services/DefinitionAliasValidator.EmptyAlias";
import { YamlAliasValidateResultReporter } from "./services/AliasValidateResultReporter.Yaml";

const cli = cac();

const ASSIGNED_ALIAS_DIR = "data/assigned-alias";
const DOMAIN_ALIAS_DIR = "data/domain-alias";
const OUTPUT_DIR = "dist";

cli
  .command("export", "輸出為 Rime 可用格式（OpenCC .txt）")
  .action(async () => {
    const assignedRepo = new YamlEmojiAssignedAliasRepo(ASSIGNED_ALIAS_DIR);
    const domainRepo = new YamlDomainAliasRepo(DOMAIN_ALIAS_DIR);

    const build = new StepBuildDomainAliasFromAssigned(
      assignedRepo,
      domainRepo,
      "default",
    );
    await build.execute();

    const exportStep = new StepExportRime(
      assignedRepo,
      domainRepo,
      OUTPUT_DIR,
      "emoji.txt",
    );
    await exportStep.execute();

    console.log(`✅ 匯出完成：${OUTPUT_DIR}/emoji.txt`);
  });

cli
  .command("fetch-latest", "下載並解析 Unicode emoji-test.txt")
  .action(async () => {
    const source = new UnicodeEmojiDefinitionRepo();
    const target = new YamlEmojiDefinitionRepo("dist", "raw-definitions.yaml");
    const step = new StepFetchLatestDefinition(source, target);
    await step.execute();
    console.log("✅ 下載與儲存完成");
  });

cli.command("filter", "過濾 emoji 定義並產生過濾報告").action(async () => {
  const source = new YamlEmojiDefinitionRepo("dist", "raw-definitions.yaml");
  const target = new YamlEmojiDefinitionRepo("dist", "filtered-definitions");
  const strategyReporter = new YamlStrategyReporter("dist/strategies");
  const summaryReporter = new YamlFilterEmojiDefinitionResultReporter(
    "dist/filter-summary.yaml",
  );

  const step = new StepFilterEmojiDefinition(
    source,
    [
      new SkinToneStrategy(),
      new GenderSymbolStrategy(),
      new GenderedRoleStrategy(),
    ],
    strategyReporter,
    summaryReporter,
    target,
  );

  await mkdir("dist", { recursive: true });
  await step.execute();
  console.log("✅ 過濾完成與報告輸出");
});

cli.command("merge", "合併過濾後 emoji 為可維護別名檔").action(async () => {
  const source = new YamlEmojiDefinitionRepo("dist", "filtered-definitions");
  const target = new YamlEmojiAssignedAliasRepo(ASSIGNED_ALIAS_DIR);
  const step = new StepMergeDefinition(source, target);
  await step.execute();
  console.log("✅ 合併完成，請編輯 assigned-alias 目錄下的檔案");
});

cli.command("validate", "驗證別名定義是否有缺漏或重複").action(async () => {
  const source = new YamlEmojiAssignedAliasRepo(ASSIGNED_ALIAS_DIR);
  const validator = new EmptyAliasValidator(source);
  const reporter = new YamlAliasValidateResultReporter(OUTPUT_DIR);
  const step = new StepValidateDefinitionAlias([validator], reporter);
  await step.execute();
  console.log("✅ 別名驗證完成，請檢查報告");
});

cli.help();
cli.parse(process.argv, { run: false });

if (!cli.matchedCommand) {
  cli.outputHelp();
  process.exit(0);
}

try {
  await cli.runMatchedCommand();
} catch (error) {
  console.error(error);
  process.exit(1);
}
