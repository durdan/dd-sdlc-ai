// npm run paths:check — validates content/topics, content/paths and the catalogue's system
// design paths with the same code the pages use (lib/paths/load.ts), lays every map out with
// elkjs, runs every lanes trace that has `expect` in a child Node process and compares what it
// prints, and prints a summary. Exits with code 1 on any problem.
import { execFile } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { checkContent } from "../lib/paths/load"
import { layoutPath, layoutPathsMap } from "../lib/paths/layout"
import { KIND_LABEL, KIND_ORDER, type Topic, type Trace } from "../lib/paths/types"

const RUN_TIMEOUT_MS = 2000

/** Runs a trace's code with this Node (as .cjs or .mjs) and returns what it printed to stdout. */
async function runInNode(trace: Trace, dir: string): Promise<{ lines: string[]; error?: string }> {
  const file = join(dir, `${trace.id}.${trace.module === "esm" ? "mjs" : "cjs"}`)
  await writeFile(file, trace.code + "\n")
  return new Promise((resolve) => {
    execFile(process.execPath, [file], { cwd: dir, timeout: RUN_TIMEOUT_MS, killSignal: "SIGKILL", env: { ...process.env, NODE_OPTIONS: "" }, encoding: "utf8" }, (err, stdout, stderr) => {
      const lines = stdout.replace(/\n$/, "").split("\n").filter((l, i, a) => a.length > 1 || l !== "")
      if (err && (err as { killed?: boolean }).killed) resolve({ lines, error: `still running after ${RUN_TIMEOUT_MS / 1000} s (killed)` })
      else if (err) resolve({ lines, error: `exited with an error: ${stderr.trim().split("\n").slice(0, 3).join(" | ") || err.message}` })
      else resolve({ lines })
    })
  })
}

/** Checks every trace's `expect` against a real run. Returns problems; logs one line per trace. */
async function runTraces(topics: Topic[]): Promise<string[]> {
  const problems: string[] = []
  const dir = await mkdtemp(join(tmpdir(), "paths-traces-"))
  try {
    for (const t of topics) {
      for (const tr of t.traces) {
        const name = `${t.id}/${tr.id}`
        if (!tr.expect) {
          console.log(`  -  ${name.padEnd(36)} no expect, not run`)
          continue
        }
        if (tr.run === "browser") {
          console.log(`  -  ${name.padEnd(36)} run: browser, skipped (needs a browser); last step matches expect`)
          continue
        }
        const r = await runInNode(tr, dir)
        const same = JSON.stringify(r.lines) === JSON.stringify(tr.expect)
        if (r.error) problems.push(`content/topics/${t.id}.md: trace "${tr.id}": ${r.error}`)
        else if (!same)
          problems.push(`content/topics/${t.id}.md: trace "${tr.id}": node ${tr.module === "esm" ? ".mjs" : ".cjs"} printed ${JSON.stringify(r.lines)} but expect is ${JSON.stringify(tr.expect)}`)
        console.log(`  ${r.error || !same ? "✕" : "✓"}  ${name.padEnd(36)} node ${process.versions.node} (${tr.module}): ${r.lines.length} line${r.lines.length === 1 ? "" : "s"}${r.error || !same ? "  ← differs" : ", same as expect and the last step"}`)
      }
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
  return problems
}

async function main() {
  const { data, problems, warnings } = await checkContent()
  for (const w of warnings) console.log(`warning  ${w}`)
  if (!data) {
    console.error(`\n✕ ${problems.length} problem(s):`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }

  const topics = Object.values(data.topics)
  const content = topics.filter((t) => t.source === "content")

  const traced = content.filter((t) => t.traces.length)
  console.log(`\nLanes traces (${traced.reduce((n, t) => n + t.traces.length, 0)} in ${traced.length} topics): running the code`)
  const runProblems = await runTraces(traced)
  if (runProblems.length) {
    console.error(`\n✕ ${runProblems.length} problem(s):`)
    for (const p of runProblems) console.error(`  - ${p}`)
    process.exit(1)
  }

  const lessons = content.reduce<Record<string, number>>((acc, t) => {
    const k = t.lesson.type
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})
  const shared = Object.entries(data.pathsByTopic).filter(([, ps]) => ps.length > 1)

  console.log("\nLearning paths")
  for (const kind of KIND_ORDER) {
    const ps = data.paths.filter((p) => p.kind === kind)
    if (!ps.length) continue
    console.log(`  ${KIND_LABEL[kind]} (${ps.length})`)
    for (const p of ps) {
      const layout = await layoutPath(p, data)
      const n = p.stages.reduce((s, st) => s + st.topics.length, 0)
      const arrows = layout.edges.filter((e) => e.kind !== "flow").length
      console.log(
        `    ${p.id.padEnd(18)} ${String(n).padStart(2)} topics, ${p.stages.length} stages, ${p.bridges.length} bridges, ${arrows} arrows, map ${layout.width}×${layout.height}${p.next.length ? `, next → ${p.next.join(", ")}` : ""}`,
      )
    }
  }
  const map = await layoutPathsMap(data)
  console.log(`\nTopics: ${content.length} written (${Object.entries(lessons).map(([k, v]) => `${v} ${k}`).join(", ")}), ${topics.length - content.length} from the library`)
  console.log(`Quiz questions: ${content.reduce((s, t) => s + t.quiz.length, 0)}; links: ${content.reduce((s, t) => s + t.links.length, 0)}`)
  console.log(`Shared topics (progress shared across paths): ${shared.filter(([id]) => data.topics[id].source === "content").map(([id, ps]) => `${id} (${ps.join(", ")})`).join("; ") || "none"}`)
  console.log(`Map of paths: ${map.nodes.length} linked paths, ${map.edges.length} links, ${map.width}×${map.height}`)
  console.log(`\n✓ No problems${warnings.length ? `, ${warnings.length} warning(s)` : ""}.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
