import type { EmojiDefinition } from "@/types";

/**
 * 將 emoji-test.txt 內容解析為平坦化的 EmojiDefinition[]
 * 僅保留 fully-qualified 條目，並包含 group/subgroup/name/codePoints
 */
export function parseEmojiTest(text: string): EmojiDefinition[] {
  const result: EmojiDefinition[] = [];

  let currentGroup = "Unknown";
  let currentSubgroup = "Unknown";

  const groupMatch = /# group: (.+)/;
  const subGroupMatch = /# subgroup: (.+)/;
  const emojiMatch =
    /^([0-9A-F\s]+);\sfully-qualified\s+#\s(\S+)\sE[\d\.]+\s(.+)$/;

  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const g = trimmed.match(groupMatch);
    if (g) {
      currentGroup = g[1]!;
      continue;
    }

    const sg = trimmed.match(subGroupMatch);
    if (sg) {
      currentSubgroup = sg[1]!;
      continue;
    }

    const em = trimmed.match(emojiMatch);
    if (em) {
      const codeStr = em[1]!.trim();
      const emoji = em[2]!;
      const name = em[3]!;
      const codePoints = codeStr.split(/\s+/);

      result.push({
        group: currentGroup,
        subgroup: currentSubgroup,
        name,
        emoji,
        codePoints,
      });
    }
  }

  return result;
}
