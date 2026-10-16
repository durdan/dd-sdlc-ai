---
id: android-build
title: The build, from Gradle to Play
summary: Gradle, App Bundles, R8 and two signing keys
why: "What you upload is not what users install. Play builds device-specific APKs from your bundle and signs them with a key Google holds, after R8 has rewritten your code."
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: "Gradle with the Android plugin", text: "The Android Gradle Plugin turns sources and resources into DEX, packages them per build type and flavour, and produces APKs or a bundle." }
  - { title: "Bundle in, APKs out", text: "An Android App Bundle (AAB) is a publishing format; Play generates optimised split APKs for each device. New Play apps must use it." }
  - { title: "R8 shrinks and renames", text: "R8 removes unused code and resources, optimises and obfuscates. Keep rules protect code reached by reflection." }
  - { title: "Upload key vs app signing key", text: "With Play App Signing you sign uploads with an upload key; Google signs what users get with the app signing key." }
quiz:
  - q: What does a user's phone install when you publish an AAB on Google Play?
    options:
      - The AAB file itself
      - APKs that Play generated from the bundle for that device's screen density, CPU architecture and language
      - A universal APK containing everything
    answer: 1
    explain: "The bundle isn't installable. Play splits it into a base APK plus configuration APKs, so each device downloads only what it uses. bundletool does the same locally."
  - q: The release build crashes with ClassNotFoundException in a JSON model class, while debug works. The likely cause?
    options:
      - R8 removed or renamed a class that is only reached by reflection; add a keep rule (or use a codegen-based library)
      - The release build uses a different Kotlin version
      - Release builds can't parse JSON
    answer: 0
    explain: "R8 only keeps what it can see being used. Reflection-based serialisers, and classes named in strings, need keep rules; most libraries ship their own consumer rules."
  - q: Your upload key is lost. With Play App Signing enabled, what happens?
    options:
      - The app can never be updated again
      - You request an upload key reset in Play Console; the app signing key, held by Google, doesn't change
      - You publish under a new package name
    answer: 1
    explain: "Splitting the keys is the point of Play App Signing: the upload key only proves an upload came from you and can be replaced. Losing the app signing key itself (without Play App Signing) would block updates."
links:
  - { title: "Configure your build (Android Developers)", url: "https://developer.android.com/build" }
  - { title: "About Android App Bundles (Android Developers)", url: "https://developer.android.com/guide/app-bundle" }
  - { title: "Enable app optimization with R8 (Android Developers)", url: "https://developer.android.com/topic/performance/app-optimization/enable-app-optimization" }
  - { title: "Sign your app (Android Developers)", url: "https://developer.android.com/studio/publish/app-signing" }
---
An Android build is a Gradle build driven by the Android Gradle Plugin (AGP). It compiles Kotlin to JVM bytecode, runs annotation processors (KSP), compiles resources, converts bytecode to DEX for the Android runtime, optimises with R8 for release, and packages the result. What comes out for Play is an **Android App Bundle**, and what users install is something Play builds from it.

## Modules, build types, flavours

```kotlin
// app/build.gradle.kts
android {
    namespace = "com.example.shop"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.example.shop"
        minSdk = 24
        targetSdk = 35          // opts into the behaviour changes of that version
        versionCode = 42        // must increase with every Play upload
        versionName = "2.3.0"
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    productFlavors { /* e.g. "free" and "paid", combined with each build type into variants */ }
}
```

`compileSdk` is the API you compile against, `minSdk` the oldest device you install on, and `targetSdk` the version whose behaviour rules you have adopted. Play requires a recent `targetSdk` for new apps and updates, and the bar rises each year. Dependencies are usually declared in a version catalog (`gradle/libs.versions.toml`).

## APK and AAB

An **APK** is the installable archive: DEX, resources, native libraries, manifest, signature. An **AAB** is a publishing format holding everything for every device. Play generates split APKs from it: a base APK plus configuration splits for screen density, CPU architecture (ABI) and language, so a phone downloads only what it uses. New apps on Play have had to use bundles since August 2021. To see what Play will produce, use `bundletool build-apks` locally.

## R8

