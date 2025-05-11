import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { SkinToneStrategy } from "@/services/EmojiFilterStrategy.SkinTone";
import { describe, expect, test } from "bun:test";

describe("SkinToneStrategy", () => {
  test("應排除含膚色修飾碼的 emoji", () => {
    const defs: EmojiDefinition[] = [
      {
        emoji: "👍", // 不含膚色
        name: "thumbs up",
        group: "People",
        subgroup: "hand-fingers-closed",
        codePoints: ["1F44D"],
      },
      {
        emoji: "👍🏻", // 含膚色
        name: "thumbs up: light skin tone",
        group: "People",
        subgroup: "hand-fingers-closed",
        codePoints: ["1F44D", "1F3FB"],
      },
    ];

    const { output, blocked } = new SkinToneStrategy().filter(defs);

    expect(output).toHaveLength(1);
    expect(output[0].emoji).toBe("👍");

    expect(blocked).toHaveLength(1);
    expect(blocked[0].emoji).toBe("👍🏻");
  });
});
