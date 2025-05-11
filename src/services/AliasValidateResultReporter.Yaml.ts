import type {
  AliasValidateReportInput,
  AliasValidateResultReporter,
  ValidationIssue,
} from "./AliasValidateResultReporter.Interface";
import { YamlFile } from "@/utils/YamlFile";
import { mkdir } from "node:fs/promises";

export class YamlAliasValidateResultReporter
  implements AliasValidateResultReporter
{
  constructor(private readonly outputDir: string) {}

  async report(input: AliasValidateReportInput): Promise<void> {
    await mkdir(this.outputDir, { recursive: true });

    const issuesFile = new YamlFile<ValidationIssue[]>(
      this.outputDir,
      "validation.issues.yaml",
      [],
    );
    const summaryFile = new YamlFile(
      this.outputDir,
      "validation.summary.yaml",
      {},
    );

    await issuesFile.write(input.issues);
    await summaryFile.write(input.summary);
  }
}
