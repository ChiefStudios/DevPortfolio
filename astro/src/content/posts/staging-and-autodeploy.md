---
title: "Write Code, Push. That's the Whole Workflow Now"
slug: "staging-and-autodeploy"
excerpt: "Setting up a staging environment and deploying through the Coolify API turned five manual steps into one push."
coverImage: "../../assets/posts/autodeployCover.png"
publishedAt: "2026-10-12"
topic: "CI/CD"
tech: ["GitHub Actions", "Coolify", "GHCR", "Docker"]
relatedPosts: ["offloading-docker-builds", "false-positive-health-checks"]
relatedProjects: [10, 9]
---

# Write Code, Push. That's the Whole Workflow Now

Its literally all about workflows.

Something I've genuinely realised about DevOps is how much a change to your CI/CD changes the way you actually work on a project. For a while my process looked like this:

**write code → run tests → push → build new image → deploy new image**

Now it looks like this:

**write code → push**

Everything else happens on its own. It took a few hours to set up, and it's already saved me more than that in headaches, and it'll save even more as I add more sites.

## Two branches, two environments

Every site I run now has two branches that matter:

- `dev` deploys to **staging**, a password protected copy of the site on a subdomain.
- `main` deploys to **production**, the real site.

Staging is where I check things on my phone, and where clients look at changes before they go live. The code on both is the same. What changes is config, and all of that lives in environment variables on each Coolify app:

- The contact form on staging sends to me, on production it sends to the client. (I set this one up first. Accidentally emailing a client 30 test enquiries is not a good look.)
- Staging sends a `noindex` header so Google doesn't index a half finished copy of a client's site.
- Staging doesn't report to the production analytics, so my own testing doesn't inflate their numbers.

## Deploying by tag

The part that made this click was how the pipeline tells Coolify what to deploy.

My first version used Coolify resource IDs. Every app has a long UUID, and I copied it into the repo's secrets. It worked, but it meant every new site had me copying IDs between tabs, and one wrong paste meant deploying the wrong thing.

Now the workflow works out a **tag** from the repo name and branch:

```
my-site + dev   →  my-site-staging
my-site + main  →  my-site-production
```

In Coolify I give each app the matching tag once, and the workflow asks Coolify to deploy whatever has that tag. No IDs in the repo, and the same workflow file works for every site without edits.

The only secrets are the Coolify URL and a token that can **only** deploy. It can't read or change anything. If it ever leaked, the worst someone could do is redeploy my sites.

## What went wrong

**Using `curl -f`.** My first deploy step was a one liner with `curl -f`. When it failed, all I got was "the requested URL returned error: 400". No idea why. Now the step saves the response, prints the status code and the body (never the token), and fails on anything that isn't a 2xx. The body is nearly always the thing that tells you what went wrong.

**Running before anything exists.** The first push to a new repo used to fail because there was no Coolify app yet to deploy to. Now the deploy step checks the secrets exist first and skips itself if not, but still prints the tag it *would* use. So the first push just builds the image, and the log tells me what to type into Coolify.

**A typo in the tag.** If the tag in Coolify doesn't exactly match, the deploy call hits nothing and you sit there waiting for a deploy that was never started. Repo names like `DevPortfolio` have capitals in them, so the workflow lowercases everything, and I type tags in lowercase too.

**Build time vs runtime.** Anything with `NEXT_PUBLIC_` in a Next.js site is baked into the image when it's built. It's easy to set one in Coolify, redeploy and wonder why nothing changed. Those have to be passed in as build arguments in the workflow, everything else stays runtime.

## The payoff

None of this is complicated on its own. But together it means I can push a fix from my laptop, look at it on staging on my phone a minute later, and merge it to production when I'm happy, without logging in to anything.

That's the bit I didn't expect about DevOps. The setup is a few hours. The payoff is every single change after that.
