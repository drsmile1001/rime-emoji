import { readFile } from "fs/promises";
import { parseEmojiTest } from "@/core/EmojiParser";
import { YamlFileRepo } from "@/utils/YamlFileRepo";
import type { DefinitionsFile } from "@/types";

const INPUT_PATH = "data/pipeline/01-fetch/emoji-test.txt";
const OUTPUT_DIR = "data/pipeline/02-parse";
const OUTPUT_FILE = "definitions.yaml";

export async function runParseCommand() {
  const raw = await readFile(INPUT_PATH, "utf-8");
  const parsed = parseEmojiTest(raw);

  const repo = new YamlFileRepo<DefinitionsFile>(OUTPUT_DIR, OUTPUT_FILE);
  await repo.save(parsed);

  console.log(
    `✅ Parsed ${parsed.length} groups from emoji-test.txt → ${OUTPUT_DIR}/${OUTPUT_FILE}`,
  );
}
