import { GenderSymbolStrategy } from "@/strategies/GenderSymbolStrategy";
import type { EmojiDefinition } from "@/types";
import { describe, expect, test } from "bun:test";

describe("GenderSymbolStrategy", () => {
  test("應排除含性別符號的 emoji", () => {
    const defs: EmojiDefinition[] = [
      {
        emoji: "👮",
        name: "police officer",
        group: "People",
        subgroup: "person-role",
        codePoints: ["1F46E"],
      },
      {
        emoji: "👮‍♀️",
        name: "woman police officer",
        group: "People",
        subgroup: "person-role",
        codePoints: ["1F46E", "200D", "2640", "FE0F"],
      },
    ];

    const { output, blocked } = GenderSymbolStrategy.filter(defs);
    expect(output.map((d) => d.emoji)).toEqual(["👮"]);
    expect(blocked.map((d) => d.emoji)).toEqual(["👮‍♀️"]);
  });
});

test("性別符號本體（♀️ / ♂️）應通過", () => {
  const defs: EmojiDefinition[] = [
    {
      emoji: "♀️",
      name: "female sign",
      group: "Symbols",
      subgroup: "gender",
      codePoints: ["2640", "FE0F"],
    },
    {
      emoji: "♂️",
      name: "male sign",
      group: "Symbols",
      subgroup: "gender",
      codePoints: ["2642", "FE0F"],
    },
  ];

  const { blocked, output } = GenderSymbolStrategy.filter(defs);

  expect(blocked).toHaveLength(0);
  expect(output.map((e) => e.emoji)).toEqual(["♀️", "♂️"]);
});

test("合成但非性別符號的 emoji（如 🐻‍❄️）應通過", () => {
  const defs: EmojiDefinition[] = [
    {
      emoji: "🐻‍❄️",
      name: "polar bear",
      group: "Animals & Nature",
      subgroup: "animal-mammal",
      codePoints: ["1F43B", "200D", "2744", "FE0F"],
    },
  ];

  const { blocked, output } = GenderSymbolStrategy.filter(defs);

  expect(blocked).toHaveLength(0);
  expect(output.map((e) => e.emoji)).toEqual(["🐻‍❄️"]);
});
