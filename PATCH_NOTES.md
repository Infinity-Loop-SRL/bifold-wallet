### Patches

#### @credo-ts-anoncreds-npm-0.5.19-09c3e8bbd1.patch

Treat no-identifer requests as unqualified

#### @credo-ts-core-npm-0.5.19-0177059ca8.patch

One dif presentation bug fix for MDoc / OID4VC

#### @credo-ts-indy-vdr-npm-0.5.19-f8bd108d78.patch

Prevent error on agent restart when same IndyVDR pool is reused. Prevent bug with revocation registry interval

#### @credo-ts-openid4vc-npm-0.5.19-4d16a6c35e.patch

Patches by Ontario team for various issues with openid4vc

#### @hyperledger-indy-vdr-react-native-npm-0.2.3-d7ed0b15da.patch

One patch to fix an edge with signed integers

#### @sphereon-pex-npm-3.3.3-144d9252ec.patch and @animo-id-pex-npm-4.1.1-alpha.0-f20edfffa2.patch

Fixes local-dev-only bug with yarn install (I don't know why an npm package wants to force pnpm usage, seems like they left this over from their local development)

## RoDID pilot — fmt / Xcode 26 build patch

Xcode 26's clang rejects the compile-time format-string checking in the `fmt`
11.0.2 pod pinned by React Native 0.81 ("call to consteval function ... is not
a constant expression"). After **every** `pod install` in `samples/app/ios`,
force fmt's runtime-checked path before building:

in `samples/app/ios/Pods/fmt/include/fmt/base.h`, at the top of the
"Detect consteval" block (~line 114), insert:

```c
#if 1
#  define FMT_USE_CONSTEVAL 0
#elif !defined(__cpp_lib_is_constant_evaluated)
```

(replacing the original `#if !defined(__cpp_lib_is_constant_evaluated)` line).
`FMT_USE_CONSTEVAL` is not `#ifndef`-guarded, so a `-D` flag cannot override it.

## RoDID pilot — Xcode 27 / Ruby 4 build notes (2026-09-15)

- **fmt patch is now automatic**: the Podfile `post_install` hook rewrites
  `Pods/fmt/include/fmt/base.h` (`FMT_USE_CONSTEVAL 0`) on every `pod install`;
  the manual step above is no longer needed.
- **Deployment targets**: Xcode 27 refuses pods declaring iOS < 15. The same
  hook lifts every pod's `IPHONEOS_DEPLOYMENT_TARGET` to 15.1.
- **UIScene lifecycle**: the iOS 27 SDK traps (SIGTRAP in
  `__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`) apps that
  still create their window in `application(_:didFinishLaunchingWithOptions:)`.
  `AppDelegate.swift` now keeps only the React Native factory; a `SceneDelegate`
  (same file) creates the window, starts React Native and forwards deep links /
  universal links. `Info.plist` carries the matching `UIApplicationSceneManifest`.
- **Ruby 4 (Homebrew)**: `nkf`/`kconv` left the default gems, CocoaPods still
  needs it — `gem 'nkf'` added to `samples/app/Gemfile`. CocoaPods also needs
  `LANG=en_US.UTF-8`.
- **`react-native run-ios`** aborts on this Xcode because `Simulator.app` is not
  at the path the CLI expects. Build with `xcodebuild` and install with
  `xcrun simctl install booted …/AriesBifold.app` instead; Metro is started
  separately (`yarn start`).
