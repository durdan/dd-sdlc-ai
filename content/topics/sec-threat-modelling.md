---
id: sec-threat-modelling
title: Threat modelling in 30 minutes
summary: What are we building, what can go wrong, what will we do about it?
why: "Most security bugs are design decisions nobody questioned. Half an hour with a diagram and a checklist finds many of them before any code exists, when fixing them is cheapest."
lesson: none
points:
  - title: Four questions
    text: "What are we working on? What can go wrong? What are we going to do about it? Did we do a good enough job?"
  - title: Draw the data flow
    text: "Boxes for processes, cylinders for data stores, arrows for data, and dashed lines where trust changes. Threats cluster on those lines."
  - title: STRIDE as a prompt
    text: "Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. Walk each arrow and ask which apply."
  - title: Decide and record
    text: "For each threat: mitigate, accept, transfer or avoid. Write down the decision and the owner, then revisit it when the design changes."
quiz:
  - q: "A user can send a request that makes your server fetch any URL, including internal admin endpoints. Which STRIDE category fits best?"
    options: ["Repudiation", "Elevation of privilege (and information disclosure): the attacker uses your server's network position to reach what they can't", "Denial of service only"]
    answer: 1
    explain: "This is server-side request forgery. The server has access the user doesn't, so the user borrows it. STRIDE categories overlap; the point is to notice the threat."
  - q: "Users deny having approved a payment, and you have no record of who approved it. Which STRIDE threat is that?"
    options: ["Tampering", "Repudiation", "Spoofing"]
    answer: 1
    explain: "Repudiation is being unable to prove who did what. The usual mitigation is a tamper-resistant audit log tied to an authenticated identity."
  - q: Where in a data-flow diagram should you look hardest for threats?
    options: ["Inside a single process", "Where data crosses a trust boundary, such as from the internet into your API or from your service into a third party", "In the legend"]
    answer: 1
    explain: "Trust boundaries are where input stops being under your control, so validation, authentication and authorisation have to happen there."
links:
  - { title: "Threat Modeling Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html" }
  - { title: "Threat Modeling Manifesto", url: "https://www.threatmodelingmanifesto.org/" }
  - { title: "Threat modeling (OWASP Community)", url: "https://community.owasp.org/Threat_Modeling" }
---
Threat modelling is thinking about how your system could be attacked before an attacker does it for you. It needn't be a week-long exercise. For a single feature, thirty minutes with the people who build it, a whiteboard and four questions is enough to catch the design mistakes that later become incidents.

## The four questions

The Threat Modeling Manifesto boils the practice down to:

1. **What are we working on?** A picture of the system.
2. **What can go wrong?** Threats, found systematically.
3. **What are we going to do about it?** Decisions, with owners.
4. **Did we do a good enough job?** A quick review, and a reminder to revisit.

## A 30-minute session

**Minutes 0–10: draw it.** A simple data-flow diagram: external actors (users, partner systems), your processes (API, worker), data stores (database, bucket, cache), and arrows for the data moving between them. Then draw **trust boundaries**: dashed lines where data passes between parties that trust each other differently. The internet to your API is one; your service to a payment provider is another; a browser extension to your page is a third.

**Minutes 10–25: walk the arrows with STRIDE.** For each arrow that crosses a boundary, ask:

- **Spoofing**: can someone pretend to be another user or service? (authentication)
- **Tampering**: can data be changed in transit or at rest? (integrity, signing, TLS)
- **Repudiation**: could someone deny doing something, and could we prove otherwise? (audit logs)
- **Information disclosure**: can data leak to someone who shouldn't see it? (authorisation, encryption, error messages)
- **Denial of service**: can someone exhaust a resource? (rate limits, quotas, timeouts)
- **Elevation of privilege**: can someone gain rights they shouldn't have? (access control, input handling)

Write each threat as a sentence: "An attacker who guesses an invoice ID can download another customer's invoice."

**Minutes 25–30: decide.** For each threat, choose to **mitigate** (add a check), **accept** (low impact, written down and signed off), **transfer** (a provider or insurance carries it) or **avoid** (drop the feature or the data). Turn mitigations into tickets with owners.

## Keep it light and repeated

A threat model is useful only while it matches the system. Attach the diagram to the design document, revisit it when a new boundary appears (a new third party, a new public endpoint, a new kind of personal data), and make "did anything here cross a trust boundary?" a normal design-review question.

Common findings in a first session: missing ownership checks on IDs in URLs, secrets shared between environments, webhooks accepted without verifying their signature, admin endpoints reachable from the internet, and logs that contain tokens or personal data. Each of these has its own topic later in this path.
