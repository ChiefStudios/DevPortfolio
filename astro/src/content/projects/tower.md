---
id: 11
title: "Tower"
size: "L"
tech: ["Coolify", "GitHub Actions", "Docker", "GHCR", "Next.js", "TypeScript", "SQLite", "Playwright"]
summary: "Deployment platform, proxy and authenticator. A layer between GitHub CI and Coolify that turns Coolify into a backend, with my own dashboard on top showing only what I need for my workflow."
image: "../../assets/posts/towerCover.png"
showMoreButton: true
year: "2026"
featured: 1
---

# Tower

**Deployment platform, proxy and authenticator.**

I built a proxy between GitHub CI and Coolify, the platform I self-host and run all my sites on. It basically turns Coolify into a backend, while I built a custom frontend that shows me only what I need to know for my workflow. So I don't spend time clicking through menus in Coolify that aren't relevant to me.

This is what actually turned Coolify into a true Vercel clone for me. I can now see deployments happen in GitHub CI, as if I had just built my own app (I did).

And adding a new repo is as easy as picking it in the bindings form, which fills in the site URL and branch for me, and pasting the workflow snippet Tower gives me. That's one `uses:` line in the repo's workflow, with no secrets to set up.

*An in-depth post on building Tower is coming soon.*

## How deploys work

- A GitHub Actions job proves which repo and branch it is with a short lived **OIDC** token. No repo holds a Coolify token any more.
- Tower looks up which Coolify app that repo and branch are bound to, starts the deploy and waits for it.
- The job fails unless the deploy actually succeeds, and every deploy shows up on GitHub as a Deployment.

All of my sites deploy this way now, and Coolify's API only accepts calls from Tower's server.

## The dashboard

- Every project with staging and production side by side, live container status and recent deploys.
- A queue of running deploys, and one click redeploy, restart, start and stop. Stopping production asks you to type the app name.
- `noindex` and basic auth for a staging site in one click, per app or in bulk.
- An audit log of every action.

## Under the hood

Next.js and TypeScript, with SQLite on a persistent volume for bindings, deploys and the audit log. A background reconciler follows running deploys. Every change runs type checks, over 100 unit tests against a fake Coolify, and a Playwright smoke test against the built server.
