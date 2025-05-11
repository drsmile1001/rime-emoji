import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { FilterEmojiDefinitionResultReporter } from "@/services/FilterEmojiDefinitionResultReporter.Interface";

export class FakeFilterEmojiDefinitionResultReporter
  implements FilterEmojiDefinitionResultReporter
{
  public summaryCalled: boolean = false;
  public receivedSummary: {
    finalOutput: EmojiDefinition[];
    strategyRuns: {
      id: string;
      input: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[];
  } | null = null;

  async reportSummary(summary: {
    finalOutput: EmojiDefinition[];
    strategyRuns: {
      id: string;
      input: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[];
  }): Promise<void> {
    this.summaryCalled = true;
    this.receivedSummary = summary;
  }
}
