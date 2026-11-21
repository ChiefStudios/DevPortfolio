---
id: 11
title: "Tower"
size: "L"
tech: ["Coolify", "GitHub Actions", "Docker", "GHCR", "Next.js", "TypeScript", "SQLite", "Playwright"]
summary: "A small control layer in front of Coolify. My repos deploy through it with GitHub OIDC instead of a stored token, every deploy is tracked and audited, and one dashboard shows staging and production for every site."
image: "../../assets/posts/towerCover.png"
showMoreButton: true
year: "2026"
featured: 1
---

# Tower

Coolify does the real work on my servers: building, running containers, the proxy. Tower sits in front of it and decides who is allowed to ask it for things.

## How deploys work

- A GitHub Actions job proves which repo and branch it is with a short lived **OIDC** token. There is no Coolify secret in any repo.
- Tower looks up which Coolify app that repo and branch are bound to, starts the deploy and waits for it.
- The job fails unless the deploy actually succeeds, and the deploy shows up on GitHub as a Deployment.

All of my sites deploy this way now, and the old shared Coolify token is deleted. Coolify's API only accepts calls from Tower's server.

## The dashboard

- Every project with staging and production side by side, live container status and recent deploys.
- A queue of running deploys, and one click redeploy, restart, start and stop. Stopping production asks you to type the app name.
- `noindex` and basic auth for a staging site in one click, per app or in bulk.
- An audit log of every action.

## Under the hood

Next.js and TypeScript, with SQLite on a persistent volume for bindings, deploys and the audit log. A background reconciler follows running deploys. Every change runs type checks, over 100 unit tests against a fake Coolify, and a Playwright smoke test against the built server. No test touches the network.
