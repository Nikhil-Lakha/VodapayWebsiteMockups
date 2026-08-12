# VodaPay Voucher Campaign Landing Page

Static, self-contained export of Experience B for the Voucher Advance campaign.

## Run locally

Serve the repository root with any static web server, then open:

`/voucher-campaign-landing-page/`

All page resources use document-relative paths, so the same files work from the GitHub Pages repository subdirectory.

## Adobe Target integration

The campaign is deliberately separated into `index.html`, `campaign.css`, `campaign.js`, and `assets/`. For a Target implementation, inject the markup inside `<main>` into the existing page, load the stylesheet and script from the GitHub Pages HTTPS URLs, and scope/QA the offer against the production page CSS and Content Security Policy.

The JavaScript fires the requested `utag.view` on load and `utag.link` on CTA clicks only when Tealium's `window.utag` API is available. CTA routing selects the Apple App Store on iOS/iPadOS and Google Play otherwise.
