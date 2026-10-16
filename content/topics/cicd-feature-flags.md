---
id: cicd-feature-flags
title: "Feature flags vs branches"
summary: Separate deploying code from releasing a feature
why: "Long-lived feature branches are the usual reason a team can't integrate continuously. Flags let unfinished work live on main, switched off, and let you turn a bad feature off without a deploy."
requires: [cicd-continuous-integration]
lesson: none
points:
  - title: Deploy is not release
    text: "Code can be in production for weeks before anyone sees it. Turning it on becomes a configuration change you can make, and undo, in seconds."
  - title: Branches delay integration
    text: "A feature branch keeps work apart from everyone else's until the end. A flag keeps it apart from users while it is integrated every day."
  - title: Flags have kinds
    text: "Release toggles are short-lived. Experiment, ops (kill switch) and permission flags may live longer, and should be named and owned as such."
  - title: Flags are debt
    text: "Every flag doubles the paths through some code. Give each one an owner and an expiry, and delete it once the rollout is done."
quiz:
  - q: "A feature is half built. Which approach keeps continuous integration?"
    options: ["A feature branch merged when it's finished", "Merge small steps to main behind a release flag that is off in production", "Commit directly to production"]
    answer: 1
    explain: "The code is integrated and tested daily with everyone else's work, and the flag keeps it hidden until it is ready."
  - q: "The new recommendation service is overloading the database. What does a kill-switch flag give you?"
    options: ["Faster queries", "A way to turn the feature off in seconds without building or deploying anything", "Automatic scaling"]
    answer: 1
    explain: "An ops flag is a pre-built off switch. Flipping it is faster and safer than a rollback, and it leaves the rest of the release in place."
  - q: Why should release flags be removed after the rollout?
    options: ["They slow down the app", "Each stale flag leaves dead code paths and combinations nobody tests, and an old flag reused by accident can switch on forgotten code", "Flag services charge per flag"]
    answer: 1
    explain: "Stale flags are a classic source of surprises. Track them with an owner and a removal date like any other debt."
links:
  - { title: "Feature Toggles (Pete Hodgson, martinfowler.com)", url: "https://martinfowler.com/articles/feature-toggles.html" }
  - { title: "Trunk-based development (DORA capabilities)", url: "https://dora.dev/capabilities/trunk-based-development/" }
  - { title: "OpenFeature", url: "https://openfeature.dev/" }
---
A feature flag is a runtime switch around a piece of behaviour. It lets you deploy code that is switched off, turn it on for staff, then 5% of users, then everyone, and turn it off again without a deploy. That separates two things that branches tie together: **integrating** code with everyone else's, and **releasing** a feature to users.

## Branches vs flags

With a feature branch, the work stays out of main until it's done. That keeps users safe from half-built features, but it also keeps the code away from everyone else's changes, so merge pain and surprises pile up at the end. With a flag, the work is merged to main in small steps every day and deployed, but the code path stays dark until the flag is turned on. Integration happens continuously; release happens when you choose.

```js run
// A minimal flag check: on for a list of users, plus a stable percentage of everyone else.
function bucket(userId) {
  let h = 0
  for (const ch of userId) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 100 // the same user always lands in the same bucket
}
const flags = { "new-checkout": { allow: ["staff-1"], percent: 20 } }
function isOn(name, userId) {
  const f = flags[name]
  if (!f) return false // unknown flags are off
  return f.allow.includes(userId) || bucket(userId) < f.percent
}
for (const u of ["staff-1", "alice", "bob", "carol", "dave", "erin"]) {
  console.log(u.padEnd(8), "bucket", String(bucket(u)).padStart(2), "->", isOn("new-checkout", u) ? "new checkout" : "old checkout")
}
// Over many users, about 20% land in buckets 0-19.
let on = 0
for (let i = 0; i < 10000; i++) if (isOn("new-checkout", "user-" + i)) on++
console.log("of 10000 users:", on, "see the new checkout")
```

Hashing the user ID means each user gets the same answer every time, so nobody flips between old and new checkout on each page load.

## Kinds of flags

Pete Hodgson's taxonomy is a useful habit:

- **Release toggles** hide unfinished work. They should live days or weeks.
- **Experiment toggles** split users for A/B tests; they last as long as the experiment.
- **Ops toggles** are kill switches and load-shedding controls for risky features. Some stay for good.
- **Permission toggles** turn features on for some customers, such as a paid tier or a beta group.

Naming flags by kind makes it clear which ones are supposed to disappear.

## Using flags well

- Default to **off**, and make the code safe if the flag service is unreachable (fall back to the default).
- Keep the check at the edge of the feature, in as few places as possible, not scattered through the code.
- Test both states in CI for flags that are currently rolling out.
- Log flag decisions with requests so you can tell whether an incident lines up with a flag change.
- Give every flag an owner and an expiry date; delete the flag and the dead branch once a rollout is complete.

Flags don't replace good deploy practice: database changes and API contracts still need to be backward compatible, because both flag states run against the same data.
