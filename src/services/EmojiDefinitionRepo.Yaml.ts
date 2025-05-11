import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { YamlFile } from "@/utils/YamlFile";
import { Document, YAMLMap, YAMLSeq } from "yaml";
import type { EmojiDefinitionRepo } from "./EmojiDefinitionRepo.Interface";

export type EmojiDefinitionFile = {
  group: string;
  alias?: string;
  subgroups: {
    subgroup: string;
    alias?: string;
    emojis: {
      codePoints: string[];
      emoji: string;
      name: string;
    }[];
  }[];
}[];

export class YamlEmojiDefinitionRepo implements EmojiDefinitionRepo {
  private readonly yamlFile: YamlFile<EmojiDefinitionFile>;

  constructor(private baseDir: string, private fileName: string) {
    this.yamlFile = new YamlFile<EmojiDefinitionFile>(
      this.baseDir,
      this.fileName,
      [],
    );
  }

  async getAll(): Promise<EmojiDefinition[]> {
    const defFile = await this.yamlFile.read();
    return this.flatten(defFile);
  }

  async saveAll(defs: EmojiDefinition[]): Promise<void> {
    const grouped = this.groupify(defs);
    await this.yamlFile.write(grouped, (doc: Document) => {
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

  /** 結構化 → 平坦 */
  public flatten(file: EmojiDefinitionFile): EmojiDefinition[] {
    const result: EmojiDefinition[] = [];
    for (const group of file) {
      const groupName = group.group;
      for (const subgroup of group.subgroups) {
        const subgroupName = subgroup.subgroup;
        for (const emoji of subgroup.emojis) {
          result.push({
            group: groupName,
            subgroup: subgroupName,
            name: emoji.name,
            emoji: emoji.emoji,
            codePoints: emoji.codePoints,
          });
        }
      }
    }
    return result;
  }

  /** 平坦 → 結構化 */
  public groupify(defs: EmojiDefinition[]): EmojiDefinitionFile {
    const groupMap = new Map<string, Map<string, EmojiDefinition[]>>();

    for (const def of defs) {
      if (!groupMap.has(def.group)) {
        groupMap.set(def.group, new Map());
      }
      const subgroupMap = groupMap.get(def.group)!;
      if (!subgroupMap.has(def.subgroup)) {
        subgroupMap.set(def.subgroup, []);
      }
      subgroupMap.get(def.subgroup)!.push(def);
    }

    const result: EmojiDefinitionFile = [];

    for (const [group, subgroups] of groupMap.entries()) {
      const subgroupList = Array.from(subgroups.entries()).map(
        ([subgroup, emojis]) => ({
          subgroup,
          emojis: emojis.map((e) => ({
            emoji: e.emoji,
            name: e.name,
            codePoints: e.codePoints,
          })),
        }),
      );
      result.push({
        group,
        subgroups: subgroupList,
      });
    }

    return result;
  }
}
