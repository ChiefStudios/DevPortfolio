---
id: 12
title: "keys: Secrets for Client Sites"
size: "M"
tech: ["Bitwarden", "GitHub Actions", "Coolify", "JavaScript"]
summary: "A command line tool for client secrets. Values live in Bitwarden, each repo's secrets.json says what it needs and where, and one command copies a ready-to-paste block for Coolify or syncs GitHub secrets."
image: "../../assets/posts/keysCover.png"
showMoreButton: true
year: "2026"
featured: 4
---

# keys

Five sites, staging and production for each, some values needed at build time and some at runtime, spread over GitHub and Coolify. `keys` keeps track of all of it.

- **Bitwarden** holds the values, one folder per client.
- **`secrets.json`** in each repo lists the key names and where each one goes. No values, so it is safe to commit.
- **`keys check`** compares what the code reads, what `secrets.json` says, what the workflows expect and what is in Bitwarden.
- **`keys copy`** builds the complete `KEY=value` block for a Coolify project or app and puts it on the clipboard, which clears after 30 seconds.
- **`keys sync`** writes GitHub secrets and variables, with a dry run first.

![The keys menu](../../assets/posts/keysMenu.png)

## Rules it follows

- It never prints a secret value, anywhere.
- It refuses to copy a block while a public value is still a placeholder like `TODO`.
- It never deletes anything on GitHub.
- The tests use a fake `bw`, so they never touch a real vault.

[Why I built it](/blog/managing-secrets-with-keys)
