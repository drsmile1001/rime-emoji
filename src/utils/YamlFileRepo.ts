import { readFile, writeFile } from "fs/promises";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { Document, parse, stringify } from "yaml";

/**
 * 泛型 YAML 檔案存取封裝器，支援動態路徑切換
 */
export class YamlFileRepo<T> {
  constructor(
    private readonly baseDir: string,
    private readonly relativePath: string,
  ) {}

  private get fullPath(): string {
    return join(this.baseDir, this.relativePath);
  }

  async load(): Promise<T> {
    const raw = await readFile(this.fullPath, "utf-8");
    return parse(raw);
  }

  async save(data: T, modifier?: (doc: Document) => void): Promise<void> {
    mkdirSync(dirname(this.fullPath), { recursive: true });
    const doc = new Document(data);
    if (modifier) modifier(doc);
    const yamlText = doc.toString();
    await writeFile(this.fullPath, yamlText, "utf-8");
  }
}
