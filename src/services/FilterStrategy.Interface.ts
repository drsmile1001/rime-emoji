import type { EmojiDefinition } from "@/entities/EmojiDefinition";

export interface FilterStrategy {
  id: string;
  description: string;
  filter: (defs: EmojiDefinition[]) => EmojiFilterStrategyResult;
}

export type EmojiFilterStrategyResult = {
  output: EmojiDefinition[];
  blocked: EmojiDefinition[];
};
