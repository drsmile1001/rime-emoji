import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { StrategyReporter } from "@/services/StrategyReporter.Interface";

export class FakeStrategyReporter implements StrategyReporter {
  public calls: {
    id: string;
    input: EmojiDefinition[];
    blocked: EmojiDefinition[];
  }[] = [];

  async report(
    strategyId: string,
    blocked: EmojiDefinition[],
    input: EmojiDefinition[],
  ): Promise<void> {
    this.calls.push({
      id: strategyId,
      input,
      blocked,
    });
  }
}
