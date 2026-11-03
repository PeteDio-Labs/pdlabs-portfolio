// Portfolio content. Source: /mnt/project-files/portfolio/case-studies-draft.md (draft 2, with the
// 2026-11-03 correction). Study 1's counts come from data/pr-stats.json (scripts/pr-stats.ts).
// Public-safe rule from that draft: no secrets, internal IPs, hostnames, tokens, account
// details, tool paths or schedule internals. Sections the draft marks [TODO] are left out
// until Pedro supplies the fact. Nothing here is invented: each fact below names its source in
// a comment when it did not come from the draft.

export type Accent = 'blue' | 'red' | 'yellow' | 'violet';

export interface Section {
  heading: string;
  paragraphs: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  tag: string;
  accent: Accent;
  summary: string;
  stat: { value: string; label: string };
  sections: Section[];
  skills: string[];
}

export const site = {
  name: 'Pedro Delgadillo',
  domain: 'pdlab.dev',
  role: 'I build systems with AI.',
  tagline: 'Infrastructure, agents and the gates between them.',
  intro:
    'I run a homelab platform shaped like AWS, on three Proxmox nodes, and I run it with a team of AI agents. Every change goes through a pull request, a review and a gate that decides when it merges.',
  github: 'https://github.com/petedillo',
  org: 'https://github.com/PeteDio-Labs',
};

