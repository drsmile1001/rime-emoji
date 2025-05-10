import { applyEmojiFilterStrategies } from "@/core/EmojiFilter";
import type { EmojiFilterStrategy } from "@/core/EmojiFilter";
import type { EmojiDefinition } from "@/types";
import { describe, expect, test } from "bun:test";

const sampleEmojis: EmojiDefinition[] = [
  {
    emoji: "😀",
    name: "grinning face",
    group: "Smileys",
    subgroup: "face-smiling",
    codePoints: ["1F600"],
  },
  {
    emoji: "👩‍💻",
    name: "woman technologist",
    group: "People",
    subgroup: "person-role",
    codePoints: ["1F469", "200D", "1F4BB"],
  },
  {
    emoji: "🏳️‍🌈",
    name: "rainbow flag",
    group: "Flags",
    subgroup: "flag",
    codePoints: ["1F3F3", "FE0F", "200D", "1F308"],
  },
];

describe("applyEmojiFilterStrategies", () => {
  test("應依序套用策略並傳遞剩餘 emoji", () => {
    const called: string[] = [];

    const firstStrategy: EmojiFilterStrategy = {
      id: "first",
      filter: (defs) => {
        called.push("first");
        return {
          output: defs.slice(0, 2),
          blocked: defs.slice(2),
        };
      },
    };

    const secondStrategy: EmojiFilterStrategy = {
      id: "second",
      filter: (defs) => {
        called.push("second");
        return {
          output: defs.filter((e) => e.emoji !== "👩‍💻"),
          blocked: defs.filter((e) => e.emoji === "👩‍💻"),
        };
      },
    };

    const result = applyEmojiFilterStrategies(sampleEmojis, [
      firstStrategy,
      secondStrategy,
    ]);

    expect(called).toEqual(["first", "second"]);

    expect(result.finalOutput).toEqual([
      {
        emoji: "😀",
        name: "grinning face",
        group: "Smileys",
        subgroup: "face-smiling",
        codePoints: ["1F600"],
      },
    ]);

    expect(result.runs).toHaveLength(2);

    expect(result.runs[0].input).toEqual(sampleEmojis);
    expect(result.runs[0].output).toEqual(sampleEmojis.slice(0, 2));
    expect(result.runs[0].blocked).toEqual([sampleEmojis[2]]);

    expect(result.runs[1].input).toEqual(sampleEmojis.slice(0, 2));
    expect(result.runs[1].output).toEqual([sampleEmojis[0]]);
    expect(result.runs[1].blocked).toEqual([sampleEmojis[1]]);
  });
});
