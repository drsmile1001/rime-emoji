import { enumLiteralArray } from "@/utils/Schema";
import { Value } from "@sinclair/typebox/value";
import { describe, expect, test } from "bun:test";

describe("enumLiteralArray", () => {
  const schema = enumLiteralArray("測試列舉", [
    ["a", "A項"],
    ["b", "B項"],
    ["c", "C項"],
  ] as const);

  test("應能 decode comma-separated string 為陣列", () => {
    const raw = "a,b,c";
    const parsed = Value.Decode(schema, raw);
    expect(parsed).toEqual(["a", "b", "c"]);
  });

  test("應能忽略非法值並只保留合法值", () => {
    const raw = "a,x,b";
    const parsed = Value.Decode(schema, raw);
    expect(parsed).toEqual(["a", "b"]);
  });

  test("應能 encode 陣列為 comma-separated 字串", () => {
    const value = ["b", "c"];
    const encoded = Value.Encode(schema, value);
    expect(encoded).toBe("b,c");
  });

  test("空字串應 decode 成空陣列", () => {
    const raw = "";
    const parsed = Value.Decode(schema, raw);
    expect(parsed).toEqual([]);
  });

  test("空陣列應 encode 成空字串", () => {
    const encoded = Value.Encode(schema, []);
    expect(encoded).toBe("");
  });
});
