---
id: next-assets-build
title: "Images, fonts and the build"
summary: What `next/image`, `next/font` and `next build` do for you
why: "The largest image and the web font are often what decides your LCP and CLS. Next.js handles both, but only if you give it the sizes it needs, and the build output is the first place to check what you actually shipped."
requires: [next-app-router, web-performance]
lesson: diagram
points:
  - title: Images resized on request
    text: "`<Image>` serves resized, modern-format copies from `/_next/image`, lazy by default. Width and height (or `fill`) reserve space so nothing shifts."
  - title: Fonts downloaded at build time
    text: "`next/font` fetches Google Fonts during the build and serves them from your own domain, with fallback metrics that avoid layout shift."
  - title: Turbopack builds by default
    text: "Since Next.js 16, `next dev` and `next build` use Turbopack. A custom webpack config makes the build fail until you migrate it or pass `--webpack`."
  - title: Hashed files cached forever
    text: "Built JS and CSS have content hashes in their names and get `public, max-age=31536000, immutable`, which you can't override."
quiz:
  - q: "A remote hero image has no `width` and `height`. What goes wrong?"
    options: ["Nothing: Next.js measures remote images at build time", "Next.js can't know its aspect ratio, so you must give dimensions or use `fill` inside a sized parent; otherwise it errors or the layout shifts", "It is served without optimisation"]
    answer: 1
    explain: "Static imports give Next.js the size automatically. Remote files aren't available during the build, so the dimensions must come from you."
  - q: "Your build machine has no internet access and the root layout uses `next/font/google`. What happens?"
    options: ["The font loads from Google in the browser instead", "The build fails because the font is downloaded during the build", "The font silently falls back to Arial"]
    answer: 1
    explain: "That is exactly what happened when this path's probe app was built offline: \"Failed to fetch Geist from Google Fonts\". Self-host the file with `next/font/local` in locked-down builds."
  - q: "Which image should get `preload` (formerly `priority`)?"
    options: ["Every image above the fold", "The one image that is the LCP element, such as the hero", "Small icons"]
    answer: 1
    explain: "Preloading inserts a `<link>` in the head so the browser fetches it before discovering it in the body. Preloading several images competes for bandwidth; for most cases `loading=\"eager\"` or `fetchPriority=\"high\"` is enough."
links:
  - { title: "Image Optimization (Next.js)", url: "https://nextjs.org/docs/app/getting-started/images" }
  - { title: "Image component (Next.js)", url: "https://nextjs.org/docs/app/api-reference/components/image" }
  - { title: "Font Optimization (Next.js)", url: "https://nextjs.org/docs/app/getting-started/fonts" }
  - { title: "next CLI (Next.js)", url: "https://nextjs.org/docs/app/api-reference/cli/next" }
---
Next.js includes three pieces of build and asset tooling that affect what users download. The `<Image>` component turns one source image into right-sized, modern-format variants served on demand from `/_next/image`, and reserves space for them. `next/font` downloads and self-hosts fonts at build time, so the browser never contacts a font provider. And `next build`, which uses Turbopack by default since Next.js 16, bundles the client code, prerenders what it can, and prints a route table that tells you what each route turned out to be.

## Images

```tsx
import Image from "next/image"
import hero from "./hero.jpg"          // static import: width, height and blur placeholder known

export default function Home() {
  return (
    <>
      <Image src={hero} alt="Our team at work" preload placeholder="blur" sizes="100vw" />
      <Image src="https://cdn.example.com/p/42.jpg" alt="Product 42" width={400} height={300} />
    </>
  )
}
```

- The optimiser resizes on request and caches results; the browser picks a size from the generated `srcset`. Give `sizes` for responsive images, or the browser may download a larger file than it shows.
- Images load lazily unless you say otherwise. Mark the one LCP image with `preload` (Next.js 16 deprecated `priority` for it).
- Remote hosts must be allowed in `images.remotePatterns`; `images.domains` is deprecated. Next.js 16 also tightened defaults: only quality 75 is allowed unless you list `images.qualities`, local IP addresses are blocked to avoid SSRF, and at most three redirects are followed.

## Fonts

```tsx
// app/layout.tsx
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"], display: "swap" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={inter.className}><body>{children}</body></html>
}
```

