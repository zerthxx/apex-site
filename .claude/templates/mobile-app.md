# Mobile App Template

Read `.claude/templates/_foundations.md` first. This template covers two distinct paths — pick deliberately, don't default to the second just because it's less work:

1. **WebView wrapper** (this workspace's actual approach — see `apex-app/`): a thin Expo/React Native shell around the existing web app's live URL. Fastest to ship, reuses 100% of the web app's logic, but is constrained to what a WebView can do (no deep native features, app-store review sometimes scrutinizes "is this just a website" wrappers).
2. **Native/Expo app with its own logic**: a real React Native app calling the same Supabase backend directly (via `@supabase/supabase-js`, not `@supabase/ssr`) instead of rendering the web app. More work, but full native capability (offline, native navigation, camera, etc.).

## Recommended architecture

**Path 1 (WebView wrapper)** — mirror `apex-app/`:
- `WebViewScreen.tsx` renders the deployed web app's URL inside `react-native-webview`.
- Bottom-tab or stack navigation (`AppNavigator.tsx`) is native chrome around the WebView, not a reimplementation of the web app's routing.
- Network state (`useNetworkStatus` → an offline screen) and platform back-button handling are the two things a WebView needs that a browser tab doesn't.
- Push notifications are the one piece of real native functionality typically worth adding on top of a WebView wrapper (`expo-notifications`), since a WebView alone can't receive them.
- Deep links (`yourapp://`, plus the `https://yourdomain.com/...` universal-link equivalent) should map 1:1 to real routes in the underlying web app.

**Path 2 (native logic)**:
- Reuse the same Supabase schema/RLS as the web app if one already exists — do not create a parallel backend; both clients hit the same tables under the same policies.
- Structure by feature/screen, not by technical layer, following whatever convention Expo Router or React Navigation encourages for the chosen navigation library.

## Folder structure

Path 1 (matches `apex-app/`):
```
src/
├── screens/WebViewScreen.tsx, OfflineScreen.tsx
├── navigation/AppNavigator.tsx
├── hooks/useNetworkStatus.ts, useBackHandler.ts
├── utils/notifications.ts
├── constants.ts            SITE_BASE_URL and other config
```

Path 2:
```
src/
├── app/ (Expo Router) or screens/ (React Navigation)
├── lib/supabase.ts          client using @supabase/supabase-js directly (no cookie-based SSR client)
├── components/
```

## Tech stack additions

- Expo (pin the version deliberately and check its actual current docs before writing Expo-specific code — Expo's API surface changes enough between versions that general training-data assumptions can be wrong; this workspace's own `apex-app` is pinned to `~56.0.12` for exactly this reason).
- `react-native-webview` (Path 1 only).
- Push notifications: Expo's push notification service (`expo-notifications`).
- EAS Build for cloud APK/AAB/IPA builds — no local Android Studio/Xcode required for CI-style builds.

## Database design

- Path 1: none — all data access happens through the wrapped web app.
- Path 2: identical schema/RLS design as any other client of the same Supabase backend — use `/database`. The mobile client authenticates the same way (Supabase Auth) and is subject to the same RLS policies; there is no separate "mobile" authorization model.

## Authentication

- Path 1: authentication happens entirely inside the WebView, using the web app's existing session/cookie flow — the native shell holds no auth state of its own.
- Path 2: use Supabase Auth's mobile-appropriate flow (the JS client's session persistence, not cookie-based SSR) and store the session securely (`expo-secure-store`), not in plain `AsyncStorage`.

## API structure

- Path 1: none beyond what the web app already exposes.
- Path 2: the mobile client calls the same `/api/*` routes (or Supabase directly) as the web app — don't build a parallel mobile-only API unless there's a genuine reason (e.g., a payload shape only mobile needs).

## UI components

- Path 1: native chrome only — tab bar, offline screen, and (if used) a native splash/loading screen while the WebView loads. Resist rebuilding web UI natively; that defeats the point of this path.
- Path 2: native equivalents of the web app's key screens, respecting each platform's conventions (iOS vs. Android navigation patterns, safe-area handling, native gestures) rather than porting web layout 1:1.

## Security checklist

Per foundations, plus:
- [ ] (Path 1) The WebView only loads the trusted app domain — restrict navigation so the WebView can't be redirected to an arbitrary external URL.
- [ ] (Path 2) Session tokens are stored in secure, encrypted device storage (`expo-secure-store`), never plain `AsyncStorage`.
- [ ] Push notification payloads never include sensitive data that shouldn't appear in a lock-screen preview.
- [ ] Deep links are validated before acting on them (don't trust an arbitrary deep-link payload to trigger a privileged action without its own auth check).

## Performance checklist

Per foundations, plus:
- [ ] (Path 1) Offline state is detected and handled gracefully — a blank WebView on a dropped connection is a common, avoidable failure mode.
- [ ] (Path 2) Lists use a virtualized component (`FlatList`/`FlashList`), never `.map()` over a large array in a `ScrollView`.
- [ ] App startup time is measured on a real device, not just the simulator, before shipping.

## Deployment checklist

Run `/deploy` for anything server-side this app depends on, plus:
- [ ] `eas build --profile production` succeeds for both platforms before submission.
- [ ] Store metadata (screenshots, privacy policy URL, permissions justifications) is prepared — app review requires this, and a WebView-wrapper app in particular may need to justify why it's not "just a website" during review.
- [ ] Push notification credentials (APNs key, FCM config) are set up in the Expo/EAS project, not just locally.
- [ ] Deep link / universal link association files (`apple-app-site-association`, Android App Links) are hosted at the expected paths on the real domain.

## Development phases

1. **Shell**: navigation, the core screen (WebView or native home screen), offline/error handling. → `/frontend` (mobile scope)
2. **Native essentials**: push notifications, deep linking, back-button/platform-specific behavior.
3. **(Path 2 only) Feature parity**: port each web feature to native screens against the same backend.
4. **Store readiness**: icons, splash screens, store metadata, permissions justification.
5. **Hardening**: `/security` (WebView domain restriction or secure token storage, depending on path), real-device performance check, `/deploy` for any backend this app depends on.

## Best practices

- Don't duplicate business logic into the mobile app if Path 1 (WebView) already gives you the real app for free — every duplicated piece of logic is a second place for it to go stale.
- Check the pinned Expo SDK's actual current documentation before writing Expo-specific code; don't assume a general "React Native" mental model matches this specific SDK version.
- Keep the native shell thin (Path 1) unless there's a concrete, justified reason to go native (device APIs, offline-first requirements, app-store positioning).
