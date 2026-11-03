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
    'I run a homelab platform shaped like AWS, on three Proxmox nodes, and I run it with a team of AI agents. Every change goes through a pull request, a review and a gate that decides what merges on its own.',
  github: 'https://github.com/petedillo',
  org: 'https://github.com/PeteDio-Labs',
};

export const studies: CaseStudy[] = [
  {
    slug: 'agent-merge-gate',
    title: 'A review-gated agent team with a merge gate',
    tag: 'GitOps',
    accent: 'blue',
    summary: 'Each task gets its own agent session, every pull request gets a review, and a tiered gate decides what merges on its own.',
    stat: { value: '214', label: 'PRs merged in one week, up from 55 the week before' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: ['One person runs a homelab platform across many repos. Reviews and merges became the bottleneck.'],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'An agent workflow where each task gets its own session, every pull request gets a review, and no session approves its own work.',
          'A tiered gate decides what merges automatically. A script scores each PR\'s blast radius, and the low tiers merge after CI and a clean review. A PR does not auto-merge when its review has a blocking finding, a check is red or skipped, or it has no checks. It also waits when it carries a hold label, asks to wait, or needs a hand step.',
          'An unrecognised file path counts as the highest tier, because the rules fail closed. Infrastructure changes run `validate` on PR, then `plan` and `apply` on merge.',
        ],
      },
      {
        heading: 'Result',
        paragraphs: [
          '214 PRs merged in the week of 19 October, up from 55 the week before. Of the 214, 211 were opened by agent sessions and 3 by hand. The count covers eight repos by GitHub merge date, Monday to Sunday, UTC.',
          'The week after had 26, so the 19 October week was a peak, not a steady rate. Throughput is the measure here, not quality.',
        ],
      },
      {
        heading: 'A failure that taught me',
        paragraphs: [
          'One night the secrets store was sealed for about nine and a half hours. The nightly reconcile job reported success on all eleven repos while scanning none of them. A failed token step was set to continue, and the next step treated a missing token as a clean exit.',
          'The job now names the repo and the reason, writes a summary saying it never reached the scan, and exits non-zero. The recurring bug was a green check over work that never happened. In the status jobs I audited, each now fails non-zero and reports what it examined, not only what it found.',
        ],
      },
      {
        heading: 'Scale',
        paragraphs: ['About ten repos and about two dozen containers and VMs on three Proxmox nodes.'],
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
          'It verifies each fact at its source of record before it states a number, and it reads back every change it makes. The user approves sends, changes and anything hard to undo.',
        ],
      },
      {
        heading: 'Result',
        // Source: the agent's own spec, rounded as its publish rules require.
        paragraphs: [
          'The agent keeps about ten debts and payoffs in one sheet with their deadlines, and checks each payment before and after it happens.',
          'It sweeps the inbox three times a day and triages more than a hundred messages in a typical week, without sending or deleting anything on its own. About ten automated checks fire before a payment lands: confirm the income posted, pull a fresh balance, report pay or hold. That handed several hours a week of bill and inbox triage off the household.',
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
        paragraphs: ['Per-role SSH through short-lived certificates signed by Vault, with a time-limited break-glass path for admin work.'],
      },
      {
        heading: 'Result so far',
        paragraphs: [
          'Phase 1 shipped as one PR plus six follow-up fixes after review rounds, through the normal PR flow.',
          'Each signing role names one principal and one lifetime: an hour for admin work, thirty minutes for the service that reads the inventory. Revocation is the clock, not a list.',
          'The role adds certificate trust beside the keys a host already has and never removes a static key. The rollout goes one canary host at a time, and the canary has not passed its live check yet, so no host has dropped static keys.',
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
    summary: 'A local Qwen model and an embedding model on separate consumer GPUs, with a shared search service over docs and repos.',
    stat: { value: '~70', label: 'tokens per second on consumer GPUs' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: ['The budget had no API credit, so an internal agent could not keep calling a hosted API.'],
      },
      {
        heading: 'What I built',
        paragraphs: ['A local Qwen model and an embedding model on separate GPUs, with a search service over docs and repos that the agents share.'],
      },
      {
        heading: 'Result',
        paragraphs: [
          'About 70 tokens per second on consumer hardware.',
          'The chat model is an 8-billion-parameter Qwen3 (5.2 GB, Q4_K_M) on an 8 GB GPU. The embedding model is a 0.6-billion-parameter Qwen3 (Q8_0) on a 6 GB GPU.',
        ],
      },
      {
        // Source: the model audit in the lab notes and the agent's README.
        heading: 'Trade-off',
        paragraphs: [
          'The local model is right only with its thinking turned on, so every answer pays for a reasoning block first. The agent loop caps it at eight tool turns and an eighty-second deadline, and marks a cut answer incomplete instead of passing it off as whole.',
          'Two smaller candidate models never closed their thinking block: they returned an empty answer with a clean status, so the audit deleted them. A model has to be tested on the real question before it earns the default slot.',
          'What the agent stopped needing: an API gateway, a hosted key and a monthly spend cap. The gateway is retired.',
        ],
      },
    ],
    skills: ['Cost-driven architecture', 'GPU passthrough', 'Retrieval'],
  },
  {
    // Sources: petedio-vault Incidents/2026-09-03-rack-loss.md (timeline, backups, recovery mistakes),
    // docs/runbooks/pve03-platform-move.md (36-minute move). Hosts, IPs and VMIDs left out on purpose.
    slug: 'rack-loss-recovery',
    title: 'Recovering a burnt server from backups and config in git',
    tag: 'Resilience',
    accent: 'orange',
    summary: 'A RAID controller caught fire and took a hypervisor down. The services came back from off-cluster backups and rescued config, and I kept a written record of every mistake.',
    stat: { value: '18', label: 'guests restored from a backup taken 9 hours before the fire' },
    sections: [
      {
        heading: 'Problem',
        paragraphs: [
          'At 12:34 on 3 September both nodes of my two-node cluster dropped within the same second, and every guest followed within 35 seconds. The router and a separate GPU machine stayed up, which ruled out a power event on the circuit and a network fault.',
          'One node showed the PowerEdge electrical-fault light and smelled of burning. Its RAID controller had caught fire. The second node was collateral: it lost the media share the first one served.',
        ],
      },
      {
        heading: 'What I built before it happened',
        paragraphs: [
          'Backups that did not live in the cluster they protected. Every guest had a same-day archive on a directory store attached to the GPU machine, which is bare metal and never went down. Backups written to the cluster would have burned with it.',
          'The nightly backup had finished between 02:30 and 03:01, so the newest archive was about nine hours old when the fire started.',
        ],
      },
      {
        heading: 'Recovery',
        paragraphs: [
          'The surviving node came up without quorum, so its configuration store was read-only and nothing could start. I set the expected vote count to one, removed the dead member, and cleared its node directory to free the guest IDs. Before the last step I copied the 18 guest configs off the dead node, because they were the only record of how each guest was wired. They now live in git.',
          'I restored 18 guests from the archives onto the surviving node. A third node joined the next day and the platform tier moved onto it: twelve containers in 36 minutes, with no data loss and no rebuild.',
          'Terraform could not move a container, because a changed node name forces replacement. The plan gates refused the change and showed red CI, which was the gate working. I reconciled state with a script that is scoped to one environment, and after the incident I replaced one-off repairs with declarative state blocks wherever the language allows.',
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
          'Put backups outside the failure domain, and keep the config that describes your guests in git. An empty result is not evidence of an empty directory, so check the exit status before you report absence.',
          'I wrote the incident up while the detail was fresh, and every mistake became a check in the migration guide.',
        ],
      },
    ],
    skills: ['Disaster recovery', 'Proxmox', 'Terraform state', 'Incident write-ups'],
  },
];
