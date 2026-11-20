---
title: "How I Got Over My Fear of Databases"
slug: "getting-over-my-fear-of-databases"
excerpt: "I avoided storing anything for years because I was scared of losing it. What fixed it wasn't more backups, it was testing them."
coverImage: "../../assets/posts/databasesCover.png"
publishedAt: "2026-11-19"
topic: "DevOps"
tech: ["SQLite", "Docker", "Coolify"]
relatedPosts: ["building-a-resilience-playground"]
---

# How I Got Over My Fear of Databases

I always avoided databases.

Not because I couldn't write a query. I hated the thought of being responsible for storing something, and the risk of losing all of it and not being able to get it back. A static site can't lose your data because it doesn't have any. That felt safe.

Have you ever had something fail and thought, "oh it's okay, I'll just roll back" or "I'll restore the backup"? And then the backup fails too?

That's the bit that scared me. Not the first failure. The second one, when the thing that was meant to save you turns out to be broken as well.

## Starting small

What finally got me out of my comfort zone was starting with data that didn't matter.

When I built my [resilience playground](/blog/building-a-resilience-playground), the controller keeps a history of the last 20 incidents in SQLite on a small volume. If that file disappeared tomorrow, nobody would care. Perfect place to learn.

And I learned something straight away. My first version would crash the controller if a write to the history failed. A history of incidents was taking down the thing that *handles* incidents. Now a failed write gets logged and the controller keeps running. The data is the less important thing.

## The mistake everyone makes once

Then I built a tool that actually matters: a deploy dashboard that keeps an audit log of every deploy across my sites, in SQLite.

Containers are meant to be thrown away. Every redeploy creates a fresh one. So if the database file lives *inside* the container, every deploy quietly wipes it. Everything looks fine, until you check the audit log and it starts at the last deploy.

It needs a **persistent volume**, a folder on the server that survives the container being replaced. Easy to set up, and very easy to forget. So I made the app check for it: it shows on the dashboard whether `/data` is a real volume, and it warns at startup if it isn't. I'd rather be told loudly than find out later.

## What actually fixed the fear

I realised my fear was completely fixable, and the fix wasn't "do more backups".

Backing up regularly without testing tells you nothing. A backup job that runs every night and reports success just means a file got written. It doesn't mean the file is complete, or not corrupted, or that you know how to restore it under pressure.

A restore test does tell you. So my rule now is: **a backup doesn't count until I've restored it.** Restore it somewhere that isn't production, open it, and check the data I expect is actually in there. Then do that again on a schedule, not just once.

That gives me something backups alone never did: reassurance. If something does go wrong, I'm not hoping the backup works. I already know it does, because I watched it work last week.

## Where I am now

I'm not suddenly a database expert. But the thing I was actually afraid of was being in a situation I couldn't get out of, and that turned out to be a solvable problem:

- Start with data that doesn't matter.
- Make sure it lives somewhere that survives a redeploy.
- Don't let a failed write take the whole app down.
- Test restores, not just backups.

Funny how the scary thing gets a lot less scary once you've actually broken it a few times on purpose.
