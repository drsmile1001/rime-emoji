import type { EmojiDefinition } from "@/entities/EmojiDefinition";

export interface FilterSummaryReporter {
  reportSummary(summary: {
    finalOutput: EmojiDefinition[];
    strategyRuns: {
      id: string;
      input: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[];
  }): Promise<void>;
}
