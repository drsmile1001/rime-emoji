import { EmojiDefinitionRepoMemory } from "@/services/EmojiDefinitionRepo.Memory";
import { describe, expect, test } from "bun:test";
import { createSampleEmojiDefinitions } from "~test/fixtures/Seeds";

describe("EmojiDefinitionRepoMemory", () => {
  test("初始應為空", async () => {
    const repo = new EmojiDefinitionRepoMemory();
    const result = await repo.getAll();
    expect(result).toEqual([]);
  });

  test("儲存後應可正確讀取", async () => {
    const repo = new EmojiDefinitionRepoMemory();
    const defs = createSampleEmojiDefinitions();
    await repo.saveAll(defs);
    const result = await repo.getAll();
    expect(result).toEqual(defs);
  });

  test("儲存新資料應覆蓋舊內容", async () => {
    const repo = new EmojiDefinitionRepoMemory();
    const defs = createSampleEmojiDefinitions();
    await repo.saveAll(defs);
    await repo.saveAll([defs[0]]);
    const result = await repo.getAll();
    expect(result).toEqual([defs[0]]);
  });

  test("getAll() 回傳為快照（非參照）", async () => {
    const repo = new EmojiDefinitionRepoMemory();
    const defs = createSampleEmojiDefinitions();
    await repo.saveAll(defs);

    const result = await repo.getAll();
    result[0].name = "MUTATED";

    const secondRead = await repo.getAll();
    expect(secondRead[0].name).toBe("Raised Hand"); // 未被修改
  });
});