With minification on, R8 does four things to release builds: **shrinks** (removes unreachable classes and methods), **optimises** (inlines, removes dead branches), **obfuscates** (renames to short names) and, with `isShrinkResources`, removes unused resources. Apps get smaller and faster to start. The cost is that code reached only by reflection looks unused:

```text
# proguard-rules.pro
-keep class com.example.shop.api.dto.** { *; }
```

Upload the mapping file (`mapping.txt`, Play does this from bundles automatically) so stack traces can be de-obfuscated. **Version note:** AGP 9.3 introduces a single `optimization { enable = true }` block in place of the two flags above, which remain for older AGP versions.

## Signing

Android installs only signed APKs, and updates must be signed with the same key as the installed app. With **Play App Signing** (required for bundles), there are two keys:

- the **upload key**, which you keep and use to sign the AAB you upload;
- the **app signing key**, which Google keeps and uses to sign the APKs users install.

If the upload key leaks or is lost, you can ask for it to be reset. Keep keystores and passwords out of the repository: CI reads them from secrets. Debug builds use an auto-generated debug key, which is why a debug build can't update a Play install.

```trace diagram
id: play-release
title: From Gradle to a user's phone
subtitle: Build, shrink, bundle, sign twice
direction: DOWN
groups:
  - { id: build, label: Gradle build (AGP) }
  - { id: play, label: Google Play }
elements:
  - { id: sources, label: Kotlin and resources, sub: "compiled, KSP runs", group: build, row: 0 }
  - { id: r8, label: R8, sub: "shrink, optimise, obfuscate, DEX", group: build, row: 1 }
  - { id: aab, label: App Bundle (.aab), sub: "every ABI, density, language", group: build, row: 2 }
  - { id: uploadkey, label: Upload key, sub: "yours, can be reset", kind: store, group: build, row: 1, role: security }
  - { id: console, label: Play Console, sub: versionCode must increase, group: play, row: 3, role: external }
  - { id: appkey, label: App signing key, sub: held by Google, kind: store, group: play, row: 3, role: security }
  - { id: splits, label: Split APKs, sub: "base + density, ABI, language", group: play, row: 4 }
  - { id: phone, label: User's phone, sub: installs only its splits, kind: person, row: 5 }
edges:
  - { id: compile, from: sources, to: r8}
  - { id: bundle, from: r8, to: aab }
  - { id: signup, from: uploadkey, to: aab, flow: security }
  - { id: upload, from: aab, to: console, label: upload }
  - { id: generate, from: console, to: splits}
  - { id: signapp, from: appkey, to: splits, flow: security }
  - { id: install, from: splits, to: phone }
steps:
  - caption: What you upload is not what users install. Play builds device-specific APKs from your bundle and signs them with a key Google holds, after R8 has rewritten your code.
  - caption: The Android Gradle Plugin compiles Kotlin and resources. For a release build with minification on, R8 shrinks, optimises and obfuscates the code and produces DEX; isShrinkResources drops unused resources.
    focus: [sources, r8]
    trace: [compile]
  - caption: R8 keeps only what it can see being used, so code reached by reflection needs keep rules. The mapping file turns obfuscated stack traces back into names. AGP 9.3 replaces the two flags with one optimization block.
    focus: [r8]
  - caption: The output is an Android App Bundle, signed with your upload key. A bundle holds everything for every device and can't be installed itself.
    focus: [r8, aab, uploadkey]
    trace: [bundle, signup]
  - caption: You upload it to Play Console. versionCode must go up with every upload, and new apps have had to use bundles since August 2021.
    focus: [aab, console]
    trace: [upload]
  - caption: With Play App Signing, Google keeps the app signing key. Play generates a base APK plus configuration splits from the bundle and signs them with that key.
    focus: [console, appkey, splits]
    trace: [generate, signapp]
  - caption: Each phone downloads only the splits for its screen density, CPU architecture and languages. Updates must carry the same app signing key as the installed app.
    focus: [splits, phone]
    trace: [install]
  - caption: That is why there are two keys. A lost or leaked upload key can be reset in Play Console, while the key users' phones trust never changes. Debug builds use a debug key, so they can't update a Play install.
    focus: [uploadkey, appkey]
note: Run bundletool build-apks locally to see the APKs Play will generate from a bundle.
```
