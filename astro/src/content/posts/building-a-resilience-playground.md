---
title: "Breaking Kubernetes on Purpose: Building a Resilience Playground"
slug: "building-a-resilience-playground"
excerpt: "I wanted to actually understand Kubernetes, Terraform and Ansible, not just list them. So I built a lab where you press a button, something breaks, and you watch it heal."
coverImage: "../../assets/posts/resilienceCover.png"
publishedAt: "2026-11-26"
topic: "DevOps"
tech: ["Kubernetes", "Argo Rollouts", "Prometheus", "Terraform", "Ansible", "Docker", "GitHub Actions", "TypeScript"]
relatedPosts: ["moving-from-prometheus-to-beszel"]
---

# Breaking Kubernetes on Purpose: Building a Resilience Playground

Kubernetes, Terraform and Ansible were all in my toolbox on paper. I'd done the tutorials. But if you'd asked me *why* a pod gets taken out of a load balancer, or what actually happens during a canary release, I'd have given you a pretty vague answer.

So I built something where I'd have to understand it.

## The idea

A web page with four buttons. Each one breaks something real in a Kubernetes cluster, and then you watch Kubernetes fix it.

The point isn't the breaking, it's the recovery. Every fault maps to one specific thing that heals it, and the page shows which one did it and how long it took.

| Fault | What heals it | Roughly |
| --- | --- | --- |
| Crash a pod | The kubelet restarts the container, the other two pods keep serving | 6s |
| Fail readiness | The pod is pulled out of the Service until its probe passes again | 46s |
| Bad deploy | The canary never gets ready, so Argo Rollouts aborts the release | 37s |
| Flaky deploy | Prometheus sees the canary's error rate climb and Argo Rollouts aborts it | 34s |

A load generator sends 10 requests a second the whole time, so you can see what each fault actually costs. Failing readiness and the bad deploy cost zero failed requests. A crash costs a handful, the ones sent to the pod before Kubernetes notices it's gone. A flaky deploy costs around 50, because the canary serves real traffic until the numbers catch it.

That table taught me more about Kubernetes than any course did.

## What I learnt about Kubernetes

**Liveness and readiness are very different things.** Before this I sort of treated them as the same. A failed liveness probe means "restart me". A failed readiness probe means "I'm alive, just don't send me traffic". Watching a pod stay running but get pulled out of the Service made that click.

**Restarts back off.** If you crash the same pod over and over it comes back slower each time: 10s, 20s, 40s. I thought my lab was broken until I read about it. It resets after the pod has run cleanly for ten minutes.

**A health check can't catch everything.** The bad deploy is caught by readiness. The flaky one isn't: it starts fine, passes every probe, and then fails half its requests. That's what canary analysis is for. Argo Rollouts sends a third of traffic to one new pod, asks Prometheus every 5 seconds for its error rate, and aborts if it's above 5% twice.

## Letting strangers break things

Since the whole point is that anyone can press the buttons, I spent a lot of time on what they *can't* do:

- The API accepts four named actions and nothing else. No input to mess with.
- The controller that breaks things only has permissions inside one namespace, and can only change one specific deployment.
- Network policies block everything by default. The load generator can only reach the target app, the admin port only accepts the controller.
- Faults are refused if they'd leave fewer than two pods serving.
- Each fault has a cooldown, and there are per-IP rate limits.

## Terraform and Ansible

The local version runs on k3d on my laptop. For a real server I wrote it out properly:

- **Terraform** creates a Hetzner server, a firewall and the Cloudflare DNS records.
- **Ansible** hardens the server, installs k3s, and deploys the app.
- **GitHub Actions** builds the images into GHCR.

It's all built, but not live yet, since that needs a Hetzner account I haven't set up. Running it is the next step.

## Things that bit me

**`ImagePullBackOff` on my own laptop.** The images only exist locally, so they have to be copied into the k3d cluster. Forget that step and every pod just sits there trying to download an image that doesn't exist anywhere.

**Locking myself out (nearly).** One of the Ansible steps disables root SSH login. Do that before the admin user has working keys and you've just locked yourself out of your own server. The playbook now refuses to disable root login unless the admin user already has keys.

**PowerShell and UTF-16.** This one took me way too long. In Windows PowerShell 5.1, a plain `>` writes files as UTF-16. kubectl can't read a UTF-16 kubeconfig, and the error doesn't tell you that. The fix is `Out-File -Encoding ascii`. I'd never have guessed.

**Cleaning up after a broken release.** If the controller restarted in the middle of a bad deploy, the broken image stayed set. Now the controller puts the image back on startup, so the lab is never left broken.

## What's next

Going live on a real Hetzner server comes first. After that I want to hand deploys over to Argo CD, and add a fifth fault: losing a dependency, with a circuit breaker to deal with it.

The bit I'm happiest with is that I can now explain why a specific pod did a specific thing at a specific second, and I've got numbers to back it up.
