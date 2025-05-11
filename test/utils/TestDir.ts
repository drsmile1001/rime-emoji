export function resolveTmpDir(stepId: string): string {
  return `test/.tmp/${stepId}`;
}

export const FIXTURES_DIR = "test/fixtures";

export function resolveFixtureFile(fileName: string): string {
  return `${FIXTURES_DIR}/${fileName}`;
}
