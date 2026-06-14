---
title: "GitOps at Home"
date: "2026-06-14"
author: "Tyler Witlin"
categories: ["GitOps", "Kubernetes", "Homelab"]
tags: ["flux", "renovate", "sops", "age", "talos", "gitops", "home-ops", "pulumi"]
summary:
  "From a Supermicro NAS that saved a 2012 iMac's job to Unraid, ESXi, a six-node k3s cluster, and eventually Talos and GitOps — how my homelab got simpler as the stakes got higher."
---

# GitOps at Home: How My Homelab Got Simpler Over Time

At work I help run platforms for tens of thousands of engineers. At home I run a platform for an audience that is smaller and considerably less patient: my wife.

Homelab on-call is always on. There is no rotation. There is no secondary. If [Jellyfin](https://jellyfin.org/) buffers, [Plex](https://www.plex.tv/) refuses to load, or the TV app shows a spinning wheel long enough to kill the vibe, I am the incident commander, the subject matter expert, and the person getting asked from the other room whether I am "doing something on the server again."

Enterprise incidents get severity levels and postmortems. Home incidents get a look. Sometimes a sigh. Often, the question: "did you update something?"

I usually did.

A [Renovate](https://docs.renovatebot.com/) PR bumped a [Helm](https://helm.sh/) chart patch on a Friday evening. [Flux](https://fluxcd.io/) picked it up overnight. By Saturday morning I was rolling back a broken `HelmRelease` because the chart had dropped a values field one of my overlays still depended on. CI passed. The YAML was valid. Jellyfin was still down, and I had already used my one allowed weekend troubleshooting slot before coffee.

GitOps at home, in miniature: automated updates, automated deploys, and then me in a bathrobe undoing last night's good intentions while someone asks if the server is fixed yet.

This post is not really about that one chart, though. It is about how my homelab changed over time because I got tired of being the single point of failure for movie night — and how that journey started long before [Kubernetes](https://kubernetes.io/), with a 2012 iMac and a family photo library.

The current [`home-ops`](https://github.com/coolguy1771/home-ops) setup is where I landed after years of buying louder hardware and learning the same lesson repeatedly: if I am the only one who knows how it works, I am on call forever.

## It started with a 2012 iMac

The homelab did not begin with Kubernetes. It did not begin with GitOps. It began because my parents wanted to replace an old 2012 iMac with a new one.

That iMac was where the family photos lived.

I countered with a different proposal: skip the new Mac, buy a NAS, and keep the photos on something purpose-built. Cheaper, more storage, and — in hindsight — the moment I accidentally signed up for a career in infrastructure.

My first server was an old Supermicro chassis. Loud. Power-hungry. The kind of box that makes you question whether "homelab" is just a polite word for "space heater with Ethernet." It had a couple of 6 TB drives, DDR3 memory, and Xeon E5-2650 v2s. Not glamorous. Very effective at teaching me that enterprise surplus is a gateway drug.

I installed [Unraid](https://unraid.net/) because that was the cool thing to do at the time, and Unraid is where I first started experimenting with containers. One box, one array, photos safe, and suddenly I was the family IT department. The job came with no pay, no PTO, constant outages and unlimited scope creep.

It was also at this time that I convinced my parents that we should upgrade to an enterprise router so that we could take "advantage" of our gigabit connection.

I should say something about my parents here, because none of this happens without them. They said yes to the NAS when a new iMac would have been simpler. They let the Supermicro sit in the house and spin. They tolerated the enterprise router I absolutely did not need but definitely convinced them we did. What they were really tolerating was a teenager learning infrastructure on their dime, on their equipment, on their patience. I did not have a track record. They just let me learn. That is not a given, and it mattered more than I understood at the time.

## r/homelab and the hardware spiral

Then I found [r/homelab](https://reddit.com/r/homelab) and [r/homelabsales](https://reddit.com/r/homelabsales).

I looked at my one loud Supermicro and concluded I had no idea what I was doing. The rational response, obviously, was to buy more hardware so I could catch up.

I saved up money from my job at the time and bought some "new" servers — new to me, previously loved by a datacenter somewhere. Enterprise-grade, heavy, and deeply satisfying to unbox if you have ever felt emotionally attached to a rail kit.

I played around with [ESXi](https://www.vmware.com/products/cloud-infrastructure/esxi-and-esx). VMs everywhere. The lab looked serious. I felt slightly more qualified to have opinions on Reddit.

What I did not yet have was redundancy. Or backups I trusted. Or any plan for what happened when the one Docker host running everything in my house died.

That realization came about six months later.

## Kubernetes circa 2019: six nodes and no idea

Around 2019, the Docker host problem became obvious. One machine ran basically everything. If it went down, the house went down. Photos, media, whatever else I had containerized by then — all of it lived and died on a single point of failure.

So I did what seemed reasonable at the time: I got into Kubernetes.

I stood up a six-ish node cluster on ESXi running [Ubuntu](https://ubuntu.com/) and [k3s](https://k3s.io/). I had no idea what I was doing. I learned quickly.

I learned why you take backups a lot. I learned that "it worked when I set it up" is not a lifecycle strategy. I learned that nobody wants to manually rebuild a cluster more than once, which is how I got serious about automating installs.

[Ansible](https://www.ansible.com/) entered the picture here. It helped. I could rebuild nodes without relying entirely on memory. I could turn a messy checklist into a playbook. That was a real improvement over snowflake hosts I had SSH'd into once and never documented.

But over time, Ansible also became another system to maintain. Roles drifted. Variables accumulated. Some tasks were idempotent, some were only mostly idempotent, and some were shell commands with better branding. I would fix a one-off on a host and then decide whether it belonged in Ansible, in documentation, or nowhere because I was tired.

Automation is not automatically simplicity. Sometimes it just makes the complicated thing reproducible.

## The storage problem

The storage evolution took longer to sort out than it should have.

I started with [local-path provisioner](https://github.com/rancher/local-path-provisioner), which worked until it did not — no redundancy, no replication, node goes away and the data goes with it. So I moved to [Longhorn](https://longhorn.io/), which gave me distributed block storage with replication across nodes. That worked better. Then I moved to [Rook-Ceph](https://rook.io/), because at some point I apparently decided I wanted enterprise-grade distributed storage in my house.

What none of that solved was that everything was still running through a single SSD underneath ESXi. The cluster had grown. I was running databases. [etcd](https://etcd.io/) had company. By around 2022, the disk was saturating badly enough that etcd was throwing fits and anything running a real database was noticeably slow.

The fix was not more storage abstractions. It was better hardware underneath them.

I moved to surplus and used micro PCs — small, quiet, dense, and cheap enough that I could buy several without feeling bad about it. Bare metal instead of ESXi. Dropping the hypervisor removed a layer I had not fully realized I was paying for. Dedicating real NVMe to each node made the etcd problems disappear. That is the cluster I run today.

## Fedora: RHEL at work, fewer pets at home

Around that same time I also moved off the original Supermicro chassis. I gave it to someone I knew who was trying to break into tech from the Air National Guard — needed hardware to learn on, did not have the budget for it. The chassis went with them. Storage moved to a [ZFS](https://openzfs.org/)-based disk array, which was quieter and more intentional than Unraid had ever been. The lab got physically smaller as it got operationally more serious.

The professional shift happened in parallel. My job at the time was on [RHEL](https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux) systems, so moving homelab nodes from Ubuntu to [Fedora](https://fedoraproject.org/) felt natural. I was already living in that ecosystem at work. Might as well reduce the mental context-switching at home.

Fedora IoT came later, once I stopped running services directly on the NAS. Some of those services genuinely did not belong in Kubernetes — they just needed a container, a volume, a unit file, and a host that reboots cleanly. But some of them could not run in the cluster even if I wanted them to. A PXE server that bootstraps the Kubernetes nodes cannot itself run on those nodes. Those services need somewhere stable and external to live. That became my [`home-service`](https://github.com/coolguy1771/home-service) repo: [Fedora IoT](https://fedoraproject.org/iot/) hosts running [Podman](https://podman.io/) containers managed by systemd.

What Fedora IoT gave me was an excuse to make the hosts boring. I still had Linux boxes, but I was trying to make them less special. The goal shifted from "this server has a bunch of carefully configured stuff on it" to "this host runs a small set of services in a way I can understand later."

That was also when I started questioning whether everything actually needed to be in Kubernetes.

Kubernetes is great when I want declarative APIs, reconciliation, scheduling, service discovery, secrets integration, and a consistent deployment model. But it is not automatically the right answer for every home service. Running something outside the cluster is not a failure. Sometimes it is the lower-maintenance option.

## GitOps: making the cluster understandable

Once workloads lived in Kubernetes, the next problem was keeping the cluster honest.

Applying manifests manually does not scale well, even at home. It is too easy for the live cluster to become the source of truth. Once that happens, the repo becomes more of a suggestion than a record. I had already learned the hard way on the k3s cluster that rebuilding from memory is not fun.

Flux gave me a simple rule: Git is the desired state, and the cluster reconciles toward it. If I want to change an app, I change the repo. If something changes in the cluster by accident, Flux either corrects it or makes the drift obvious.

My [`home-ops`](https://github.com/coolguy1771/home-ops) repo grew around that idea. It started from the [`onedr0p/home-ops`](https://github.com/onedr0p/home-ops) pattern and the broader [Home Operations](https://discord.gg/home-operations) community. I did not invent the layout. I copied what made sense, broke plenty of it, and kept the parts that survived.

Today, the repo is roughly split like this:

| Area | Current direction | Why it exists |
| --- | --- | --- |
| Kubernetes state | Flux-managed manifests | The cluster should match Git |
| Secrets | [SOPS](https://github.com/getsops/sops) + [age](https://age-encryption.org/), plus External Secrets | Secrets need to be reviewable without being plaintext |
| Updates | Renovate | Dependency drift should become PRs, not chores |
| Node OS | [Talos](https://www.talos.dev/) | Kubernetes nodes should be appliances, not pets |
| Cloud-adjacent resources | [Pulumi](https://www.pulumi.com/) | Infrastructure code should be easier for me to model and refactor |
| Non-cluster services | Fedora IoT + Podman + systemd | Not everything needs Kubernetes |

That table is more important than the exact apps running in the cluster. The apps change. The operating model is what I actually care about.

## Moving from Terraform to Pulumi

I used [Terraform](https://www.terraform.io/) first because Terraform is the default answer for infrastructure as code, and for good reason. It is widely used, well documented, and supported almost everywhere.

For a while, it worked fine.

Eventually, though, I found myself fighting the shape of it for the kind of infrastructure I was managing at home. Some of my infrastructure code wanted normal programming-language structure: functions, conditionals, reusable types, cleaner refactors, and better ways to compose things without turning everything into a maze of modules and variables.

Then HashiCorp switched Terraform to the [Business Source License](https://www.hashicorp.com/en/bsl) in 2023. That was not the only reason I moved, but it was the one that made me actually do it rather than keep putting it off. If the license terms can change under you, the switching cost calculus changes too. Might as well move to something I preferred anyway.

That is why I started moving cloud-adjacent pieces to Pulumi.

Pulumi is not universally better than Terraform. It fit my brain better for this repo. I could model infrastructure in a real language, reuse code more naturally, and make changes without feeling like I was working around the tool as much.

It also matched the way I have grown professionally. Earlier on, I was more willing to accept tool complexity because learning the tool was part of the fun. Now I care more about whether I can come back to the repo in three months and quickly understand what is happening.

That is the standard I use more often now: not "is this powerful?" but "will I hate maintaining this?"

## Removing Ansible

Ansible was useful, but I do not miss having it in the critical path.

The more I moved toward Talos for Kubernetes nodes and Fedora IoT for the few non-cluster hosts, the less Ansible had to do. Talos does not want me SSHing in and configuring packages. Fedora IoT plus Podman and systemd reduced the amount of host mutation I needed. Flux handled Kubernetes state. Pulumi handled the cloud-ish pieces.

At that point, keeping Ansible around felt like maintaining a bridge to an older version of the homelab.

There is nothing wrong with Ansible. I still think it is a good tool for the right job. But in my setup, it was increasingly there to patch over snowflake hosts. Once I stopped designing around snowflake hosts, the playbooks became less necessary.

Removing Ansible was less about replacing it one-for-one and more about removing the category of work it was doing.

Instead of asking, "How do I automate configuring this machine?" I started asking, "Can this machine be less configurable in the first place?"

That question changed a lot.

## Talos: I got tired of maintaining the OS

Talos was the biggest version of that shift — and the most direct admission that I had been solving the wrong problem.

With Ubuntu-based Kubernetes nodes, I always had two systems to care about: Kubernetes and the Linux host underneath it. Even when the host was mostly boring, it still had packages, services, users, SSH access, config files, and plenty of ways to drift away from whatever I thought I had built. I had moved from Unraid to ESXi to k3s to Fedora trying to simplify. I was still patching and babysitting the layer under the layer.

I did not want to keep maintaining the underlying OS. I wanted the node to exist so Kubernetes could run on it, full stop.

Talos removes a lot of that surface area. The node exists to run Kubernetes. Configuration is declarative. Access goes through the Talos API instead of SSH. Upgrades are deliberate. The OS feels more like firmware for the cluster than a general-purpose server I happen to run kubelet on.

I do not want Kubernetes nodes to be interesting. I want the workloads and the network design to be interesting. The nodes themselves should be boring, replaceable, and hard to accidentally mutate.

That is a career-growth lesson as much as a homelab lesson. Earlier in my career, I liked systems that gave me every knob. Now I still like knowing the knobs exist, but I do not necessarily want them all exposed in production. Every knob is also another way to create drift, another thing to document, and another thing to remember during an outage.

Talos is not simpler internally. It is simpler operationally, at least for the way I want to run Kubernetes.

## The current GitOps loop

The current loop is not complicated. A change lands in Git — something I pushed, or a Renovate PR. GitHub Actions validates the manifests. I review and merge, or a narrow automerge rule handles the routine ones. Flux reconciles the cluster. Monitoring tells me whether it actually worked.

The loop is visible. That is what matters.

Renovate turns dependency drift into reviewable PRs. SOPS and age let me keep encrypted secret manifests in the repo. Flux makes the cluster converge toward Git. CI catches the easy mistakes before the cluster sees them. Observability catches the things CI cannot know.

None of that means the system is perfect. The broken Helm chart from the beginning still happened. But when things break now, they usually break inside a process I can understand.

That is a lot better than "I changed something on a server six months ago and now I need to remember what it was."

## What I automate now, and what I do not

My automerge rules have gotten more conservative and more intentional over time.

I am comfortable automerging some digest updates, some patch updates, and some GitHub Actions updates after a release-age delay. I am not comfortable automerging Talos upgrades, major chart bumps, storage changes, or networking changes.

That line is based on pain, not theory.

A failed dashboard update is annoying. A bad [Cilium](https://cilium.io/) change can take the cluster with it. A Talos upgrade means thinking about node health, workloads, storage, and rollback. Those are not "merge while I sleep" changes.

I used to see more automation as the obvious goal. Now I care more about appropriate automation.

The question is not "can this be automated?" The question is "what happens when this automation is wrong?"

## What got simpler

The stack is still technical. It is still a homelab. There are still too many YAML files.

But compared to where it started, the maintenance model is simpler.

The single Unraid or Docker host that took the house down with it is gone — replaced by Talos nodes reconciling from Git. The hand-managed ESXi VMs are gone, replaced by declarative cluster state I can rebuild without archaeology. Ubuntu k3s nodes I used to SSH into became Talos nodes with no SSH surface and much less drift between what I intended and what was actually running. Simple host services that never needed the cluster moved to Fedora IoT and Podman, where they are boring and easy to reason about. Ansible is mostly gone because Talos and Fedora IoT removed the category of work it was doing. Terraform gave way to Pulumi for the pieces where real programming-language structure made refactoring easier. Renovate turned dependency checking from a thing I forgot into a queue of reviewable PRs. Flux made Git the actual source of truth instead of an optimistic description of what the cluster was supposed to be doing.

That does not mean everyone should make the same choices. If Terraform fits your environment, use Terraform. If Ansible is managing a fleet well, keep it. If Ubuntu nodes are working and you have good lifecycle management, there is no moral victory in replacing them.

The lesson for me was not "Talos good, Ubuntu bad" or "Pulumi good, Terraform bad."

The lesson was that my homelab got better when I stopped optimizing for how much I could automate and started optimizing for how little I had to remember.

## Homelab versus work

The funny part is that my homelab has gotten simpler as my work has gotten more complex.

At work, I have dealt with hybrid cloud, air-gapped Kubernetes, stricter controls, more stakeholders, and much larger blast radius. There are places where you need approvals, policy gates, change windows, separate environments, and very explicit operational procedures.

At home, I can move faster. I can test ideas before they are polished. I can let Renovate open noisy PRs, try Talos factory updates, or change how secrets are structured without scheduling a meeting.

But the direction of travel is still similar: fewer snowflakes, clearer ownership, better defaults, and automation that reduces maintenance instead of creating a second system to babysit.

The homelab is where I get to practice those ideas with a smaller blast radius.

There is also a more direct line between the homelab and the work. I am not sure I would have the job I have now if I had started later. Platform engineering and DevOps are harder to break into than they were when I was standing up k3s clusters on ESXi just to see what would happen. The homelab gave me a public record of real problems I had actually solved — commits, a repo, years of operational mistakes documented in git history. That is not the same as production experience, but it is something concrete to point to. I walked into early interviews able to talk about Kubernetes, secrets management, and GitOps before I had years of production work behind me. The homelab was how I built the resume before I had the resume.

Getting in when I did was luck. Having parents who would tolerate a loud server and an enterprise router they did not need was luck too. I think about that when I talk to people trying to break in now. The runway I had is harder to find.

## What I would tell someone starting now

I would not start by copying my repo. A mature homelab repo encodes years of decisions, hardware quirks, old mistakes, and personal preferences. Forking it is a great way to inherit a bunch of context you do not have yet.

Start with one cluster. Put the state in Git. Wire up Flux or [Argo CD](https://argo-cd.readthedocs.io/en/stable/). Encrypt one secret with SOPS and age — just to understand what the workflow actually feels like. Add Renovate, but hold off on automerge until you have a sense of what it proposes. Move one simple service at a time. Write down what breaks.

Resist the pull toward building for imaginary future scale. It is very easy in a homelab to copy enterprise patterns without the enterprise problem that made those patterns necessary.

Use the boring thing until it stops being enough.

## Closing the loop

GitOps at home started because my parents needed somewhere to put photos. Over time it became a way to keep my infrastructure honest.

Unraid taught me containers. r/homelab taught me hardware acquisition. ESXi taught me that a lab can look production-grade while still having a single Docker host of failure. k3s taught me backups, automation, and humility. Fedora matched my day job and pushed simple services off the cluster. Talos made Kubernetes nodes feel disposable. Flux, Renovate, and SOPS made the whole thing something I could step away from without everything rotting until Jellyfin dies on a Friday night.

The end result is not the fanciest possible homelab. It is a quieter one.

That is what I want now: fewer moving parts, lower maintenance, clearer ownership, and enough automation that routine updates happen without turning every weekend into infrastructure chores.

The repo is public at [github.com/coolguy1771/home-ops](https://github.com/coolguy1771/home-ops). If you run something similar, I am especially interested in what you removed over time. The things people stop using usually say more than the things they add.
