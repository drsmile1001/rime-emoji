import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdirSync } from "fs";

const EMOJI_TEST_URL = "https://unicode.org/Public/emoji/latest/emoji-test.txt";
export const OUTPUT_PATH = "data/pipeline/01-fetch/emoji-test.txt";

/**
 * 從官方 URL 抓取 emoji-test.txt 純文字內容
 */
export async function fetchLatestEmojiTestText(): Promise<string> {
  const res = await fetch(EMOJI_TEST_URL);
  if (!res.ok) {
    throw new Error(`下載失敗: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

/**
 * 將 emoji-test.txt 儲存到預設 pipeline 路徑下
 */
export async function saveRawEmojiTestText(content: string): Promise<void> {
  mkdirSync(join(OUTPUT_PATH, ".."), { recursive: true });
  await writeFile(OUTPUT_PATH, content, "utf-8");
}

/**
 * 一鍵執行 fetch → save，回傳儲存檔案的絕對路徑
 */
export async function runFetchPipeline(): Promise<string> {
  const content = await fetchLatestEmojiTestText();
  await saveRawEmojiTestText(content);
  return OUTPUT_PATH;
}
