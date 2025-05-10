import { readFile } from "fs/promises";
import { parseEmojiTest } from "@/core/EmojiParser";
import { EmojiDefinitionRepoFs } from "@/core/EmojiDefinitionRepoFs";

const INPUT_PATH = "data/pipeline/01-fetch/emoji-test.txt";
const OUTPUT_DIR = "data/pipeline/02-parse";

export async function runParseCommand() {
  const raw = await readFile(INPUT_PATH, "utf-8");
  const parsed = parseEmojiTest(raw);

  const repo = new EmojiDefinitionRepoFs(OUTPUT_DIR);
  await repo.save(parsed);

  console.log(
    `✅ Parsed ${parsed.length} emoji definitions from emoji-test.txt → ${OUTPUT_DIR}`,
  );
}
