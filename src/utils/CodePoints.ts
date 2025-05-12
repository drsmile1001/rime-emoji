export function toCodePoints(emoji: string): string[] {
  return [...emoji]
    .map((c) => c.codePointAt(0)?.toString(16).toUpperCase())
    .filter((c) => c !== undefined) as string[];
}
