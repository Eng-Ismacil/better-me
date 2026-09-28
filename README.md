This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# better-me habit tracker app

## Android WebView App

The Android project is a native Capacitor app named **BetterMe**. It opens the production site directly inside Android WebView and uses the generated BetterMe launcher icon; it does not open Chrome's PWA install flow.

The default WebView URL is `https://better-me1.vercel.app`. To use a different site, set the optional `CAPACITOR_SERVER_URL` environment variable when syncing:

```bash
CAPACITOR_SERVER_URL=https://your-domain.example npm run android:sync
```

For local device testing, use the development computer's LAN IP (not `localhost`):

```bash
CAPACITOR_SERVER_URL=http://192.168.1.20:3000 npm run android:sync
```

Replace the example IP with the address of the computer running `npm run dev`. The phone and computer must be on the same network.

To open the native project, install Android Studio with JDK 21 and Android SDK 36, then run:

```bash
npm run android:sync
npm run android:open
```

Alternatively, with JDK 21 and Android SDK 36 configured, build a debug APK with:

```bash
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.
