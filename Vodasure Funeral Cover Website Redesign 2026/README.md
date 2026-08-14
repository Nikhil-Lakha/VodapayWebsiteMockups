# VodaSure Funeral Cover Website Redesign 2026

A self-contained, responsive prototype of the VodaSure Funeral Cover quote and application journey. It uses plain HTML, CSS and JavaScript and has no runtime dependencies or external asset requests.

## Preview locally

From the repository root, run:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080/Vodasure%20Funeral%20Cover%20Website%20Redesign%202026/`

Opening `index.html` directly also works, but a local HTTP server more closely matches production hosting.

## Adobe Target integration

Load these files in this order:

1. `styles.css` — page styles and responsive layouts.
2. `index.html` — the application markup (use the contents of `<body>` when injecting into an existing page).
3. `app.js` — validation, navigation and application interactions; load after the markup.

Copy the `assets/` directory alongside the three files and preserve the relative paths. For an Adobe Target HTML offer, asset URLs may need to be prefixed with the published subfolder path if the offer is injected into a page at a different URL depth.

## Files

```text
.
├── README.md
├── app.js
├── index.html
├── styles.css
└── assets
    ├── shield-heart.svg
    └── vodasure-logo.svg
```

## Journey behaviour

- Responsive full-page landing screen and four-step application.
- Required-field, ID number, mobile number and email validation.
- Selectable cover options with live premium updates.
- Back navigation, editable review, confirmation state and accessible dialogs.
- Keyboard-focus styles, semantic form controls and reduced-motion support.

> This is a front-end prototype. Submission is simulated in the browser and no personal information is sent or stored.
