---
id: csf-complexity
title: "Complexity and computability: P, NP and the halting problem"
summary: Some problems are slow for everyone, and some can't be solved at all
why: "Recognising an NP-hard problem or an undecidable one saves you from hunting for an algorithm that doesn't exist, and points you to heuristics, limits or approximations instead."
lesson: none
points:
  - title: P is efficiently solvable
    text: "Problems with an algorithm whose running time grows polynomially with the input size, like sorting or shortest paths."
  - title: NP is efficiently checkable
    text: "Given a proposed answer, you can verify it quickly. Whether every such problem can also be solved quickly is the P vs NP question, still open."
  - title: NP-complete means hardest in NP
    text: "SAT, travelling salesman (decision form), graph colouring and scheduling problems are all equally hard: a fast algorithm for one would solve them all."
  - title: Some questions are undecidable
    text: "No program can decide, for every program and input, whether it eventually halts. Many questions about what code does reduce to this."
quiz:
  - q: "Checking a filled-in Sudoku is easy, but filling in a large one is hard in general. Which class does generalised Sudoku belong to?"
    options:
      - "P, because checking is fast"
      - "NP-complete: solutions are quick to verify, and no fast general method to find one is known"
      - "Undecidable"
    answer: 1
    explain: "n² × n² Sudoku is NP-complete. Checking a candidate is polynomial; finding one may, as far as anyone knows, take exponential time in the worst case."
  - q: "A colleague promises a linter that flags exactly the functions that can loop forever, with no false positives or misses, for all programs. What does computability theory say?"
    options:
      - "It needs a faster computer"
      - "It is impossible in general, by the halting problem; real tools approximate, with false positives, misses or 'don't know'"
      - "It is NP-complete, so it is slow but possible"
    answer: 1
    explain: "Turing proved that no algorithm decides halting for all programs. Rice's theorem extends this to any non-trivial property of what a program computes."
  - q: Your job scheduler must assign tasks to machines optimally and it is NP-hard. What is the usual practical approach?
    options:
      - "Wait for P = NP to be proven"
      - "Use a heuristic or approximation (greedy, local search, a solver with a time limit) that is good enough, or exact search on small inputs"
      - "Rewrite it in a faster language"
    answer: 1
    explain: "NP-hardness describes the worst case for exact answers. SAT and integer programming solvers handle many large real instances well, and approximations often come with guarantees."
links:
  - { title: "Clay Mathematics Institute: P vs NP (Millennium Prize Problem)", url: "https://www.claymath.org/millennium/p-vs-np/" }
  - { title: "MIT OpenCourseWare 18.404J: Theory of Computation (Sipser)", url: "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/" }
  - { title: "Alan Turing: On Computable Numbers (1936), via the Turing Digital Archive", url: "https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf" }
---
Big-O analysis, covered in the data structures path, compares algorithms for a problem. Complexity theory asks a bigger question: how fast can any algorithm for this problem possibly be? And computability theory asks the biggest one: can this problem be solved by an algorithm at all? You won't prove theorems at work, but recognising these two walls saves a lot of wasted effort.

## P and NP

**P** is the class of decision problems (yes/no questions) that can be solved in polynomial time: O(n), O(n log n), O(n³) and so on. Sorting, shortest paths, matching and primality testing are in P. Polynomial algorithms aren't always fast in practice, but they scale in a way exponential ones don't.

**NP** is the class of problems where a "yes" answer can be **verified** in polynomial time, given a certificate. Is there a route visiting every city with total length under 1,000 km? If someone hands you a route, you can check it quickly. Finding one may require trying a huge number of possibilities. Every problem in P is also in NP.

Whether **P = NP**, whether every quickly checkable problem is also quickly solvable, is the most famous open problem in computer science, one of the Clay Institute's Millennium Prize Problems. Most researchers believe P ≠ NP, and a lot of practical cryptography relies on certain problems being hard, although the problems it uses aren't known to be NP-complete.

## NP-complete and NP-hard

In 1971 Stephen Cook showed that Boolean satisfiability (SAT, "can these logical constraints all be true at once?") is **NP-complete**: it is in NP, and every NP problem can be translated into it in polynomial time. Thousands of problems have since been shown to be equivalent: graph colouring, the decision version of the travelling salesman problem, bin packing, scheduling with constraints, Sudoku on n² × n² grids. A polynomial algorithm for any one of them would give one for all. **NP-hard** problems are at least that hard but needn't be in NP themselves (optimisation versions often are NP-hard).

What to do when your problem is NP-hard:

- **Small inputs**: exact search, backtracking or dynamic programming is fine.
- **Real instances**: SAT, SMT and integer programming solvers are remarkably good on structured, real-world inputs, even with millions of variables.
- **Approximations and heuristics**: greedy algorithms, local search and simulated annealing give good answers fast, some with proven bounds (for example within a factor of 2 of optimal).
- **Change the problem**: add constraints, accept "good enough", or precompute.

## Undecidable problems

Some problems have no algorithm at all. In 1936 Alan Turing proved that the **halting problem** is undecidable: no program can take any program and input and always correctly say whether it eventually stops. The intuition is a contradiction. Suppose `halts(p, x)` existed. Write a program that asks `halts(self, self)` and does the opposite: loops forever if the answer is "halts", stops if the answer is "loops". Neither answer can be right, so `halts` can't exist.

Rice's theorem generalises this: every non-trivial question about what a program computes (does it ever return null? is it equivalent to this other program? does it leak this secret?) is undecidable in general. That is why static analysers, type checkers and security scanners are all conservative approximations. They either reject some correct programs, miss some bugs, or answer "unknown", and choosing which trade-off a tool makes is part of designing it.
