import { EnvConfigProvider } from "@/utils/ConfigProvider";
import { enumLiteralArray, enumLiterals, stringBoolean } from "@/utils/Schema";
import { Type } from "@sinclair/typebox";

const stepInput = enumLiterals("輸入類型", [
  ["fixture", "測試檔案"],
  ["real", "真實輸入"],
] as const);

const stepOutput = enumLiterals("輸出類型", [
  ["temp", "臨時檔案"],
  ["real", "真實輸出"],
] as const);

const stepReport = enumLiterals("報告類型", [
  ["on", "啟用"],
  ["off", "關閉"],
  ["yaml", "輸出 YAML 報告"],
] as const);

const stepFilterStrategies = enumLiteralArray("過濾策略", [
  ["skin", "膚色修飾符"],
  ["gender", "性別符號"],
  ["gendered-role", "性別角色"],
] as const);

const StepTestEnvSchema = Type.Object({
  TEST_INPUT: stepInput,
  TEST_OUTPUT: stepOutput,
  KEEP_TEST_OUTPUT: stringBoolean(),
  TEST_STEP_FILTER_LAB: stringBoolean(),
  TEST_STEP_FILTER_STRATEGIES: stepFilterStrategies,
});

export function getTestConfig() {
  return new EnvConfigProvider(StepTestEnvSchema, {
    TEST_INPUT: "fixture",
    TEST_OUTPUT: "temp",
  });
}
