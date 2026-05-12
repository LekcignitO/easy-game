# Turkish Delights: Match-3

A classical Match-3 casual mobile-friendly web game built with Phaser 3, Vite, and TypeScript.
Integrated with Yandex Games SDK for leaderboards and advertisements.

## Features

- Match-3 mechanics on an 8x8 grid.
- Swipe/click to swap candies.
- 60-second time limit per round.
- Score multipliers on cascaded merges.
- Full screen scaling for mobile.
- WebAudio API simple beep effects.
- Yandex SDK Integration:
  - LocalStorage / Yandex Player Data fallback.
  - Interstitial ads on round end.
  - Rewarded ads for +15s time limit.
  - Best Score sync and leaderboards.
- Localization (RU, EN, TR).

## Development

Install dependencies:
npm install

Start local dev server:
npm run start (alias for dev)

## Production Build (for Yandex Games)

Build project:
npm run build

This will create a `dist` folder. To upload to Yandex Games, simply ZIP the contents of the `dist` folder and upload it in your Yandex Games developer console.

The build handles relative paths required by the Yandex iframe (`base: './'`).
The `yandex.ru/games/sdk/v2` script is automatically injected in the `index.html`.
