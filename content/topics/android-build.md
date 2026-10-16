---
id: android-build
title: The build, from Gradle to Play
summary: Gradle, App Bundles, R8 and two signing keys
why: "What you upload is not what users install. Play builds device-specific APKs from your bundle and signs them with a key Google holds, after R8 has rewritten your code."
lesson: none
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
