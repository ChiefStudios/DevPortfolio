---
id: 10
title: "Websites I Run for Clients"
size: "L"
tech: ["Docker", "GitHub Actions", "GHCR", "Coolify", "Traefik", "Beszel", "Umami", "Playwright", "Next.js", "Sanity", "TypeScript"]
summary: "The websites I build and then keep running for clients through Chief Studios. Every site gets the same setup underneath: an image built in CI, staging and production, deploys through Tower, health checks and monitoring."
link: "https://chiefstudios.de"
image: "../../assets/projects/ZurLaterneHome.png"
showMoreButton: true
showClients: true
featured: 2
---

# Websites I Run for Clients

Through Chief Studios I build websites for small businesses, and then I keep running them. The sites look nothing alike, but the setup underneath is the same for every one.

## The shared setup

- **Built in CI:** GitHub Actions builds a Docker image and pushes it to GHCR, tagged with the commit so any earlier version can be redeployed.
- **Staging and production:** `dev` deploys to a password protected staging site, `main` to production. Staging sends `noindex` and never reports to the client's analytics.
- **Deploys through Tower:** no repo holds a Coolify token. CI asks Tower to deploy, and the job fails unless the deploy actually succeeds.
- **Smoke tests and health checks:** every pull request builds and starts the container and checks the important routes. A new version only takes traffic once its health check passes.
- **Monitoring and analytics:** server and container stats in Beszel, cookieless self-hosted Umami.
- **Secrets:** stored in Bitwarden and set up per site with my `keys` tool.

## Zur Laterne

A restaurant in Duisburg, in German and English. The owners edit the menu, opening hours and news themselves in a branded Sanity Studio. For the festive season there is an order page: orders go out by email from the restaurant's own mailbox, the review step is protected by Cloudflare Turnstile, and IP addresses and order fingerprints are deleted on a schedule.

Every push runs browser tests in WebKit and Chromium, after the video gallery turned into empty boxes on iPhones. [How I tracked that down](/blog/safari-videos-and-playwright).

## Ibeji Photography

A multilingual portfolio for a photographer, with a blog and gallery the client edits in Sanity. The contact form has reCAPTCHA, a honeypot and rate limiting. I started with requirements meetings and Figma wireframes and iterated on them with the client before writing any code.

![Ibeji wireframes](../../assets/projects/IbejiWireframes.png)