The font files are downloaded during `next build` and served as static assets from your domain, with a size-adjusted fallback so text doesn't jump when the web font arrives. Because of that download, a build without internet access fails. Building this path's probe app in a sandbox stopped with "Failed to fetch Geist from Google Fonts" until the font import was removed. Use `next/font/local` with a checked-in file for offline or locked-down CI.

## The build

`next build` compiles with Turbopack, type-checks, prerenders routes, and prints a table where ○ is static, ◐ is a partial prerender, and ƒ is rendered per request, with the revalidate and expire times of cached routes. Read it after every significant change; a route turning ƒ is a performance regression you can see before shipping. A custom `webpack` function in `next.config` makes the default build fail on purpose; migrate it to `turbopack` options or build with `--webpack`.

Output in `.next/static` has content-hashed names, and Next.js serves it as `public, max-age=31536000, immutable`; a deploy changes the names, so nothing needs purging.

```trace diagram
id: build-and-assets
title: What next build makes, and what waits for a request
subtitle: "Bundles, prerendered routes and fonts at build time; images on demand"
groups:
  - { id: build-time, label: next build }
elements:
  - { id: code, label: Your code, sub: "app/, components, next.config", kind: person, row: 0, role: data }
  - { id: google, label: Google Fonts, sub: contacted by the build only, kind: external, row: 0 }
  - { id: build, label: Compile and prerender, sub: "Turbopack by default, type-check", kind: system, group: build-time, row: 1 }
  - { id: bundles, label: Client bundles, sub: ".next/static, content-hashed", tone: data, group: build-time, row: 2, role: data }
  - { id: routes, label: Prerendered routes, sub: "route table: ○ ◐ ƒ", tone: data, group: build-time, row: 2 }
  - { id: fonts, label: Self-hosted fonts, sub: + a size-adjusted fallback, tone: data, group: build-time, row: 2 }
  - { id: source, label: Source image, sub: "a static import or an allowed remote host", kind: external, row: 1 }
  - { id: server, label: Your domain, sub: "max-age=31536000, immutable", kind: system, row: 3 }
  - { id: optimiser, label: /_next/image, sub: "resizes on request, caches", tone: stream, row: 3, role: service }
  - { id: browser, label: Browser, sub: picks a size from srcset, kind: person, row: 4 }
edges:
  - { id: compile, from: code, to: build }
  - { id: fetch-fonts, from: google, to: build, style: dashed, flow: main }
  - { id: emit-bundles, from: build, to: bundles }
  - { id: emit-routes, from: build, to: routes }
  - { id: emit-fonts, from: build, to: fonts }
  - { id: serve-bundles, from: bundles, to: server }
  - { id: serve-routes, from: routes, to: server }
  - { id: serve-fonts, from: fonts, to: server }
  - { id: to-browser, from: server, to: browser }
  - { id: resize, from: source, to: optimiser }
  - { id: image-out, from: optimiser, to: browser }
steps:
  - caption: "next build compiles with Turbopack, the default since Next.js 16, and type-checks. A custom webpack function in next.config makes it fail on purpose: migrate it, or build with --webpack."
    trace: [compile]
  - caption: "next/font downloads the font files during the build, so a build without internet access fails. The probe app stopped with \"Failed to fetch Geist from Google Fonts\"; next/font/local with a checked-in file avoids that."
    trace: [fetch-fonts, emit-fonts]
  - caption: "It prerenders what it can and prints the route table: ○ static, ◐ partial prerender, ƒ per request, with revalidate and expire times. A route turning ƒ is a regression you can see before shipping."
    trace: [emit-routes]
  - caption: "Client code lands in .next/static with content-hashed names, served as public, max-age=31536000, immutable. A deploy changes the names, so nothing needs purging."
    trace: [emit-bundles, serve-bundles]
  - caption: "Fonts are served from your own domain like any other static asset, so the browser never contacts a font provider, and the fallback is sized so text doesn't jump."
    trace: [serve-fonts, serve-routes, to-browser]
  - caption: "Images are not made at build time. <Image> points the browser at /_next/image, which resizes the source on request and caches the result. Remote hosts must be listed in images.remotePatterns."
    trace: [resize]
  - caption: "The browser picks a size from the generated srcset; give sizes for responsive images, or it may fetch a bigger file than it shows. Images load lazily, except the LCP image you mark with preload."
    trace: [image-out]
  - caption: "Next.js 16 also tightened image defaults: only quality 75 unless you list images.qualities, local IP addresses blocked to avoid SSRF, and at most three redirects followed."
    focus: [optimiser, source]
```
