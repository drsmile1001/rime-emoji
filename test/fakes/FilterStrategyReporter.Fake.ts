import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { FilterStrategyReporter } from "@/services/FilterStrategyReporter.Interface";

export class FilterStrategyReporterFake implements FilterStrategyReporter {
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
