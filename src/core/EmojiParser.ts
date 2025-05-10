export type ParsedEmojiEntry = {
  emoji: string;
  codepoints: string[];
  name: string;
  group: string;
  subgroup: string;
};

/**
 * 將 emoji-test.txt 內容解析為結構化陣列
 * 僅保留 fully-qualified 條目
 */
export function parseEmojiTest(text: string): ParsedEmojiEntry[] {
  const result: ParsedEmojiEntry[] = [];
  let currentGroup = "Unknown";
  let currentSubgroup = "Unknown";

  const groupMatch = /# group: (.+)/;
  const subGroupMatch = /# subgroup: (.+)/;
  const emojiMatch =
    /^([0-9A-F\s]+);\sfully-qualified\s+#\s(\W+)\sE[\d\.]+\s(.+)$/;
  const emojiTestLines = text.split("\n");
  for (const line of emojiTestLines) {
    const groupMatchResult = line.match(groupMatch);
    if (groupMatchResult) {
      const groupName = groupMatchResult[1]!;
      currentGroup = groupName;
      continue;
    }
    const subGroupMatchResult = line.match(subGroupMatch);
    if (subGroupMatchResult) {
      currentSubgroup = subGroupMatchResult[1]!;
      continue;
    }
    const emojiMatchResult = line.match(emojiMatch);
    if (emojiMatchResult) {
      const emojiEntry: ParsedEmojiEntry = {
        emoji: emojiMatchResult[2]!,
        codepoints: emojiMatchResult[1]!.trim().split(" "),
        name: emojiMatchResult[3]!,
        group: currentGroup,
        subgroup: currentSubgroup,
      };
      result.push(emojiEntry);
    }
  }

  return result;
}
