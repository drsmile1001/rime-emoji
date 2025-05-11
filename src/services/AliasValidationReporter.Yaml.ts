import type {
  AliasValidationResult,
  AliasValidationReporter,
  ValidationIssue,
} from "./AliasValidationReporter.Interface";
import { YamlFile } from "@/utils/YamlFile";
import { mkdir } from "node:fs/promises";

export class AliasValidationReporterYaml implements AliasValidationReporter {
  constructor(private readonly outputDir: string) {}

  async report(input: AliasValidationResult): Promise<void> {
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
