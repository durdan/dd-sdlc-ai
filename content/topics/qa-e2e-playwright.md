---
id: qa-e2e-playwright
title: End-to-end tests with Playwright
summary: A real browser, user-facing locators, no sleeps
why: "End-to-end tests are the only ones that see what a user sees. Written carelessly, they are also the slowest and flakiest part of a suite."
requires: [qa-strategy]
lesson: none
points:
  - title: Actions wait for you
    text: "Before a click, Playwright waits until the element is visible, stable, enabled and not covered by anything else."
  - title: Assertions retry
    text: "await expect(locator).toBeVisible() keeps checking until it passes or times out (5 seconds by default), so there is no need for sleeps."
  - title: Locate like a user
    text: "Find elements by role, label and text, not by CSS chains that change with every redesign."
  - title: Isolated and traceable
    text: "Each test gets a fresh browser context. On failure, a trace lets you step through every action, DOM snapshot and request."
quiz:
  - q: Why is this assertion flaky?
    code: |
      await page.getByRole("button", { name: "Save" }).click()
      expect(await page.getByText("Saved").isVisible()).toBe(true)
    options:
      - getByText is deprecated
      - "isVisible() checks once, right away; if the message appears 50 ms later the test fails"
      - toBe cannot compare booleans
    answer: 1
    explain: "isVisible() returns the state at that moment and doesn't wait. Use await expect(page.getByText(\"Saved\")).toBeVisible(), which retries until the timeout."
  - q: "A cookie banner covers the Checkout button. What does click() do?"
    options:
      - Clicks the banner instead
      - "Waits for the button to receive events at the click point, and fails with a timeout if the banner stays"
      - Clicks through the banner using JavaScript
    answer: 1
    explain: "\"Receives events\" is one of the actionability checks. Playwright refuses to click something a user couldn't click, which is a real bug for you to handle in the test or the app."
  - q: How does Playwright Test keep tests from leaking cookies and storage into each other?
    options:
      - It restarts the browser before every test
      - "Each test gets a new browser context: its own cookies, local storage and session storage"
      - It doesn't; you must clear storage yourself
    answer: 1
    explain: "Contexts are cheap, incognito-like profiles inside one browser. That makes tests independent, so they can run in any order and in parallel."
links:
  - { title: "Auto-waiting and actionability (Playwright)", url: "https://playwright.dev/docs/actionability" }
  - { title: "Locators (Playwright)", url: "https://playwright.dev/docs/locators" }
  - { title: "Best practices (Playwright)", url: "https://playwright.dev/docs/best-practices" }
  - { title: "Trace viewer (Playwright)", url: "https://playwright.dev/docs/trace-viewer" }
---
An end-to-end test drives a real browser through a real user journey against the running app. Playwright makes these tests reliable by default: actions wait for elements to be ready, assertions retry until they pass or time out, and every test gets a fresh, isolated browser context. Keep this layer for the journeys that matter most, and leave the detailed cases to cheaper layers.

## A journey, written like a user

```ts
import { expect, test } from "@playwright/test"

test("a customer can buy a T-shirt", async ({ page }) => {
  await page.goto("/products/tshirt")
  await page.getByLabel("Size").selectOption("M")
  await page.getByRole("button", { name: "Add to cart" }).click()

  await page.getByRole("link", { name: "Cart" }).click()
  await expect(page.getByRole("listitem")).toHaveCount(1)

  await page.getByRole("button", { name: "Check out" }).click()
  await expect(page.getByRole("heading", { name: "Thank you for your order" })).toBeVisible()
})
```

There are no waits in it. Each `click()` first runs **actionability checks**: the element must be visible, stable (not animating), enabled, and the actual target at the click point, not hidden under an overlay. Each `expect(locator)` is a **web-first assertion** that keeps querying the page until it matches, 5 seconds by default (`expect.timeout` in the config changes that).

## Locators that survive redesigns

Prefer `getByRole`, `getByLabel`, `getByPlaceholder` and `getByText`. They describe what a user perceives, and they double as a light accessibility check: if you can't find a button by its role and name, neither can a screen reader. Use `getByTestId` when there is no accessible name. Avoid long CSS or XPath chains such as `div.cart > ul li:nth-child(2) button`, which break whenever the markup changes. Narrow down with `filter` and chaining instead:

```ts
await page.getByRole("listitem").filter({ hasText: "T-shirt" }).getByRole("button", { name: "Remove" }).click()
```

## Isolation and speed

Logging in through the UI in every test is slow. A **setup project** logs in once and saves the cookies and storage to a file, and other projects start from that file:

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: !process.env.CI },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
})
```

Other habits:

- Create test data through the API in a `beforeEach` or a fixture, not through the UI.
- Don't test third-party sites. Mock their responses with `page.route()`.
- Turn on the `@typescript-eslint/no-floating-promises` lint rule. A missing `await` is a common cause of tests that pass without checking anything.
- `npx playwright codegen <url>` records a session and suggests locators, which is a quick way to start a test.

## When it fails: the trace

With `trace: "on-first-retry"`, a failing test that is retried records a trace: every action with its locator, DOM snapshots before and after, console output and network requests. Open it with `npx playwright show-trace trace.zip`, or drop it on trace.playwright.dev. It usually shows you the cause straight away: the button that was disabled, the request that returned 500, the dialog nobody expected.
