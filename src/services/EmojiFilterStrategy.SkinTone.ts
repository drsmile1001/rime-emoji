import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { EmojiFilterStrategy } from "./EmojiFilterStrategy.Interface";

const SKIN_MODIFIERS = new Set(["1F3FB", "1F3FC", "1F3FD", "1F3FE", "1F3FF"]);

export class SkinToneStrategy implements EmojiFilterStrategy {
  id = "skin-tone";
  description = "排除含膚色修飾符的 emoji";
  filter(defs: EmojiDefinition[]) {
    const output: typeof defs = [];
    const blocked: typeof defs = [];

    for (const def of defs) {
      const upperCodePoints = def.codePoints.map((cp) => cp.toUpperCase());
      const hasSkinTone = upperCodePoints.some((cp) => SKIN_MODIFIERS.has(cp));

      if (hasSkinTone) {
        blocked.push(def);
      } else {
        output.push(def);
      }
    }

    return { output, blocked };
  }
}
