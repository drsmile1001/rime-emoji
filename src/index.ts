import { StepFetchDefinition } from "@/funcs/Step.FetchDefinition";
import { StepFilterDefinition } from "@/funcs/Step.FilterEmojiDefinition";
import { EmojiDefinitionRepoUnicode } from "@/services/EmojiDefinitionRepo.Unicode";
import { FilterStrategyGenderSymbol } from "@/services/FilterStrategy.GenderSymbol";
import { FilterStrategyGenderedRole } from "@/services/FilterStrategy.GenderedRole";
import { FilterStrategySkinTone } from "@/services/FilterStrategy.SkinTone";
import { FilterSummaryReporterYaml } from "@/services/FilterSummaryReporter.Yaml";
import { FilterStrategyReporterYaml } from "@/services/FilterStrategyReporter.Yaml";
import { cac } from "cac";
import {
  CATEGORY_ALIAS_DIR,
  FILTER_REPORT_DIR,
  FILTERED_DEFINITIONS_FILE,
  OUTPUT_DIR,
  RAW_DEFINITIONS_FILE,
} from "./constants";
import { StepMergeDefinition } from "./funcs/Step.MergeDefinition";
import { StepValidateDefinitionAlias } from "./funcs/Step.ValidateAlias";
import { AliasValidationReporterYaml } from "./services/AliasValidationReporter.Yaml";
import { CategoryAliasRepoYaml } from "./services/CategoryAliasRepo.Yaml";
import { AliasValidatorMissingAlias } from "./services/AliasValidator.MissingAlias";
import { EmojiDefinitionRepoYaml } from "./services/EmojiDefinitionRepo.Yaml";

const cli = cac();

cli.command("fetch", "下載並解析最新 emoji 定義").action(async () => {
  const source = new EmojiDefinitionRepoUnicode();
  const target = new EmojiDefinitionRepoYaml(OUTPUT_DIR, RAW_DEFINITIONS_FILE);
  const step = new StepFetchDefinition(source, target);
  await step.execute();
  console.log("✅ 下載與儲存完成");
});

cli.command("filter", "過濾 emoji 定義並產生過濾報告").action(async () => {
  const source = new EmojiDefinitionRepoYaml(OUTPUT_DIR, RAW_DEFINITIONS_FILE);
  const target = new EmojiDefinitionRepoYaml(
    OUTPUT_DIR,
    FILTERED_DEFINITIONS_FILE,
  );
  const strategyReporter = new FilterStrategyReporterYaml(FILTER_REPORT_DIR);
  const summaryReporter = new FilterSummaryReporterYaml(FILTER_REPORT_DIR);

  const step = new StepFilterDefinition(
    source,
    [
      new FilterStrategySkinTone(),
      new FilterStrategyGenderSymbol(),
      new FilterStrategyGenderedRole(),
    ],
    strategyReporter,
    summaryReporter,
    target,
  );

  await step.execute();
  console.log("✅ 過濾完成與報告輸出");
});

cli.command("merge", "合併過濾後 emoji 為可維護別名檔").action(async () => {
  const source = new EmojiDefinitionRepoYaml(
    OUTPUT_DIR,
    FILTERED_DEFINITIONS_FILE,
  );
  const target = new CategoryAliasRepoYaml(CATEGORY_ALIAS_DIR);
  const step = new StepMergeDefinition(source, target);
  await step.execute();
  console.log("✅ 合併完成，請編輯 category-alias 目錄下的檔案");
});

cli.command("validate", "驗證別名定義是否有缺漏或重複").action(async () => {
  const source = new CategoryAliasRepoYaml(CATEGORY_ALIAS_DIR);
  const validator = new AliasValidatorMissingAlias(source);
  const reporter = new AliasValidationReporterYaml(OUTPUT_DIR);
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
