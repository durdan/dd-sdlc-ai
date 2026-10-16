// Prints what the renderer makes of each flow diagram: every box's role (its colour and icon)
// and every arrow's flow (its colour), marking which were written and which were guessed.
// Use it to find guesses worth correcting with `role:` and `flow:` (see content/README.md).
//   npx tsx scripts/diagram-roles.ts [topic-id ...]
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { parseDiagrams } from "../lib/paths/diagrams"

async function main() {
  // design-player is ESM-only: load it with import(), not require().
  const { flowOf, roleOf } = await import("design-player/core")
  const dir = join(process.cwd(), "content/topics")
  const only = process.argv.slice(2)
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md") && (!only.length || only.includes(f.slice(0, -3)))).sort()

  for (const f of files) {
    // The body after the YAML front matter.
    const content = (await readFile(join(dir, f), "utf8")).replace(/^---\n[\s\S]*?\n---\n/, "")
    if (!content.includes("```trace diagram")) continue
    for (const flow of parseDiagrams(content, f, [], []).diagrams) {
      const d = flow.diagram
      console.log(`\n${f.slice(0, -3)} · ${flow.id} (${d.kind})`)
      for (const n of d.kind === "c4" ? d.elements : d.participants) {
        const sub = "sub" in n && n.sub ? ` (${n.sub})` : ""
        console.log(`  box   ${n.id.padEnd(18)} ${roleOf(n).padEnd(9)} ${n.role ? "written" : "guessed"}  ${n.label}${sub}`)
      }
      for (const e of d.kind === "c4" ? d.edges : d.messages) {
        const how = e.flow ? "written" : e.style ? `from ${e.style}` : "default"
        console.log(`  arrow ${e.id.padEnd(18)} ${flowOf(e).padEnd(9)} ${how.padEnd(12)} ${e.from} → ${e.to}${e.label ? `  "${e.label}"` : ""}`)
      }
    }
  }
}

main()
