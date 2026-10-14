/**
 * The SDLC.dev product (idea-to-spec, dashboard, sign-in…) is not offered right
 * now. Its code stays in the repo; set NEXT_PUBLIC_SDLC_PRODUCT=on to bring it back.
 */
export const SDLC_PRODUCT = process.env.NEXT_PUBLIC_SDLC_PRODUCT === "on"

/** Routes that belong to the product and are hidden while it is off. Sign-in stays available. */
export const PRODUCT_ROUTES =
  /^\/(idea-to-spec|dashboard|project|spec|epic-to-spec|analyze|claude-code|claude-stream-test|usage-dashboard|prompts|admin|test-oauth|about)(\/|$)/
