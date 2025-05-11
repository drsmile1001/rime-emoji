import { YamlFile } from "@/utils/YamlFile";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, readFile, rm } from "fs/promises";
import { join } from "path";
import { resolveTmpDir } from "./TestDir";

type SampleData = {
  title: string;
  tags: string[];
};

describe("YamlFile", () => {
  const TEST_DIR = resolveTmpDir("YamlFile");
  const FILE_NAME = "sample.yaml";
  const fullPath = join(TEST_DIR, FILE_NAME);

  beforeAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  test("應能正確寫入並讀取 YAML 檔", async () => {
    const file = new YamlFile<SampleData>(TEST_DIR, FILE_NAME, {
      title: "Fallback",
      tags: [],
    });
    const data: SampleData = {
      title: "Hello World",
      tags: ["emoji", "rime", "test"],
    };

    await file.write(data);
    const loaded = await file.read();

    expect(loaded).toEqual(data);

    const text = await readFile(fullPath, "utf-8");
    expect(text).toContain("title: Hello World");
    expect(text).toContain("- emoji");
  });

  test("當檔案不存在時應使用 fallback", async () => {
    const file = new YamlFile<SampleData>(TEST_DIR, "nonexistent.yaml", {
      title: "Fallback",
      tags: [],
    });

    const result = await file.read();
    expect(result.title).toBe("Fallback");
  });
});
