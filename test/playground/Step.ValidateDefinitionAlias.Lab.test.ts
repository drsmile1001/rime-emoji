import { describe, test } from "bun:test";
import { getTestConfig } from "../config/TestConfig";
import { resolveTmpDir } from "../utils/TestDir";
import kleur from "kleur";

import { CategoryAliasRepoYaml } from "@/services/CategoryAliasRepo.Yaml";
import { StepValidateDefinitionAlias } from "@/funcs/Step.ValidateAlias";
import { AliasValidatorMissingAlias } from "@/services/AliasValidator.MissingAlias";
import { AliasValidationReporterYaml } from "@/services/AliasValidationReporter.Yaml";

describe("StepValidateDefinitionAlias Lab", () => {
  const config = getTestConfig();
  const ENABLED = config.get("STEP_VALIDATE_ALIAS_LAB");
  const ALIAS_DIR = resolveTmpDir("YamlDefinitionAliasRepo.Lab");
  const OUTPUT_DIR = resolveTmpDir("Step.ValidateDefinitionAlias.Lab");

  test("執行 alias 檢查並輸出 YAML 報告", async () => {
    if (!ENABLED) {
      console.log(kleur.gray("✅ STEP_VALIDATE_ALIAS_LAB 不為 true，跳過測試"));
      return;
    }

    const aliasRepo = new CategoryAliasRepoYaml(ALIAS_DIR);
    const validator = new AliasValidatorMissingAlias(aliasRepo);
    const reporter = new AliasValidationReporterYaml(OUTPUT_DIR);

    const step = new StepValidateDefinitionAlias([validator], reporter);
    await step.execute();

    console.log(kleur.green(`✅ 驗證報告已輸出至 ${OUTPUT_DIR}`));
  });
});
