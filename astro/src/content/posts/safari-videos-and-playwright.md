---
title: "The Videos Worked Everywhere Except on My Client's iPhone"
slug: "safari-videos-and-playwright"
excerpt: "Video tiles that disappeared on Apple devices, a rabbit hole of Safari quirks, and how I ended up running WebKit tests in CI from a Windows laptop."
coverImage: "../../assets/posts/webkitCover.png"
publishedAt: "2026-11-24"
topic: "CI/CD"
tech: ["Playwright", "GitHub Actions", "Next.js", "TypeScript"]
relatedPosts: ["staging-and-autodeploy"]
---

# The Videos Worked Everywhere Except on My Client's iPhone

I built a website for a restaurant client. The homepage has a gallery of food photos in scrolling columns, and they wanted some of it to move, so I swapped a few of the photos for short looping videos.

Everything looked perfect locally. Everything looked perfect on staging. Then my client showed me the site on their iPhone and their Mac.

The video parts I'd built had completely disappeared.

On the phone, the whole gallery collapsed down to nothing. On the Mac, the video tiles were just flat brown boxes (the placeholder colour behind each tile). The photos were fine. Only the videos were broken, and only on Apple devices.

## The problem with not owning a Mac

I'm on Windows. Safari doesn't run on Windows, and Apple doesn't let its software run on non Apple hardware. I genuinely never knew that until this. Chrome's dev tools have an "iPhone" mode, but that's still Chrome underneath, so it showed me a perfectly working site.

So the first job was just getting the bug to show up somewhere I could actually poke at it.

## Playwright and WebKit

[Playwright](https://playwright.dev) can run tests in WebKit, which is the engine Safari is built on. It isn't Safari, but it's the closest thing to a Safari environment I could get running on a Windows machine. And it reproduced the bug, which was a massive relief.

I set the tests up to run in three browsers:

- WebKit on a desktop size
- WebKit with iPhone 14 settings
- Chromium, as a control. If something only fails in WebKit, it's a Safari problem and not my code in general.

Then I wrote tests for the exact symptoms:

- **Does the gallery actually have a size?** On the phone layout, the rows have to be taller than 150px. When it was broken, they were basically 0.
- **Is the tile showing a picture?** Playwright takes a screenshot of the visible part of a video tile and I check how much the pixel colours vary. A real image varies a lot. An empty brown box is one flat colour. Bit of a hack, but it works.
- **Is a video actually playing?** Not just "is there a `<video>` element", but is it unpaused, has the time moved forward, and does it have a frame ready.

## What was actually wrong

Two things, as far as I can tell.

The phone layout used a sizing setup that Safari calculated differently, so the rows collapsed to zero height. That one was fixable once I could see it.

The second one was stranger. Safari hides a video's `poster` image as soon as it *thinks* the video has a frame. But a paused or off screen video inside an animated, clipped column sometimes paints nothing. So you get no poster and no video. Just the brown box.

The fix was to stop relying on the `poster` attribute. Each tile now has a normal `<img>` sitting underneath the video, and the video itself has no background. If the video paints, it covers the image. If it doesn't, you still see the photo. I added a test for this too: block every `.mp4` request and check the tiles still show a picture.

## Getting it into CI

This is where the more niche mistakes came in.

**WebKit on Linux needs system libraries.** My first CI run failed before a single test ran because the WebKit build Playwright downloads needed libraries that the newest `ubuntu-latest` image didn't have. Pinning the job to Ubuntu 24.04 fixed it.

**Some Linux WebKit builds can't play H.264 at all.** So the "is it playing" test checks whether the browser can decode the format first, and skips itself if not, instead of reporting a site bug that isnt one.

**`networkidle` never happens.** I used to wait for the network to go quiet before checking for errors. With looping videos, it never goes quiet. The test just hung. Now it waits for the page load and then a few seconds.

**Too many workers.** Each Playwright worker is a full browser running next to the app server. On a small CI machine more than two starved everything into timeouts.

## Testing on a real device

WebKit got me most of the way, but it's still not the real thing. In the end I used the free trial of one of the paid services that let you remotely test your site on real Apple devices, and confirmed it on an actual iPhone and Mac.

Actually crazy that there's a whole market just for this, because you can't legally run Safari on anything but Apple hardware.

## What I'd do differently

Test in WebKit from day one on anything with video or fancy layout. It's free, and it would have caught this before my client did.
