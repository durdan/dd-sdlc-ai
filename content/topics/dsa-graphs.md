---
id: dsa-graphs
title: "Graphs: BFS, DFS and shortest paths"
summary: Nodes, edges, and the order you explore them in
why: Dependency resolution, route planning, social networks, build systems, crawlers and permission checks are all graph searches in disguise.
requires: [dsa-stacks-queues, dsa-heaps]
lesson: lanes
points:
  - title: Adjacency lists
    text: Store each node's neighbours in a list or map. It takes space proportional to the edges and makes "visit every neighbour" cheap.
  - title: BFS uses a queue
    text: Breadth-first search visits nodes in order of distance from the start, so it finds shortest paths when every edge costs the same.
  - title: DFS uses a stack
    text: Depth-first search goes as deep as it can before backtracking. It is the basis of cycle detection and topological sorting.
  - title: Weights need Dijkstra
    text: With non-negative edge costs, always expand the closest unsettled node, using a priority queue. Negative costs need Bellman-Ford.
quiz_hint: Ask which node comes out of the frontier next, the oldest (queue), the newest (stack) or the cheapest (priority queue).
quiz:
  - q: Why does BFS find the shortest path in an unweighted graph?
    options:
      - It tries every possible path
      - "Its queue hands out nodes in order of distance: all nodes at distance 1, then all at distance 2, and so on"
      - It always picks the neighbour with the smallest name
    answer: 1
    explain: A node is discovered first from the earliest layer that reaches it, so its recorded distance is the smallest possible. The trace above shows the layers A, then B and C, then D and E, then F.
  - q: In the trace, D is reachable from both B and C. Why is it only queued once?
    options: [Graphs can't have two edges into one node, "BFS records nodes when they are discovered (in dist) and skips any it has already seen", D is removed from C's list]
    answer: 1
    explain: Without the "already seen" check, nodes would be queued again and again, and on a graph with cycles the search would never finish.
  - q: Which algorithm fits "find the cheapest route when roads have different travel times, none negative"?
    options: [BFS, Depth-first search, Dijkstra's algorithm]
    answer: 2
    explain: Dijkstra's algorithm generalises BFS by always expanding the node with the smallest known distance, using a priority queue instead of a plain queue.
links:
  - { title: "Undirected graphs: DFS and BFS (Sedgewick and Wayne, Algorithms 4th ed., section 4.1)", url: "https://algs4.cs.princeton.edu/41graph/" }
  - { title: "Shortest paths (Sedgewick and Wayne, Algorithms 4th ed., section 4.4)", url: "https://algs4.cs.princeton.edu/44sp/" }
  - { title: "graphlib: topological sorting (Python docs)", url: "https://docs.python.org/3/library/graphlib.html" }
  - { title: "Dijkstra's algorithm (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm" }
---
A graph is a set of nodes connected by edges, which may have a direction and a cost. Most graph algorithms are the same loop with a different container: take a node out of the frontier, look at its neighbours, and put the new ones in. Use a queue and you get breadth-first search, which explores in rings of increasing distance. Use a stack and you get depth-first search. Use a priority queue ordered by distance and you get Dijkstra's shortest paths.

```trace lanes
id: bfs
title: Breadth-first search
subtitle: The queue holds the frontier, nearest first
run: any
module: cjs
code: |
  const graph = { A: ["B", "C"], B: ["D"], C: ["D", "E"], D: ["F"], E: ["F"], F: [] };
  function bfs(start) {
    const dist = { [start]: 0 };
    const queue = [start];
    while (queue.length > 0) {
      const node = queue.shift();
      console.log(node, dist[node]);
      for (const next of graph[node]) {
        if (!(next in dist)) {
          dist[next] = dist[node] + 1;
          queue.push(next);
        }
      }
    }
  }
  bfs("A");
lanes:
  - { id: frontier, title: Queue (frontier), hint: "Discovered but not yet visited; oldest first", kind: queue, tone: amber }
  - { id: current, title: Visiting, hint: The node just taken from the queue, kind: plain, tone: blue }
  - { id: done, title: Finished, hint: "Node = distance from A", kind: plain, tone: teal }
  - { id: out, title: Console, kind: console }
steps:
  - caption: "Nothing has run yet. The graph has edges A→B, A→C, B→D, C→D, C→E, D→F and E→F. dist doubles as the set of nodes already discovered."
  - line: 4
    caption: bfs("A") records A at distance 0 and puts it in the queue.
    state: { frontier: [{ id: A, label: "A (0)" }] }
  - line: 6
    caption: The loop takes the oldest node, A, out of the queue.
    state: { frontier: [], current: [{ id: A, label: "A (0)" }] }
  - line: 7
    caption: It logs A and its distance.
    log: A 0
  - line: 11
    caption: A's neighbours B and C are new, so both get distance 1 and join the back of the queue.
    state: { frontier: [{ id: B, label: "B (1)" }, { id: C, label: "C (1)" }] }
  - line: 7
    caption: A is finished. B, the oldest in the queue, is visited next and logged.
    state:
      done: [{ id: A, label: "A = 0" }]
      current: [{ id: B, label: "B (1)" }]
      frontier: [{ id: C, label: "C (1)" }]
    log: B 1
  - line: 11
    caption: B's only neighbour, D, is new. It is one step further than B, so distance 2.
    state: { frontier: [{ id: C, label: "C (1)" }, { id: D, label: "D (2)" }] }
  - line: 7
    caption: B is finished and C is visited. Every distance-1 node comes out before any distance-2 node.
    state:
      done: [{ id: A, label: "A = 0" }, { id: B, label: "B = 1" }]
      current: [{ id: C, label: "C (1)" }]
      frontier: [{ id: D, label: "D (2)" }]
    log: C 1
  - line: 9
    caption: C points to D and E. D is already in dist, so it is skipped; that check is what stops nodes being queued twice. E is new, at distance 2.
    state: { frontier: [{ id: D, label: "D (2)" }, { id: E, label: "E (2)" }] }
  - line: 7
    caption: The second ring begins. D is visited and logged.
    state:
      done: [{ id: A, label: "A = 0" }, { id: B, label: "B = 1" }, { id: C, label: "C = 1" }]
      current: [{ id: D, label: "D (2)" }]
      frontier: [{ id: E, label: "E (2)" }]
    log: D 2
  - line: 11
    caption: D's neighbour F is new and gets distance 3.
    state: { frontier: [{ id: E, label: "E (2)" }, { id: F, label: "F (3)" }] }
  - line: 7
    caption: E is visited. Its neighbour F has already been discovered through D, so nothing new is queued.
    state:
      done: [{ id: A, label: "A = 0" }, { id: B, label: "B = 1" }, { id: C, label: "C = 1" }, { id: D, label: "D = 2" }]
      current: [{ id: E, label: "E (2)" }]
      frontier: [{ id: F, label: "F (3)" }]
    log: E 2
  - line: 7
    caption: F, the last node, is visited. It has no outgoing edges.
    state:
      done: [{ id: A, label: "A = 0" }, { id: B, label: "B = 1" }, { id: C, label: "C = 1" }, { id: D, label: "D = 2" }, { id: E, label: "E = 2" }]
      current: [{ id: F, label: "F (3)" }]
      frontier: []
    log: F 3
  - line: 5
    caption: "The queue is empty, so the search ends. Each node was visited once, in rings of distance: A, then B and C, then D and E, then F. Each distance is the length of the shortest path from A."
    state:
      done: [{ id: A, label: "A = 0" }, { id: B, label: "B = 1" }, { id: C, label: "C = 1" }, { id: D, label: "D = 2" }, { id: E, label: "E = 2" }, { id: F, label: "F = 3" }]
      current: []
note: "queue.shift() is fine for a small graph. For millions of nodes, keep a head index instead so dequeuing stays O(1); the whole search is then O(nodes + edges)."
expect: [A 0, B 1, C 1, D 2, E 2, F 3]
```

## Storing a graph

An **adjacency list** maps each node to its neighbours, like the `graph` object above. It uses space proportional to the number of edges and lets you loop over a node's neighbours directly, which is what searches do. An **adjacency matrix**, an n × n grid of booleans or weights, answers "is there an edge from u to v?" in O(1) but uses n² space, so it only suits small or dense graphs. Most real graphs (road networks, follower graphs, package dependencies) are sparse, so lists win.

## Depth-first search

Swap the queue for a stack (or use recursion) and the search dives down one path before backtracking. DFS doesn't find shortest paths, but the order in which it *finishes* nodes is very useful. It detects cycles (meeting a node that is still on the current path), and reversing the finish order of a directed acyclic graph gives a **topological order**, an order in which every task comes after the tasks it depends on. Package managers, build tools and spreadsheet recalculation all need that; Python ships it as `graphlib.TopologicalSorter`.

## Weighted shortest paths

When edges have costs, the node with the fewest hops isn't necessarily the cheapest. **Dijkstra's algorithm** keeps a tentative distance for every node and always expands the unsettled node with the smallest one, which a priority queue provides. With a binary heap it runs in O((V + E) log V). It requires non-negative weights; with negative edges use Bellman–Ford, and for one target on a map, A\* adds an estimate of the remaining distance to search towards the goal first.

```js run
// Travel times in minutes between stops (directed edges).
const roads = {
  home: { cafe: 4, station: 10 },
  cafe: { station: 3, park: 8 },
  station: { office: 6 },
  park: { office: 2 },
  office: {},
};

function dijkstra(graph, source) {
  const dist = { [source]: 0 };
  const prev = {};
  const frontier = [[0, source]];                 // [distance, node]; a real heap in production
  while (frontier.length > 0) {
    frontier.sort((a, b) => a[0] - b[0]);         // take the closest unsettled node
    const [d, node] = frontier.shift();
    if (d > dist[node]) continue;                 // a stale entry: we already found a shorter way
    for (const [next, w] of Object.entries(graph[node])) {
      const candidate = d + w;
      if (candidate < (dist[next] ?? Infinity)) {
        dist[next] = candidate;
        prev[next] = node;
        frontier.push([candidate, next]);
      }
    }
  }
  return { dist, prev };
}

const { dist, prev } = dijkstra(roads, "home");
const path = ["office"];
while (prev[path[0]]) path.unshift(prev[path[0]]);
console.log(dist.office, path.join(" -> "));    // 13 home -> cafe -> station -> office
```

The direct-looking route home → station → office costs 16 and the park route costs 14; Dijkstra finds 13 through the café and the station. Sorting the frontier on every step keeps the example short; swap in the min-heap from the heaps topic to get the O((V + E) log V) bound.
