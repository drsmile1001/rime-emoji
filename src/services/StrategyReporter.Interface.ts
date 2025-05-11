import type { EmojiDefinition } from "@/entities/EmojiDefinition";

export interface StrategyReporter {
  report(
    strategyId: string,
    blocked: EmojiDefinition[],
    input: EmojiDefinition[],
  ): Promise<void>;
}
