---
id: rust-cargo
title: Cargo, crates and editions
summary: One tool to build, test and fetch; editions evolve the language without splitting it
why: "Every Rust project starts with Cargo. Knowing how it resolves versions, what Cargo.lock is for, and what an edition does saves you from confusing builds and failed upgrades."
lesson: none
points:
  - title: A crate is a compilation unit
    text: A binary crate builds an executable, a library crate builds something others depend on. A package (one Cargo.toml) holds one or more crates.
  - title: Semver by default
    text: "serde = \"1.0\" means any compatible 1.x from 1.0 up. Cargo picks the newest compatible version and records it in Cargo.lock."
  - title: Editions are opt-in, per crate
    text: The edition key selects language rules (2015, 2018, 2021 or 2024). Crates of different editions link together freely.
  - title: Debug and release profiles
    text: cargo build is fast to compile and slow to run; cargo build --release turns optimisations on. Benchmark only release builds.
quiz:
  - q: "Cargo.toml says rand = \"0.8.3\". Which versions can Cargo choose?"
    options:
      - Exactly 0.8.3
      - "Any 0.8.x from 0.8.3 up, but not 0.9"
      - Anything newer than 0.8.3, including 1.0
    answer: 1
    explain: "A bare version is a caret requirement. For 0.x versions the minor number is treated as the breaking one, so ^0.8.3 allows 0.8.3 up to, but not including, 0.9.0."
  - q: "Your library uses the 2024 edition and depends on a crate written for 2018. What happens?"
    options:
      - It doesn't compile until the dependency migrates
      - It works; each crate is compiled with its own edition's rules
      - Cargo silently upgrades the dependency to 2024
    answer: 1
    explain: "The core rule of editions is that crates of different editions interoperate. An edition changes how source code is read, not the compiled interface."
  - q: "Should an application commit Cargo.lock?"
    options:
      - "Yes, so every build uses the exact versions you tested"
      - No, never
      - Only if it has no dependencies
    answer: 0
    explain: "Cargo.lock pins every crate in the graph, which is what makes an application's builds repeatable. cargo new tracks it by default. A library's lock file only affects its own builds and CI; its users resolve versions themselves."
links:
  - title: The Cargo Book
    url: https://doc.rust-lang.org/cargo/
  - title: "The Cargo Book: the manifest format"
    url: https://doc.rust-lang.org/cargo/reference/manifest.html
  - title: "The Edition Guide: what are editions?"
    url: https://doc.rust-lang.org/edition-guide/editions/index.html
  - title: "The Edition Guide: Rust 2024"
    url: https://doc.rust-lang.org/edition-guide/rust-2024/index.html
---
Cargo is Rust's build system and package manager in one. `cargo new` makes a project, `cargo build` compiles it and its dependencies, `cargo test` runs the tests, `cargo run` builds and runs, and `cargo add` adds a dependency from crates.io. The compiler, `rustc`, works on one **crate** at a time: a tree of modules that compiles to a library or an executable. Cargo works out which crates to build, in which order, with which flags.

## Cargo.toml and Cargo.lock

```toml
[package]
name = "shop"
version = "0.1.0"
edition = "2024"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
proptest = "1"

[profile.release]
lto = true
```

- Version requirements are **semver ranges**. `"1.0"` means `^1.0`: at least 1.0.0 and below 2.0.0. For `0.x` versions the minor number counts as breaking, so `"0.8.3"` allows up to, not including, 0.9.0.
- Cargo picks the **newest** version that satisfies everyone (unlike Go's minimal version selection) and writes the exact choice to **Cargo.lock**. Later builds reuse the lock until you run `cargo update`. With the 2024 edition the resolver also prefers versions whose declared `rust-version` your toolchain supports.
- Two incompatible major versions of one crate can both appear in a build. That works, but their types are different types, which is a common source of puzzling "expected `X`, found `X`" errors.
- **Features** are optional parts of a crate you switch on. Features are additive: if any crate in the graph enables one, every user of that crate gets it.

## Profiles

`cargo build` uses the `dev` profile: no optimisation, debug assertions and integer overflow checks on. `cargo build --release` optimises, which can make code many times faster. Iterators, generics and other zero-cost abstractions only become zero-cost once the optimiser runs, so never measure performance in a debug build.

## Editions

An edition is a set of language rules chosen per crate with the `edition` key. New editions come out every few years (2015, 2018, 2021, and 2024 with Rust 1.85) and may change syntax or defaults in ways that would otherwise break code. The rule that makes this work: **crates of every edition interoperate**, so each crate migrates when it is ready. `cargo fix --edition` applies most of the mechanical changes.

The 2024 edition, for example, requires `unsafe extern` blocks and `#[unsafe(no_mangle)]`, changes how long temporaries in `if let` and at the end of a block live, makes `impl Trait` return types capture all lifetimes in scope by default, reserves the `gen` keyword, turns references to `static mut` into an error by default, and marks `std::env::set_var` as `unsafe`. `cargo new` picks the newest edition.

## The rest of the toolbox

`cargo fmt` (rustfmt) formats code, `cargo clippy` adds hundreds of lints, `cargo doc --open` builds documentation for your crate and every dependency, and `rustup` installs and switches toolchains. A `rust-toolchain.toml` file pins the toolchain version for a project.
