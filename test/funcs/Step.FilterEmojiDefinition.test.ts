import { describe, test, expect } from "bun:test";
import { StepFilterDefinition } from "@/funcs/Step.FilterEmojiDefinition";
import { EmojiDefinitionRepoMemory } from "@/services/EmojiDefinitionRepo.Memory";
import type { FilterStrategy } from "@/services/FilterStrategy.Interface";
import { createSampleEmojiDefinitions } from "../fixtures/Seeds";
import { FilterSummaryReporterFake } from "../fakes/FilterSummaryReporter.Fake";
import { FilterStrategyReporterFake } from "../fakes/FilterStrategyReporter.Fake";

describe("StepFilterDefinition", () => {
  test("應依序套用策略並產生報告與儲存", async () => {
    const inputDefs = createSampleEmojiDefinitions();

    const sourceRepo = new EmojiDefinitionRepoMemory();
    await sourceRepo.saveAll(inputDefs);

    const targetRepo = new EmojiDefinitionRepoMemory();

    const strategyCalls: string[] = [];

    const firstStrategy: FilterStrategy = {
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

    const secondStrategy: FilterStrategy = {
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

    const strategyReporter = new FilterStrategyReporterFake();
    const summaryReporter = new FilterSummaryReporterFake();

    const step = new StepFilterDefinition(
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
