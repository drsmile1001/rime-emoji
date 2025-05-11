import type { EmojiDefinition } from "@/entities/EmojiDefinition";

export interface FilterEmojiDefinitionResultReporter {
  reportSummary(summary: {
    finalOutput: EmojiDefinition[];
    strategyRuns: {
      id: string;
      input: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[];
  }): Promise<void>;
}
