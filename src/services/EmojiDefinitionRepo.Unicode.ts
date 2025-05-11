import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { EmojiDefinitionRepo } from "./EmojiDefinitionRepo.Interface";

const EMOJI_TEST_URL = "https://unicode.org/Public/emoji/latest/emoji-test.txt";

/**
 * UnicodeEmojiDefinitionRepo
 * 從 Unicode 官網即時下載 emoji 定義檔並解析為結構化物件。
 */
export class UnicodeEmojiDefinitionRepo implements EmojiDefinitionRepo {
  async getAll(): Promise<EmojiDefinition[]> {
    const txt = await this.fetch();
    return await this.parse(txt);
  }

  async saveAll(): Promise<void> {
    throw new Error("Will not implement saveAll for Unicode repo");
  }

  async fetch(): Promise<string> {
    const res = await fetch(EMOJI_TEST_URL);
    if (!res.ok) {
      throw new Error(`下載失敗: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  }

  async parse(data: string): Promise<EmojiDefinition[]> {
    const lines = data.split("\n");
    const result: EmojiDefinition[] = [];

    let currentGroup = "";
    let currentSubgroup = "";

    for (const line of lines) {
      if (line.startsWith("# group:")) {
        currentGroup = line.replace("# group:", "").trim();
        continue;
      }

      if (line.startsWith("# subgroup:")) {
        currentSubgroup = line.replace("# subgroup:", "").trim();
        continue;
      }

      if (line.startsWith("#") || line.trim() === "") {
        continue;
      }

      const match = line.match(
        /^([0-9A-F ]+); fully-qualified\s+#\s(.+?)\s+(.+)$/,
      );
      if (!match) continue;

      const codePointHex = match[1].trim().split(" ");
      const emojiChar = match[2].trim();
      const name = match[3].trim();

      result.push({
        emoji: emojiChar,
        name,
        group: currentGroup,
        subgroup: currentSubgroup,
        codePoints: codePointHex,
      });
    }

    return result;
  }
}
