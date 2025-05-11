/**
 * 掃描並列出所有專案中的 .ts / .tsx 檔案
 * 排除 node_modules, dist 等目錄
 */

import { write } from "bun";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const EXCLUDE_DIRS = ["node_modules", "dist", ".git", "scripts"];
const ROOT_DIR = process.cwd();
const TARGET_EXTENSIONS = [".ts", ".tsx"];

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      const nestedFiles = await listFiles(fullPath);
      files.push(...nestedFiles);
    } else {
      if (TARGET_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
        files.push(relative(ROOT_DIR, fullPath));
      }
    }
  }

  return files;
}

const files = await listFiles(ROOT_DIR);
await write("dist/ts-files.txt", files.join("\n"));
