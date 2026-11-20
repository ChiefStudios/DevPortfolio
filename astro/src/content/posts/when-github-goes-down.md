---
title: "I Was Debugging My Pipeline. The Pipeline Was Fine."
slug: "when-github-goes-down"
excerpt: "My CI runs started failing and taking ages, and I spent way too long blaming my own workflows before checking GitHub's status page."
coverImage: "../../assets/posts/githubOutageCover.png"
publishedAt: "2026-11-13"
topic: "CI/CD"
tech: ["GitHub Actions", "GHCR", "Coolify"]
relatedPosts: ["staging-and-autodeploy"]
---

# I Was Debugging My Pipeline. The Pipeline Was Fine.

I was in the middle of working on my CI/CD when my runs started failing and taking ages. Jobs sat queued for minutes, then failed on steps that had worked a hundred times before.

I was genuinely confused about what I'd done wrong. I went back through my last few changes, reverted one, re-ran things, read logs that didn't make sense. Until I realised the problem wasn't the workflows I'd set up.

It was GitHub itself.

## First time it's actually hit me

I've never really been affected by a GitHub outage until now. You see them in the news sometimes, but they always seemed to happen to someone else.

Honestly, until now GitHub seemed like the holy grail of development. So much depends on it. But this made me realise how much of *my* setup depends on it:

- My **code** is on GitHub.
- My **builds** run on GitHub Actions.
- My **images** are stored in GitHub's container registry (GHCR).
- My **deploys** are triggered from a GitHub Actions job.

So when GitHub struggles, everything does. I couldn't build, couldn't push an image, and couldn't deploy. All at once, from one provider.

## What still worked

The good news: my sites stayed up. Nothing about serving a website depends on GitHub once the image is on the server. Coolify keeps running the containers it already has.

And if I really needed to, Coolify can redeploy from the last image it pulled by hand. So an outage stops me *shipping*, not my clients' sites running. That's a pretty important difference, and its kind of reassuring that the setup fails the right way.

## What I'll do next time

Check the status page before I start tearing apart my own workflows. It's a 10 second check that would have saved me a good chunk of an evening.

Longer term I'm thinking about whether some of this should have a fallback:

- Keeping a copy of images somewhere other than GHCR, so a deploy doesn't need GitHub at all.
- Being able to build an image locally and push it by hand if Actions is down for a long time.

For now I think it's fine. It's not like I deploy client sites every hour, and waiting out an outage is cheaper than maintaining a second pipeline. But it's the first time the foundation has felt a bit shaky.

Is it time to switch? Probably not yet. Anyone else been hit by this, and do you have a fallback? I'd genuinely like to know what other people do.
