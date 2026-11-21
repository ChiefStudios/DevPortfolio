---
id: 13
title: "Traffic Light"
size: "M"
tech: ["Rust", "Tauri", "JavaScript", "CSS"]
summary: "A small always-on-top Windows widget with one light per AI coding session, so I can see at a glance which one is working, which needs me and which is done."
image: "../../assets/posts/trafficLightCover.png"
showMoreButton: true
year: "2026"
---

# Traffic Light

When several coding sessions run at once, it is easy to miss the one that has been waiting on you for twenty minutes. This widget sits in the corner of the screen with one light per session.

| Light | Meaning |
| --- | --- |
| Green | Working |
| Amber | Needs me: a permission prompt or a question |
| Grey | Done, my move |
| Red | The turn failed |

## How it works

The sessions send hook events to a small server on `127.0.0.1` inside the widget. A state machine in Rust turns those events into a colour per session, Tauri handles the window and tray, and the widget itself is plain HTML, CSS and JavaScript.

Everything stays on the machine. Hook messages can contain prompts and file paths, so only a handful of fields are read and the rest is thrown away. Nothing is logged or saved.

It also has a waiting timer, click to jump to a session's window, a strip showing plan limits, and six designs.
