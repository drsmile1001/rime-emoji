import { describe, test, expect } from "bun:test";
import { StepFilterEmojiDefinition } from "@/funcs/Step.FilterEmojiDefinition";
import { MemoryEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Memory";
import type { EmojiFilterStrategy } from "@/services/EmojiFilterStrategy.Interface";
import { createSampleEmojiDefinitions } from "./fixtures/Seeds";
import { FakeFilterEmojiDefinitionResultReporter } from "./fakes/FakeFilterEmojiDefinitionResultReporter";
import { FakeStrategyReporter } from "./fakes/FakeStrategyReporter";

describe("StepFilterEmojiDefinition", () => {
  test("應依序套用策略並產生報告與儲存", async () => {
    const inputDefs = createSampleEmojiDefinitions();

    const sourceRepo = new MemoryEmojiDefinitionRepo();
    await sourceRepo.saveAll(inputDefs);

    const targetRepo = new MemoryEmojiDefinitionRepo();

    const strategyCalls: string[] = [];

    const firstStrategy: EmojiFilterStrategy = {
      id: "first",
      description: "第一個策略",
      filter: (defs) => {
        strategyCalls.push("first");
        return {
          output: defs.slice(0, 2),
          blocked: defs.slice(2),
        };
      },
    };

    const secondStrategy: EmojiFilterStrategy = {
      id: "second",
      description: "第二個策略",
      filter: (defs) => {
        strategyCalls.push("second");
        return {
          output: defs.filter((e) => e.emoji !== "✋"),
          blocked: defs.filter((e) => e.emoji === "✋"),
        };
      },
    };

    const strategyReporter = new FakeStrategyReporter();
    const summaryReporter = new FakeFilterEmojiDefinitionResultReporter();

    const step = new StepFilterEmojiDefinition(
      sourceRepo,
      [firstStrategy, secondStrategy],
      strategyReporter,
      summaryReporter,
      targetRepo,
    );

    await step.execute();

    const finalOutput = await targetRepo.getAll();

    // ✅ 驗證策略順序
    expect(strategyCalls).toEqual(["first", "second"]);

    // ✅ 驗證最終結果
    expect(finalOutput.length).toBe(1);
    expect(finalOutput[0].emoji).not.toBe("✋");

    // ✅ 驗證 summary 被呼叫
    expect(summaryReporter.summaryCalled).toBe(true);
    expect(summaryReporter.receivedSummary?.finalOutput).toEqual(finalOutput);

    // ✅ 驗證 strategyReporter 被呼叫兩次
    expect(strategyReporter.calls.map((c) => c.id)).toEqual([
      "first",
      "second",
    ]);
    expect(strategyReporter.calls[0].blocked.length).toBe(1); // 😀
    expect(strategyReporter.calls[1].blocked.length).toBe(1); // ✋
  });
});
