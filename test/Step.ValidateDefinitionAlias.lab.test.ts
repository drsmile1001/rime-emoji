import { describe, test } from "bun:test";
import { getTestConfig } from "./config/TestConfig";
import { resolveTmpDir } from "./utils/TestDir";
import kleur from "kleur";

import { YamlDefinitionAliasRepo } from "@/services/DefinitionAliasRepo.Yaml";
import { StepValidateDefinitionAlias } from "@/funcs/Step.ValidateDefinitionAlias";
import { EmptyAliasValidator } from "@/services/DefinitionAliasValidator.EmptyAlias";
import { YamlAliasValidateResultReporter } from "@/services/AliasValidateResultReporter.YAML";

describe("StepValidateDefinitionAlias.LAB", () => {
  const config = getTestConfig();
  const ENABLED = config.get("STEP_VALIDATE_ALIAS_LAB");
  const ALIAS_DIR = resolveTmpDir("YamlDefinitionAliasRepo.LAB");
  const OUTPUT_DIR = resolveTmpDir("StepValidateDefinitionAlias.LAB");

  test("執行 alias 檢查並輸出 YAML 報告", async () => {
    if (!ENABLED) {
      console.log(kleur.gray("✅ STEP_VALIDATE_ALIAS_LAB 不為 true，跳過測試"));
      return;
    }

    const aliasRepo = new YamlDefinitionAliasRepo(ALIAS_DIR);
    const validator = new EmptyAliasValidator(aliasRepo);
    const reporter = new YamlAliasValidateResultReporter(OUTPUT_DIR);

    const step = new StepValidateDefinitionAlias([validator], reporter);
    await step.execute();

    console.log(kleur.green(`✅ 驗證報告已輸出至 ${OUTPUT_DIR}`));
  });
});
