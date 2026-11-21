---
title: "My Health Check Passed. It Shouldn't Have."
slug: "false-positive-health-checks"
excerpt: "A container that reported healthy while the check itself couldn't even run, and what a health check actually needs to prove."
coverImage: "../../assets/posts/healthcheckCover.png"
publishedAt: "2026-10-06"
topic: "DevOps"
tech: ["Docker", "Coolify", "GitHub Actions"]
relatedPosts: ["how-this-site-is-built"]
relatedProjects: [9]
---

# My Health Check Passed. It Shouldn't Have.

I set up a health check for this site and it passed straight away. Green tick, container healthy, job done.

Or so I thought.

Health checks are still fairly new to me, so there was a fair bit of trial and error getting them set up. But when I went back through the logs after that first pass I noticed something odd. Sitting right next to the healthy status was this:

```
/bin/sh: curl: not found
```

The check never ran. It passed anyway.

## Why this happened

I had copied a pretty standard looking health check from an example:

```dockerfile
HEALTHCHECK CMD curl -f http://localhost:4321/api/health || exit 1
```

Nothing wrong with that line on its own. The problem is my runtime image. I use `node:alpine` to keep the final image small, and the Alpine image doesn't ship with `curl`. So the command that was supposed to test my site was failing before it ever made a request, and between Docker and Coolify that ended up being reported as healthy instead of loudly failing.

That's the part that got me. A check that fails is useful. A check that **can't run** and still says everything is fine is worse than having no check at all, because now you trust it.

## The fix

I didn't want to install curl just for this (it's more stuff in the image that I don't otherwise need). The image already has Node, so the check uses Node instead:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 4321) + '/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
```

It's not pretty but it does three things the old one didn't:

- It uses something that definitely exists in the image.
- Anything but a 200 is a failure.
- If it can't connect at all, that counts as a failure too (the `.on('error')` part).

The `/api/health` route itself is tiny. It returns `{"status":"ok"}` with a 200 and no caching. It doesn't check a database or anything fancy, it just proves the server is up and routing requests.

## Two more ways it can lie to you

Once I knew to look, I found a couple more ways a health check can quietly lie:

**Two checks disagreeing.** Coolify can run its own health check on top of the Docker `HEALTHCHECK`. When both exist you can end up with two different answers about the same container. I turned Coolify's one off so Docker's status is the single source of truth.

**The wrong port.** Coolify passes the port you set in its UI to the container as `PORT`. If that number doesn't match what the app actually listens on, the check is knocking on an empty door. That's why the check above reads `process.env.PORT` instead of hardcoding it.

## What I took from it

Test the test. After this I started deliberately breaking things to see if the check notices: stopping the server inside the container, pointing it at a route that 500s. If the status doesnt go red, the check isn't doing its job.

I also use the same health route in my CI now, so a pull request has to start the container and get a 200 back before it can be merged. Same check, two places, one definition of "healthy".
