---
id: sec-supply-chain
title: Dependency and supply-chain risk
summary: Most of your code is other people's; treat it that way
why: "Software Supply Chain Failures is A03 in the OWASP Top 10:2025, and was the community survey's top concern. A typical app pulls in hundreds of packages, any of which can carry a vulnerability or be taken over."
requires: [sec-owasp-top10]
lesson: none
points:
  - title: Two different risks
    text: "Vulnerable dependencies are honest code with bugs. Malicious dependencies are packages built or hijacked to attack you. They need different defences."
  - title: Know what you run
    text: "Lockfiles pin exact versions; SBOMs list what each release contains, so you can answer \"are we affected?\" in minutes."
  - title: Update steadily
    text: "Automated update pull requests in small batches keep you close to current, so a security fix is a minor bump instead of a migration."
  - title: Reduce trust surface
    text: "Fewer dependencies, vetted sources, install scripts disabled where possible, and a delay before adopting brand-new releases."
quiz:
  - q: A scanner reports 40 vulnerable packages. What should you fix first?
    options: ["Alphabetically", "The ones that are reachable from your code and exploitable in your context, starting with those known to be exploited in the wild", "Only the ones with the highest CVSS score"]
    answer: 1
    explain: "Severity scores ignore context. Prioritise by reachability and real-world exploitation (for example CISA's Known Exploited Vulnerabilities list), then work through the rest."
  - q: "A package named `reqeusts` appears in a pull request. What kind of attack might this be?"
    options: ["Dependency confusion", "Typosquatting: a malicious package with a name close to a popular one", "A version conflict"]
    answer: 1
    explain: "Typosquats rely on a slip of the keyboard. Review new dependencies by name, source and maintainer, not just by what they do."
  - q: Your internal package is called `acme-utils`. Someone publishes `acme-utils` version 99.0.0 to the public registry, and some builds install it. What is this?
    options: ["Typosquatting", "Dependency confusion: the resolver preferred the public package with the higher version", "A normal update"]
    answer: 1
    explain: "Fix it by using scoped names you own (@acme/utils), configuring the registry per scope, and pinning with a lockfile."
links:
  - { title: "A03:2025 Software Supply Chain Failures (OWASP Top 10)", url: "https://top10.owasp.org/2025/A03_2025-Software_Supply_Chain_Failures/" }
  - { title: "Vulnerable Dependency Management Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html" }
  - { title: "OpenSSF Scorecard", url: "https://scorecard.dev/" }
  - { title: "Known Exploited Vulnerabilities Catalog (CISA)", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" }
---
Your application is a thin layer on top of a large tree of open-source packages, base images, build tools and CI actions. That tree is part of your attack surface. Some risk comes from **vulnerable** components: honest code with bugs, fixed in a later version. Some comes from **malicious** components: a hijacked maintainer account, a typosquatted name, a package that steals tokens from your CI. Both need deliberate handling.

## Know what you depend on

- **Commit lockfiles** and install from them in CI (`npm ci`, `pip install --require-hashes`, `go mod verify`), so every build uses the exact versions you reviewed.
- **Produce an SBOM** for each release (SPDX or CycloneDX) and keep it. When a widely used library announces a critical flaw, an SBOM search tells you which services are affected.
- **Watch advisories** through your platform's dependency alerts, OSV, or a commercial scanner.

## Vulnerable dependencies

Scanners report a lot. Prioritise:

1. **Known exploited** vulnerabilities (CISA's KEV catalogue, vendor notices) in internet-facing services.
2. **Reachable** ones: your code actually calls the vulnerable function with attacker-influenced input. Several scanners can now tell you this.
3. The rest, through **routine updates**. Tools like Dependabot or Renovate open small update pull requests continuously. Staying close to current is what makes an emergency fix a one-line bump instead of a three-major-version migration.

Agree target fix times by severity (for example critical in days, high in weeks) and track them.

## Malicious dependencies

The common tricks: **typosquatting** (`reqeusts`), **dependency confusion** (a public package with the same name as your private one and a higher version), **account takeover** of a real maintainer, and **protestware or sabotage** by a maintainer. Defences:

- **Review new dependencies** before adding them: who maintains it, how widely used, how recently changed, does it need what it asks for? Fewer dependencies is a real security measure.
- **Use scoped or namespaced names** for private packages and pin which registry each scope comes from.
- **Disable install scripts** where you can (`npm config set ignore-scripts true`, then allow specific packages), since `postinstall` runs arbitrary code on developer machines and CI.
- **Wait a little**: many malicious releases are caught within days. Package managers and update bots can enforce a minimum release age before adopting a new version.
- **Check health signals** such as OpenSSF Scorecard (branch protection, code review, pinned dependencies, signed releases).

## The build is part of the chain

Pin CI actions and base images by digest, give CI jobs least-privilege tokens, and produce signed provenance for your own artifacts. The CI/CD path covers SLSA, SBOM attestation and Sigstore signing in detail. Consumers of your software then get the same assurances you want from your own suppliers.
