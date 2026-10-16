// What the side panel on a path map says about a topic's lesson. Kept apart from lessons.tsx
// so the map page doesn't load the interactive lessons themselves.
import type { Topic } from "@/lib/paths/types"

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
const count = (n: number, one: string) => `${WORDS[n] ?? n} ${one}${n === 1 ? "" : "s"}`

export function panelBullets(topic: Topic): { label: string; bullets: [string, string][] } {
  const l = topic.lesson
  const quiz: [string, string][] = topic.quiz.length
    ? [["Check yourself:", `${count(topic.quiz.length, "question")}; get ${topic.quiz.length > 1 ? "them all" : "it"} right to finish the topic`]]
    : []
  if (l.type === "lanes" && topic.traces.length) {
    const lanes = Math.max(...topic.traces.map((t) => t.lanes.filter((x) => x.kind !== "console").length))
    const bullets: [string, string][] = [["Watch it run:", `${count(topic.traces.length, "snippet")}, step by step, across ${count(lanes, "lane")} and the console`]]
    if (topic.traces.some((t) => t.run !== "node")) bullets.push(["Try it:", "run your own code and see the real order"])
    return { label: "Interactive lesson", bullets: [...bullets, ...quiz] }
  }
  const runs = (topic.body.match(/```js run/g) ?? []).length
  const bullets: [string, string][] = [["Read:", "the explanation, with examples"]]
  if (runs) bullets.push(["Try it:", `${runs} example${runs > 1 ? "s" : ""} you can edit and run in your browser`])
  if (l.type === "walkthrough") bullets.push(["Watch:", "the walkthrough in the library"])
  return { label: "The topic", bullets: [...bullets, ...quiz] }
}
