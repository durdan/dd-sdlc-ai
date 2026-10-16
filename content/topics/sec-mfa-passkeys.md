---
id: sec-mfa-passkeys
title: "MFA and passkeys (WebAuthn)"
summary: A second factor, and then a factor that can't be phished
why: "Stolen and phished passwords are the most common way into accounts. A second factor stops most of that; passkeys also stop the phishing sites that defeat one-time codes."
requires: [sec-passwords]
lesson: none
points:
  - title: Not all second factors are equal
    text: "SMS codes can be intercepted or SIM-swapped, and any typed code can be relayed by a fake site. Authenticator apps are better; WebAuthn is phishing-resistant."
  - title: Public-key login
    text: "With a passkey, the device keeps a private key per site and signs a fresh challenge. The server stores only the public key, so a breach leaks nothing reusable."
  - title: Bound to the origin
    text: "The browser includes the site's origin in what is signed, and the authenticator only uses a key for the site it was created for. A look-alike domain gets nothing useful."
  - title: Plan recovery
    text: "Account recovery is often the weakest path. Let users register several passkeys and treat recovery codes or support resets as carefully as login."
quiz:
  - q: "A user enters their password and a six-digit authenticator-app code on a perfect copy of your site at `examp1e.com`. What can the attacker do?"
    options: ["Nothing; the code is single use", "Relay both to the real site within the code's lifetime and log in as the user", "Only see the password"]
    answer: 1
    explain: "Time-based codes are a big improvement over passwords alone, but a real-time phishing proxy can pass them straight through. WebAuthn binds the login to the real origin, so this relay fails."
  - q: What does the server store for a passkey?
    options: ["The private key, encrypted", "A credential ID and the public key (plus a little metadata)", "A hash of the user's fingerprint"]
    answer: 1
    explain: "The private key stays on the authenticator (or in the user's synced keychain). Biometrics only unlock it locally and are never sent to the server."
  - q: "NIST SP 800-63B classes one authenticator type as 'restricted'. Which?"
    options: ["Passkeys", "Out-of-band codes sent over the phone network (SMS or voice)", "Hardware security keys"]
    answer: 1
    explain: "PSTN delivery is restricted because of SIM swaps, number porting and interception. It can still be used, with extra risk assessment and an alternative offered."
links:
  - { title: "Web Authentication Level 3 (W3C)", url: "https://www.w3.org/TR/webauthn-3/" }
  - { title: "Passkeys (FIDO Alliance)", url: "https://fidoalliance.org/passkeys/" }
  - { title: "passkeys.dev developer resources", url: "https://passkeys.dev/" }
  - { title: "Multifactor Authentication Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html" }
---
Multi-factor authentication (MFA) asks for something besides the password, so a stolen password alone isn't enough. The factors differ a lot in strength. **Passkeys**, built on the W3C WebAuthn standard and the FIDO protocols, go furthest: they replace the shared secret with a key pair, and they are bound to your site's origin, so a phishing page can't use them.

## The ladder of second factors

From weakest to strongest:

1. **SMS or voice codes.** Better than nothing, but vulnerable to SIM swaps, number porting and interception. NIST SP 800-63B lists phone-network delivery as a *restricted* authenticator.
2. **Authenticator-app codes (TOTP)** and push approvals. No phone network involved, but the user can still type a code into a fake site, or approve a push they didn't start. "Push fatigue" attacks spam requests until someone taps yes; number matching helps.
3. **WebAuthn**: security keys and passkeys. Phishing-resistant by design.

## How a passkey login works

At **registration**, the user's authenticator (phone, laptop, password manager or USB key) creates a new key pair for your site. Your server stores the **public key** and a credential ID. The private key stays with the authenticator.

At **login**:

1. Your server sends a random challenge.
2. The browser passes it, together with your site's origin, to the authenticator.
3. The user unlocks the authenticator with a fingerprint, face or PIN. That check happens locally; the biometric never leaves the device.
4. The authenticator signs the challenge and origin data with the private key for your site's relying party ID.
5. Your server verifies the signature with the stored public key and checks the challenge and origin.

Three properties fall out. There is no shared secret to leak from your database. The signature covers a fresh challenge, so it can't be replayed. And because the browser reports the real origin and the authenticator only uses keys created for that site, `examp1e.com` can't get a usable signature for `example.com`.

## Synced and device-bound passkeys

Most consumer passkeys are **synced** through the platform's keychain or a password manager, so a new phone doesn't mean a lost account. **Device-bound** keys, typically hardware security keys, never leave the device. NIST allows synced passkeys at AAL2 but not at AAL3, which needs non-exportable keys; most consumer and business apps are fine with synced passkeys, while high-assurance admin access often uses hardware keys.

## Rolling it out

- Use a well-maintained WebAuthn library on the server; don't hand-roll the verification.
- Offer passkeys alongside passwords first, then as the default. Let users register more than one.
- Protect admin and staff accounts with phishing-resistant MFA first; they are the most valuable targets.
- Treat **recovery** as part of authentication. Email resets, support calls and recovery codes are how attackers get around strong login, so rate-limit them, notify the user, and add a delay or extra checks for sensitive changes.
