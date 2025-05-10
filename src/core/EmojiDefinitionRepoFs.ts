import { YamlFileRepo } from "@/utils/YamlFileRepo";
import { flattenDefinitions } from "@/core/DefinitionFlattener";
import { groupifyDefinitions } from "@/core/DefinitionGroupifier";
import type { EmojiDefinition, EmojiDefinitionFile } from "@/types";
import { Document, YAMLMap, YAMLSeq } from "yaml";

export class EmojiDefinitionRepoFs {
  constructor(private baseDir: string, private filename = "definitions.yaml") {}

  private get repo() {
    return new YamlFileRepo<EmojiDefinitionFile>(this.baseDir, this.filename);
  }

  async load(): Promise<EmojiDefinition[]> {
    const structured = await this.repo.load();
    return flattenDefinitions(structured);
  }

  async save(flat: EmojiDefinition[]): Promise<void> {
    const grouped = groupifyDefinitions(flat);
    await this.repo.save(grouped, (doc: Document) => {
      // 讓 codePoints 為 flow style 陣列
      const contents = doc.contents as YAMLSeq;
      const groups = contents.items as YAMLMap[];
      for (const group of groups) {
        const subgroupsSeq = group.get("subgroups") as YAMLSeq;
        const subgroups = subgroupsSeq.items as YAMLMap[];
        for (const subgroup of subgroups) {
          const emojisSeq = subgroup.get("emojis") as YAMLSeq;
          const emojis = emojisSeq.items as YAMLMap[];
          for (const emoji of emojis) {
            const codePoints = emoji.get("codePoints") as YAMLSeq;
            codePoints.flow = true;
          }
        }
      }
    });
  }
}
