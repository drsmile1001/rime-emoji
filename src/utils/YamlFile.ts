import { file, write } from "bun";
import { join } from "path";
import { Document, parse } from "yaml";

/**
 * 泛型 YAML 檔案存取封裝器，支援動態路徑切換
 */
export class YamlFile<T> {
  constructor(
    private dir: string,
    private fileName: string,
    private fallback: T,
  ) {}

  async read(): Promise<T> {
    const fullPath = join(this.dir, this.fileName);
    const yamlFile = file(fullPath);
    try {
      const raw = await yamlFile.text();
      return parse(raw);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return this.fallback;
      }
      throw err;
    }
  }

  async write(data: T, transform?: (doc: Document) => void): Promise<void> {
    const doc = new Document(data);
    if (transform) transform(doc);
    const fullPath = join(this.dir, this.fileName);
    await write(fullPath, String(doc));
  }
}
