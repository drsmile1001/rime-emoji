import type { EmojiDefinition } from "@/entities/EmojiDefinition";

export interface FilterStrategyReporter {
  report(
    strategyId: string,
    blocked: EmojiDefinition[],
    input: EmojiDefinition[],
  ): Promise<void>;
}
