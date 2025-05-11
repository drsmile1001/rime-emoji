import { YamlEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Yaml";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "fs";
import { mkdir, readFile, rm } from "fs/promises";
import { join } from "path";
import { createSampleEmojiDefinitions } from "~test/fixtures/Seeds";
import { resolveTmpDir } from "./utils/TestDir";

describe("YamlEmojiDefinitionRepo", () => {
  const TEST_DIR = resolveTmpDir("YamlEmojiDefinitionRepo");
  const FILE_NAME = "emoji-test.yaml";
  const fullPath = join(TEST_DIR, FILE_NAME);

  let repo: YamlEmojiDefinitionRepo;

  beforeAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(TEST_DIR, { recursive: true });
    repo = new YamlEmojiDefinitionRepo(TEST_DIR, FILE_NAME);
  });

  afterAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  test("應能正確寫入與讀回 emoji 定義", async () => {
    const defs = createSampleEmojiDefinitions();
    await repo.saveAll(defs);
    const loaded = await repo.getAll();

    expect(loaded).toEqual(defs);
  });

  test("儲存檔案應存在且有可讀內容", async () => {
    const text = await readFile(fullPath, "utf-8");
    expect(existsSync(fullPath)).toBe(true);
    expect(text).toContain("group: People & Body");
    expect(text).toContain("emoji: ✋");
  });

  test("應正確將 EmojiDefinitionFile 平坦化", async () => {
    const defs = createSampleEmojiDefinitions();
    const grouped = repo.groupify(defs);
    const flattened = repo.flatten(grouped);
    expect(flattened).toEqual(defs);
  });
});
