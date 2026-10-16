---
id: sec-disclosure
title: Responsible disclosure and handling vulnerability reports
summary: Make it easy to report a flaw, and handle it predictably
why: "Outside researchers find real vulnerabilities in your product whether you invite them or not. A clear way to report, and a reliable response, turns those findings into fixes instead of public surprises."
requires: [sec-threat-modelling]
lesson: none
points:
  - title: Publish how to report
    text: "A security.txt file (RFC 9116) and a vulnerability disclosure policy tell researchers where to send reports and what to expect."
  - title: Safe harbour
    text: "State that good-faith research within the policy's rules won't lead to legal action. Without it, many researchers simply won't report."
  - title: Acknowledge, fix, tell
    text: "Confirm receipt quickly, triage, keep the reporter updated, fix, then disclose in coordination, usually within about 90 days."
  - title: Report others' bugs the same way
    text: "When you find a flaw in someone else's software, report it privately, stay within legal limits, and give them time to fix it."
quiz:
  - q: What is `/.well-known/security.txt`?
    options: ["A list of known vulnerabilities", "A standard file (RFC 9116) saying how to report security issues to the site, with contact and policy links", "A robots.txt for scanners"]
    answer: 1
    explain: "It must include a Contact and an Expires field, and can link to a policy, an encryption key and acknowledgements."
  - q: "A researcher reports that your API exposes other users' data. What should the first reply say?"
    options: ["Nothing until it is fixed", "Thanks, confirmation of receipt, who is handling it and when they'll hear next", "A request to sign an NDA before anything else"]
    answer: 1
    explain: "Fast, human acknowledgement keeps the researcher working with you. Silence is the most common reason reports turn into public disclosure."
  - q: You find what looks like an access control flaw on another company's site. What is responsible?
    options: ["Download as much data as you can to prove it", "Stop at the minimum needed to confirm, don't access or keep others' data, and report it privately through their published channel", "Post about it publicly so they fix it faster"]
    answer: 1
    explain: "Good-faith research avoids harm and privacy violations. Follow their disclosure policy, and get legal advice if there isn't one."
links:
  - { title: "RFC 9116: A File Format to Aid in Security Vulnerability Disclosure", url: "https://datatracker.ietf.org/doc/html/rfc9116" }
  - { title: "Vulnerability Disclosure Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html" }
  - { title: "securitytxt.org", url: "https://securitytxt.org/" }
  - { title: "Vulnerability disclosure policy template (CISA)", url: "https://www.cisa.gov/vulnerability-disclosure-policy-template" }
---
Responsible (or coordinated) disclosure is the agreement between someone who finds a vulnerability and the organisation that can fix it: the finder reports privately and gives time for a fix, the vendor responds, fixes, and credits them, and the details become public once users are protected. For your own products, that means publishing a way to report, and handling every report predictably.

## Make reporting easy

Publish a **vulnerability disclosure policy (VDP)** and a **`security.txt`** file. RFC 9116 defines the file, served at `/.well-known/security.txt`:

```text
Contact: mailto:security@example.com
Contact: https://example.com/security/report
Expires: 2027-10-01T00:00:00Z
Encryption: https://example.com/security/pgp-key.txt
Policy: https://example.com/security/policy
Acknowledgments: https://example.com/security/thanks
Preferred-Languages: en
```

`Contact` and `Expires` are required. The policy should say what is in scope (which domains, apps and APIs), what is not allowed (denial of service, social engineering of staff, accessing other users' data beyond the minimum needed to show the issue), what reporters can expect, and a **safe-harbour** statement that good-faith research under these rules won't be met with legal action. CISA publishes a template many organisations start from.

A **bug bounty** adds payments on top of a VDP. Start with a VDP; a bounty without the capacity to triage and fix quickly just produces a backlog.

## Handle reports predictably

1. **Acknowledge** within a few working days, with a real person's reply and a reference number.
2. **Triage**: reproduce, assess severity in your context, and decide who owns the fix. Ask the reporter for detail if needed; they often know more about the issue than anyone else so far.
3. **Fix and verify**, including checking for the same bug elsewhere in the codebase.
4. **Keep the reporter informed** at agreed intervals, especially if the fix will take longer than planned.
5. **Disclose**: publish an advisory, request a CVE if the software is used by others, and credit the reporter if they want it. Many programmes aim for around 90 days from report to public disclosure, sooner if fixed, with extensions agreed for hard cases.
6. **Learn**: add a test, and ask why reviews, scanners or the threat model missed it.

Route reports to a monitored shared inbox or platform, not one person's email, and include disclosure in your incident response process, since a report may reveal that the flaw was already exploited.

## When you are the finder

If you come across a flaw in someone else's software:

- Do only what is needed to confirm it. Don't access, modify or keep other people's data; don't degrade the service.
- Report through their published channel or `security.txt`. If there is none, try a security contact, the vendor's support, or a coordinator such as a national CERT.
- Give them reasonable time and don't publish details before a fix, unless they are unresponsive and users are at risk, and then only after coordinating with a CERT where possible.
- Know the law where you are. Safe-harbour terms in a policy are what protect good-faith research; without them, get advice before testing.
