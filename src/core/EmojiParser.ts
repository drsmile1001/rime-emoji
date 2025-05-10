import type {
  DefinitionsFile,
  EmojiGroupDefinition,
  EmojiSubgroupDefinition,
  EmojiDefinition,
} from "@/types";

/**
 * 將 emoji-test.txt 內容解析為專案共用格式的 emoji 定義結構
 * 僅保留 fully-qualified 條目
 */
export function parseEmojiTest(text: string): DefinitionsFile {
  const groupMap = new Map<string, Map<string, EmojiDefinition[]>>();

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
      const emoji = em[2]!;
      const name = em[3]!;
      const emojiDef: EmojiDefinition = { emoji, name };

      if (!groupMap.has(currentGroup)) {
        groupMap.set(currentGroup, new Map());
      }
      const subMap = groupMap.get(currentGroup)!;
      if (!subMap.has(currentSubgroup)) {
        subMap.set(currentSubgroup, []);
      }
      subMap.get(currentSubgroup)!.push(emojiDef);
    }
  }

  const definitions: DefinitionsFile = [];

  for (const [groupName, subgroups] of groupMap.entries()) {
    const subgroupDefs: EmojiSubgroupDefinition[] = [];
    for (const [subName, emojis] of subgroups.entries()) {
      subgroupDefs.push({ name: subName, emojis });
    }
    const groupDef: EmojiGroupDefinition = {
      name: groupName,
      subgroups: subgroupDefs,
    };
    definitions.push(groupDef);
  }

  return definitions;
}
