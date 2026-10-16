// Minimal types for the part of js-yaml (MIT) the path loader uses.
declare module "js-yaml" {
  export const CORE_SCHEMA: unknown
  export function load(text: string, options?: { schema?: unknown; filename?: string }): unknown
}