export const studies: CaseStudy[] = [
  {
    slug: 'agent-merge-gate',
    title: 'A review-gated agent team with a merge gate',
    tag: 'GitOps',
    accent: 'blue',
    summary: 'Each task gets its own agent session, every pull request gets a review, and a tiered gate decides when it merges.',
    stat: { value: '214', label: 'PRs merged in one week, up from 55 the week before' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: ['One person runs a homelab platform across many repos. Reviews and merges became the bottleneck.'],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'An agent workflow where each task gets its own session, every pull request gets a review, and no session approves its own work. A session may merge its own PR only outside the infrastructure repo, and only after a separate review has cleared it.',
          'A tiered gate decides who merges. A script scores each PR\'s blast radius from the files it touches. Tier 0 is prose. Tier 1 is code that runs nothing on merge. Tier 2 is everything else, such as infrastructure code and workflows. A merge bot with deterministic code merges tiers 0 and 1 after CI and a clean review. A separate merger handles tier 2 under the same gate. No model output widens what merges.',
          'A PR waits when its review has a blocking finding, a check is red or skipped, or it has no checks. It also waits when it carries a hold label, asks to wait, or needs a hand step. A push voids the review of the old head, and the merge is pinned to the commit that was reviewed. After each merge, the bot reads the main branch back and expects the change to be there.',
          'An unrecognised file path counts as tier 2, because the rules fail closed. Infrastructure changes run `validate` on PR, then `plan` and `apply` on merge. Credentials and destructive flags stay hand steps that no merge runs.',
        ],
      },
      {
        heading: 'Result',
        paragraphs: [
          '214 PRs merged in the week of 19 October, up from 55 the week before. Of the 214, 211 carried an agent author or footer and 3 did not, which is a heuristic because agent PRs can come from my own login. The count covers eight repos by GitHub merge date, Monday to Sunday, UTC.',
          'The week after had 26, so the 19 October week was a peak, not a steady rate. Throughput is the measure here, not quality.',
        ],
      },
      {
        // Source: petedio-vault Incidents/2026-09-09-vault-sealed-nine-hours.md (9 h 34 min, 1,724 DOWN heartbeats, 19 monitors, eleven repos).
        heading: 'A failure that taught me',
        paragraphs: [
          'On 9 September the secrets store sat sealed for 9 hours and 34 minutes. The watcher that unsealed it ran on a laptop that had gone to sleep. The tracker reconcile job, which had gained eleven calling repos the day before, reported success in all eleven while reconciling nothing. Its token step was set to continue, and the next step treated a missing token as a clean exit. A warning annotation does not colour a check.',
          'Two other things stood out. The sibling reconcile job had hit the same error and failed loudly, because an earlier incident had already fixed it there. And the uptime monitor recorded 1,724 consecutive DOWN heartbeats for the sealed store, then told nobody, because none of its 19 monitors had a notification channel attached.',
          'The reconcile job now fails when it cannot get a token, and says why. The unseal watcher moved to an always-on machine and re-reads the seal status after it submits the key, so it exits non-zero if the store is still sealed. The recurring bug was a green check over work that never happened. In the status jobs I audited, each now fails non-zero and reports what it examined, not only what it found.',
        ],
      },
      {
        heading: 'Scale',
        paragraphs: ['About ten repos and about two dozen containers and VMs on three Proxmox nodes. The platform follows the AWS shape: containers stand in for EC2, MinIO for S3, Postgres for RDS and Vault for Secrets Manager, so it can move to AWS by swapping the provider and variables.'],
      },
      {
        // Source: the rule the repo now carries, written after six items with the same shape.
        heading: 'What I would do differently',
        paragraphs: [
          'Write the reporting rule before the first automation, not after the sixth bug. Six separate work items had the same shape: a job that could not authenticate, could not reach its target, or checked nothing, and reported success.',
          'The rule that ended it is short. A failure path exits non-zero, and a check says what it examined, not only what it found. A gate that relaxes a check replaces the signal it removed.',
        ],
      },
    ],
    skills: ['CI/CD design', 'Guardrails for AI agents', 'Terraform and Ansible', 'GitOps'],
  },
  {
    slug: 'finance-agent',
    title: 'A household finance agent with read-only access',
    tag: 'Agents',
    accent: 'red',
    summary: 'A personal agent that reads email, calendar and bank data, writes only calendar events and sheet cells, and reads back every change.',
    stat: { value: '100+', label: 'inbox messages triaged in a typical week' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: ['A household\'s money lives in many places: inboxes, calendars, bank apps and lender portals. Due dates slip and promotional deadlines pass unnoticed.'],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'A personal agent with read-only access to email, calendar, spreadsheets and bank data. It can write calendar events and spreadsheet cells. It cannot move money, delete records or change account settings.',
          'It verifies each fact at its source of record before it states a number: the calendar for dates, bank data for balances, the lender\'s statement for terms. It reads back every change it makes, by fetching the calendar event or sheet row again. The user approves sends, changes and anything hard to undo.',
          'Mail is the coordination channel between the household\'s two agents, with a header block that names sender, topic and type. Logins stay in a secure vault and never appear in chat or mail.',
          'The payoff plan orders debts by deadline first, then by rate, and every bill and payoff is a dated calendar event.',
        ],
      },
      {
        heading: 'Result',
        // Source: the agent's own spec, rounded as its publish rules require.
        paragraphs: [
          'The agent keeps about ten debts and payoffs in one sheet with their deadlines, and checks each payment before and after it happens.',
          'It sweeps the inbox three times a day and triages more than a hundred messages in a typical week, without sending or deleting anything on its own. About ten automated checks fire before a payment lands: confirm the income posted, pull a fresh balance, report pay or hold. It built or corrected dozens of dated money events on the shared calendar. That handed several hours a week of bill and inbox triage off the household.',
        ],
      },
      {
        heading: 'Lesson',
        paragraphs: ['Limit what the agent can do before you tune how well it does it. Read-only access plus read-back made its mistakes cheap to catch.'],
      },
    ],
    skills: ['Agent safety design', 'Tool permissioning', 'Human-in-the-loop approval'],
  },
  {
    slug: 'ssh-ca',
    title: 'Short-lived access with a Vault-signed SSH CA',
    tag: 'Security',
    accent: 'yellow',
    summary: 'Per-role SSH through short-lived certificates instead of static keys and shared sudo grants.',
    stat: { value: '60 min', label: 'longest a certificate lives; the service role gets 30' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: ['Static SSH keys and shared sudo grants give every session more access than its task needs.'],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'Before this, the deploy roles shared one static key. I chose Vault-signed certificates over a directory service, an LDAP proxy and per-role static keys.',
          'Vault holds the CA private key and it never leaves. A caller sends its public key to a signing role and gets back a certificate that names one principal and expires with the role. A host trusts the CA and lists, per local user, which principals may log in as that user. Hosts verify certificates offline, so no host calls Vault. A time-limited break-glass path covers admin work.',
        ],
      },
      {
        heading: 'Result so far',
        paragraphs: [
          'Phase 1 shipped as one PR, then six follow-up PRs through the normal flow: two that closed review findings before the first canary run, and four that fixed the role and its checks, such as revoking principals files the role does not own and not reloading sshd on hosts that start it by socket.',
          'Each signing role names one principal and one lifetime: an hour for admin work, thirty minutes for the service that reads the inventory. Revocation is the clock, not a list. Nothing is signed while Vault is sealed, so a scheduled caller fails loudly.',
          'The role adds certificate trust beside the keys a host already has and never removes a static key. The rollout goes one canary host at a time, and the canary has not passed its live check yet, so no host has dropped static keys yet.',
        ],
      },
      {
        heading: 'Lesson',
        paragraphs: ['A sudo grant belongs to the user ID, not the process, so isolation must be designed at the identity level.'],
      },
    ],
    skills: ['Secrets management', 'Least privilege', 'Threat modeling'],
  },
  {
    slug: 'local-llm',
    title: 'A self-hosted LLM on Proxmox',
    tag: 'AI infra',
    accent: 'violet',
    summary: 'A local Qwen model and an embedding model on separate consumer GPUs, with a shared search service over the vault, the tracker, lab digests and repo docs.',
    stat: { value: '71–128', label: 'tokens per second with thinking on and off, on one consumer GPU' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: ['The budget had no API credit, so an internal agent could not keep calling a hosted API.'],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'A local Qwen model and an embedding model on separate GPUs, each served by its own Ollama instance pinned to one card. A lab agent answers questions about the platform from the local model, and a search service that the agents share supplies the context.',
          'The search service indexes the knowledge vault, the tracker, lab digests and repo docs. It embeds with the local embedding model and refuses to start without a caller token. Its tests use a fake embedder, so CI needs no route to the lab.',
        ],
      },
      {
        // Sources: petedio-vault Systems/ollama-local-inference.md (4 September audit, 71 and 128 tok/s) and petedio-search README (four sources).
        heading: 'Result',
        paragraphs: [
          'The 8B model generates 71 tokens per second with thinking on and 128 with it off, measured on 4 September. The lab agent runs with thinking off. The model, a 5.2 GB file, fits on one 8 GB card with its context.',
          'The chat model is an 8-billion-parameter Qwen3 (5.2 GB, Q4_K_M) on an 8 GB GPU. The embedding model is a 0.6-billion-parameter Qwen3 (Q8_0) on a 6 GB GPU.',
        ],
      },
      {
        // Source: the model audit in the lab notes and the agent's README.
        heading: 'Trade-off',
        paragraphs: [
          'A thinking Qwen3 spends its output limit on reasoning, so the agent turns thinking off. The agent loop caps each reply at 1,024 tokens, eight model turns and an eighty-second deadline. The last turn offers no tools, and a cut or empty answer is marked incomplete instead of being passed off as whole.',
          'I audited every installed model on one question with thinking on and off: how many simultaneous disk failures a RAIDZ1 vdev survives. The Qwen3 8B model answered correctly both ways. Gemma 4 answered correctly only with thinking on. The two Qwen3.5 models, a 4B and a 9B, never closed their thinking block: they returned an empty answer with a clean status, so the audit deleted them. A model has to be tested on the real question before it earns the default slot.',
          'What the agent stopped needing: an API gateway, a hosted key and a monthly spend cap. The gateway is retired.',
        ],
      },
    ],
    skills: ['Cost-driven architecture', 'GPU passthrough', 'Retrieval'],
  },
  {
    // Sources: Pedro's account in the case-study thread, 2026-11-03 (power-supply sequence, about four hours);
    // petedio-vault Incidents/2026-09-03-rack-loss.md (timeline, backups, recovery mistakes),
    // docs/runbooks/pve03-platform-move.md (36-minute move). Hosts, IPs and VMIDs left out on purpose.
    slug: 'rack-loss-recovery',
    title: 'Recovering a burnt server from backups and config in git',
    tag: 'Resilience',
    accent: 'red',
    summary: 'A RAID controller caught fire while I was debugging a power supply. Infrastructure as code and off-cluster backups brought the platform back in about four hours, and I wrote down every mistake.',
    stat: { value: '~4 hrs', label: 'to rebuild the platform from code and backups' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: [
          'The server had a power-supply warning light. It had two supplies, so I pulled them one at a time to find the bad one. When I tested the bad one, the RAID controller caught fire.',
          'At 12:34 on 3 September both nodes of my two-node cluster dropped within the same second, and every guest followed within 35 seconds. The router and a separate GPU machine stayed up, which ruled out a power event on the circuit and a network fault. The fault light and the smell of burning pointed at the controller. The second node was collateral: it lost the media share the first one served.',
        ],
      },
      {
        heading: 'What I built before it happened',
        paragraphs: [
          'Backups that did not live in the cluster they protected. Every guest had a same-day archive on a directory store attached to the GPU machine, which is bare metal and never went down. Backups written to the cluster would have burned with it.',
          'The nightly backup had finished between 02:30 and 03:01 that morning, so the newest archive was about nine hours old when the fire started.',
        ],
      },
      {
        heading: 'Recovery',
        paragraphs: [
          'The surviving node came up without quorum, so its configuration store was read-only and nothing could start. I set the expected vote count to one, removed the dead member, and cleared its node directory to free the guest IDs. Before the last step I copied the 18 guest configs off the dead node, because they were the only record of how each guest was wired. They now live in git.',
          'Archives existed for all 18 guests. I restored them from the archives onto the surviving node and flashed a fresh machine as a new third node, and Terraform and Ansible brought the main services back in about four hours. The smaller services came back over the next couple of days, because I used the outage to decide which ones I still needed. I no longer run a container registry, for example. The platform tier moved onto the new node: twelve containers in 36 minutes, with no data loss and no rebuild.',
          'Terraform could not move a container, because a changed node name forces replacement. The plan gates refused the change and showed red CI, which was the gate working. I reconciled state with a repair script scoped to one environment, and I now reach for declarative state blocks first, wherever the language can express the repair.',
        ],
      },
      {
        heading: 'What I lost',
        paragraphs: [
          'The 2.6 TB media library. The disks sat behind a hardware RAID controller with a controller-specific on-disk format, and the controller was the part that burned. I cannot read those disks in another machine.',
          'The rebuild uses ZFS on plain disks, so any machine with the disks attached can import the pool. Hardware RAID made the data hostage to one card.',
        ],
      },
      {
        heading: 'What went wrong during recovery',
        paragraphs: [
          'Four mistakes, three of them mine. The rescued configs named a storage pool that only existed on the dead node. The network bridge had a different name on the surviving node. My remap loop checked only the first network interface, so one guest with a second interface came up with no network. And an empty result from a privileged command nearly became the report that no backups existed.',
          'After the hypervisor was back, the applications were not usable. The downloader reported a space error that was a missing directory. The media managers still held records for files that died with the array, and one request app pointed at a server that no longer existed. Nothing warns you that a downstream service moved; the requests just fail.',
        ],
      },
      {
        heading: 'Lesson',
        paragraphs: [
          'The fire was my mistake. I tested a failing power supply on a live server with a hardware RAID controller in it, and I lost the media because only that controller could read the disks. I own that.',
          'The better choices are the ones I made afterward: ZFS on plain disks that any machine can import, backups outside the failure domain, and guest config in git. An empty result is not evidence of an empty directory, so I check the exit status before I report absence.',
          'The old GPU machine later became the first node again, so the cluster is back to three nodes. I wrote the incident up while the detail was fresh, and every mistake became a check in the migration guide.',
        ],
      },
    ],
    skills: ['Disaster recovery', 'Proxmox', 'Terraform state', 'Incident write-ups'],
  },
];
