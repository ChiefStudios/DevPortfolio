---
title: "A Traffic Light for My AI Coding Sessions"
slug: "traffic-light-for-ai-sessions"
excerpt: "I kept losing track of which coding assistant window needed me. So I built a tiny always-on-top widget with one light per session."
coverImage: "../../assets/posts/trafficLightCover.png"
publishedAt: "2026-12-09"
topic: "Tools"
tech: ["Rust", "Tauri", "JavaScript", "CSS"]
---

# A Traffic Light for My AI Coding Sessions

I often work on several projects at the same time, each with its own AI coding session running in a terminal. One is building a feature, one is waiting for me to approve a command, one finished ten minutes ago and is just sitting there.

And I keep getting lost in my open windows.

The worst one is the session that's been waiting on a yes/no question for twenty minutes while I'm staring at a different window wondering why nothing's happening. So I built something to fix it.

## The idea

A small widget that sits on top of everything in the corner of my screen, with one light per running session:

- **Green**: it's thinking or running something. Leave it alone.
- **Amber** (pulsing): it needs me. A permission prompt or a question.
- **Grey**: it's done, my move.
- **Red**: the turn failed.

That's basically it. A glance at the corner tells me where I'm needed.

## How it works

Claude Code, which is what I use, has **hooks**: you can tell it to send an HTTP request whenever something happens, like a prompt being submitted, a tool about to run, or a turn ending. The widget runs a tiny web server on `127.0.0.1:7890` and listens for those.

The core is in **Rust**: a state machine that takes those events and decides what colour each session should be, plus the little server. The window, tray icon and "start on login" are **Tauri**, and the widget itself is plain HTML, CSS and JavaScript. No framework.

Everything stays on the machine. The server only listens locally, and hook messages can contain prompts and file paths, so it only reads the handful of fields it needs (session id, event name, folder, tool name) and throws the rest away. Nothing is logged or saved.

## The bits that were harder than they looked

I thought this would take an afternoon. The state machine was the easy part. Getting the lights to be *right* was not.

**The permission notification is slow.** My first version turned amber on the "needs permission" notification. Turns out that only fires after the prompt has been sitting there for about six seconds. There's a separate event that fires the moment the prompt appears, so I switched to that.

**Nothing fires when you click "approve".** The event before a tool runs actually fires *before* the permission prompt. So after I approved something, there was no event to say "it's working again". The light now goes green when the approved tool finishes. A long running command therefore stays amber until it's done. Not perfect, but honest.

**Matching prompts to tools.** The permission event doesn't include the id of the tool it's about. So the widget matches it to the most recent open tool call of the same type. If I restart the widget halfway through a turn it can't match it, but it still goes amber, and the next event clears it.

**The idle reminder.** There's also a notification for "you haven't replied in a while". That was turning finished sessions amber again, which defeated the whole point. Now it looks at the notification type and ignores that one.

**One event can't use HTTP.** The "session started" hook only supports running a command, not an HTTP request. So that one uses `curl.exe`, which ships with Windows anyway.

## Then I couldn't stop

Once it worked I got carried away with designs. There are six now, from a plain dark pill to a "liquid glass" one where a droplet slides between the colours, to a terminal style one that just says RUN / WAIT / IDLE / ERR.

It picked up a few features too:

- **A waiting timer.** An amber row shows how long it has been waiting on me, which is the number I actually care about.
- **Click to jump.** Clicking a light brings that session's window to the front. When an event arrives, the widget looks up which process owns the other end of the local connection, remembers its parent processes, and raises the nearest one that has a visible window. If it can't find one, the row shakes.
- **Plan limits.** A thin strip along the edge of the panel shows how much of my 5-hour and weekly limits I've used. It goes amber from 70% and red from 90%.

It sounds like a tiny thing, but the time I was losing to a session quietly waiting on me was a lot more than I'd have guessed. Now I just look at the corner of the screen.
