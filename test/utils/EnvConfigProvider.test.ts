import { EnvConfigProvider } from "@/utils/ConfigProvider";
import { enumLiteralArray } from "@/utils/Schema";
import { Type } from "@sinclair/typebox";
import { describe, expect, test } from "bun:test";

describe("ConfigProvider", () => {
  const schema = enumLiteralArray("測試列舉", [
    ["a", "A項"],
    ["b", "B項"],
    ["c", "C項"],
  ] as const);

  test("應能 decode comma-separated string 為陣列", () => {
    Bun.env.ENV_CONFIG_PROVIDER_ARRAY_TEST = "a,b,c";
    const configProvider = new EnvConfigProvider(
      Type.Object({
        ENV_CONFIG_PROVIDER_ARRAY_TEST: schema,
      }),
    );

    const result = configProvider.get("ENV_CONFIG_PROVIDER_ARRAY_TEST");
    expect(result).toEqual(["a", "b", "c"]);
  });
});
