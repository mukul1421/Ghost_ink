# Ghost Ink

A Monkeytype-style typing test that turns your typing rhythm into a unique
digital signature. Built with vanilla HTML, CSS, and JavaScript. No
frameworks, no backend, no build step.

**Live demo:** [ghost-ink.vercel.app](https://ghost-ink.vercel.app/)

## Features

- Typing test with live WPM, accuracy, and consistency
- Selectable test durations (15, 30, 60, 120 seconds)
- Word-by-word input with a moving caret, extra-letter display, and backspace navigation to previous words
- Scrolling 3-line word window
- Per-keystroke timing capture, reduced to a small metrics vector (average delay, delay variance, error rate)
- SHA-256 signature key generated from those metrics using the Web Crypto API
- Generative identicon drawn on canvas from the signature key
- Sessions saved locally with IndexedDB
- Gallery page showing every saved signature, with per-session details

## How the signature works

1. While you type, the app records the time between every keystroke.
2. When the test ends, those timings are reduced to three numbers: average delay, delay variance, and error rate.
3. The numbers are hashed with SHA-256 (`crypto.subtle.digest`) to produce a 64-character key.
4. The key's bytes decide the color and filled cells of a symmetric 5x5 identicon.

Because your metrics shift slightly every run, each session produces its own signature.

## Run it

Open `index.html` in a browser, or serve the folder locally:

    python -m http.server 8000

then visit `http://localhost:8000`. All data stays in your browser's IndexedDB.

## Project structure

    index.html        typing test
    gallery.html      saved signatures
    css/style.css
    js/app.js         typing logic, metrics, signature generation
    js/db.js          IndexedDB wrapper (open, save, getAll)
    js/gallery.js     gallery rendering
    js/navbar.js      shared navigation
    js/words.js       word list

## License

MIT