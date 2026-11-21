---
title: "Building Tower: One Door in Front of Coolify"
slug: "building-tower"
excerpt: "I built a small control layer over Coolify so none of my repos hold a Coolify token any more. Here is how it works and everything that went wrong along the way."
coverImage: "../../assets/posts/towerCover.png"
publishedAt: "2026-12-02"
topic: "Self-hosting"
tech: ["Coolify", "GitHub Actions", "Next.js", "TypeScript", "SQLite", "Docker", "Playwright"]
relatedPosts: ["a-year-of-my-cicd-pipeline", "staging-and-autodeploy", "managing-secrets-with-keys"]
relatedProjects: [9]
---

# Building Tower: One Door in Front of Coolify

At the end of my [CI/CD post](/blog/a-year-of-my-cicd-pipeline) I mentioned the thing that bugged me most: every repo had its own copy of a Coolify token in its GitHub secrets. Eight repos, eight copies of the same key, any one of which could deploy anything.

So I built **tower**, a small app that sits in front of Coolify. Coolify still does all the real work (building, running containers, the proxy). Tower just decides who's allowed to ask it for things.

## How it works

Instead of a stored token, a GitHub Actions job proves who it is using **OIDC**. GitHub gives the job a short lived signed token that says "I'm a workflow in repo X on branch Y". Tower checks the signature, looks up which Coolify app that repo and branch are bound to, and tells Coolify to deploy it.

So a deploy step in any of my repos is now just:

```yaml
- name: Deploy via tower
  uses: ChiefStudios/tower-action@v1
  with:
    url: https://tower.chiefstudios.de
```

No secrets. Tower waits for the deploy, and the job fails unless it actually succeeds. Before this, CI would go green as soon as Coolify had *accepted* the request, even if the deploy failed a minute later.

On top of that it has a dashboard: every project with its staging and production side by side, live container status, a queue of running deploys, one click redeploys, and an audit log of every action. It can also switch on `noindex` and basic auth for a staging site in one click.

All seven of my sites deploy through it now, and the shared Coolify token is deleted.

## The struggles

This is the part I actually wanted to write about, because a lot of it didn't go to plan.

**Coolify's API doesn't tell you an app's tags.** My whole deploy setup was built on tags, and I wanted tower to import my existing setup from them. But no API response includes an app's tags. In the end tower asks Coolify for "apps with tag X" for each tag, and builds the map backwards from that.

**Undocumented statuses.** I took the deploy status names from Coolify's docs, and some of them I'd never actually seen on a real run. So any status tower doesn't recognise turns into an error after 2 minutes, instead of a deploy that spins forever.

**The chicken and egg with IP allowlists.** Coolify can restrict its API to certain IP addresses, which is exactly what I wanted: only tower's server. But GitHub runners have changing IPs, and while any repo still deployed the old way, turning it on would have broken every pipeline at once. So the order had to be: set up tower, move every repo over one by one, delete the shared token, *then* lock the API down.

**Token permissions creep.** I started with a Coolify token that could only read and deploy. Then I wanted start, stop and restart. Then noindex and basic auth, which edit app settings. Each feature needed a bit more access, and each time I had to make a deliberate decision rather than just ticking more boxes. The IP allowlist is what makes that acceptable.

**Private actions don't cross orgs.** My repos are split across two GitHub accounts, and an action in a private repo can't be used from another org. So the deploy action lives in its own small public repo. There's nothing secret in it anyway.

**GitHub's OIDC endpoint sometimes just fails.** Rarely, but enough to turn a random deploy red. The action now retries it.

**The database that kept disappearing.** Tower stores everything in SQLite. Without a persistent volume, every redeploy of tower wiped its own history. Now it shows on the dashboard whether its data folder is a real volume, and warns at startup if not.

**Tower deploying itself.** Tower deploys through tower. Which is great until tower is broken and can't deploy the fix. The fallback is clicking Redeploy in Coolify by hand, which pulls the latest image. Not elegant, but it means I can never lock myself out.

## Building it

I planned it in stages, each one written up as small cards with a clear "done" check, and built one card at a time. Every stage had to pass type checks, 100+ unit tests against a fake Coolify, and a Playwright smoke test before it went anywhere. Nothing in the tests touches the network, which made it fast to work on and meant I could test failure cases the real Coolify would never give me on demand.

One small lesson from that: I once piped the test output through `tail` to keep it short, and it hid a failing exit code. The checks looked green and weren't. Now I always read the real exit code.

## What's next

Short lived tokens for my `keys` tool, approvals for the few risky actions, and a servers panel. And at some point a canvas view, with the servers, apps and repos as a node graph and a glowing line along whatever is deploying right now. That one's mostly because it would look cool.
