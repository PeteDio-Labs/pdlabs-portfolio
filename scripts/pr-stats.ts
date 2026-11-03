// Counts merged pull requests across the in-scope PeteDio-Labs repos and writes
// data/pr-stats.json for the portfolio site.
//
// To regenerate the file, run `bun run scripts/pr-stats.ts` with `gh` signed in
// to an account that can search the repos. The script reads through the GitHub
// search API (`search/issues`), so it needs no token of its own.
//
// The script exits non-zero when any repo cannot be read, when a search returns
// more results than it fetched, or when the weekly totals disagree with the
// repo totals. It never writes a partial file.

import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const OWNER = "PeteDio-Labs";
// The eight repos in session scope. A repo with zero merged PRs still counts as
// read when its search returns successfully.
const REPOS = [
  "petedio-iac",
  "petedio-workspace",
  "petedio-vault",
  "petedio-pm",
  "pete-bot",
  "petedio-usaa",
  "petedio-search",
  "pdlabs-portfolio",
];
const SEARCH_CAP = 1000; // The search API returns at most 1000 results per query.
const PAGE_SIZE = 100;
const FOOTER = "Claude Code"; // Claude-written PR bodies carry this footer.
const OUT = process.argv.includes("--out")
  ? process.argv[process.argv.indexOf("--out") + 1]
  : "data/pr-stats.json";

interface SearchItem {
  number: number;
  user: { login: string } | null;
  body: string | null;
  pull_request?: { merged_at: string | null };
}

interface SearchPage {
  total_count: number;
  incomplete_results: boolean;
  items: SearchItem[];
}

interface MergedPr {
  repo: string;
  number: number;
  mergedAt: string;
  author: string;
  group: string;
}

async function gh(args: string[]): Promise<string> {
  const proc = Bun.spawn(["gh", ...args], { stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) {
    throw new Error(`gh ${args.slice(0, 3).join(" ")} failed (exit ${code}): ${err.trim()}`);
  }
  return out;
}

async function searchPage(query: string, page: number): Promise<SearchPage> {
  const out = await gh([
    "api", "-X", "GET", "search/issues",
    "-f", `q=${query}`,
    "-f", `per_page=${PAGE_SIZE}`,
    "-f", `page=${page}`,
  ]);
  return JSON.parse(out) as SearchPage;
}

// Maps a PR author to the group the site reports. The Claude footer tells a
// Claude-written PR apart from one Pedro wrote under his own login.
function groupOf(login: string, body: string | null): string {
  if (login === "petedio-cloud-threads[bot]") return "Claude threads (bot)";
  if (login === "petedio-ops-247[bot]") return "247 host (bot)";
  if (login === "petedillo") {
    return body?.includes(FOOTER) ? "Claude under Pedro login" : "Pedro";
  }
  return `Other: ${login}`;
}

// ISO week, keyed by the Monday that starts it, in UTC.
function weekOf(iso: string): string {
  const d = new Date(iso);
  const back = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

async function readRepo(repo: string): Promise<{ repo: string; searchTotal: number; prs: MergedPr[] }> {
  const query = `repo:${OWNER}/${repo} is:pr is:merged`;
  const first = await searchPage(query, 1);
  if (first.incomplete_results) {
    throw new Error(`${repo}: search returned incomplete results`);
  }
  const total = first.total_count;
  if (total > SEARCH_CAP) {
    throw new Error(`${repo}: ${total} merged PRs is over the ${SEARCH_CAP}-result search cap`);
  }
  const items = [...first.items];
  for (let page = 2; page <= Math.ceil(total / PAGE_SIZE); page++) {
    items.push(...(await searchPage(query, page)).items);
  }
  if (items.length !== total) {
    throw new Error(`${repo}: fetched ${items.length} of ${total} merged PRs`);
  }
  const prs: MergedPr[] = items.map((item) => {
    const mergedAt = item.pull_request?.merged_at;
    if (!mergedAt) throw new Error(`${repo}#${item.number}: search result has no merged_at`);
    const author = item.user?.login ?? "(deleted user)";
    return {
      repo,
      number: item.number,
      mergedAt,
      author,
      group: groupOf(author, item.body),
    };
  });
  return { repo, searchTotal: total, prs };
}

interface Bucket {
  total: number;
  byAuthor: Record<string, number>;
  byRepo: Record<string, number>;
}

function emptyBucket(): Bucket {
  return { total: 0, byAuthor: {}, byRepo: {} };
}

function add(bucket: Bucket, pr: MergedPr): void {
  bucket.total++;
  bucket.byAuthor[pr.group] = (bucket.byAuthor[pr.group] ?? 0) + 1;
  bucket.byRepo[pr.repo] = (bucket.byRepo[pr.repo] ?? 0) + 1;
}

async function main(): Promise<void> {
  const results = [];
  for (const repo of REPOS) {
    results.push(await readRepo(repo));
  }
  const all = results.flatMap((r) => r.prs);

  const overall = emptyBucket();
  const weeks = new Map<string, Bucket>();
  for (const pr of all) {
    add(overall, pr);
    const week = weekOf(pr.mergedAt);
    if (!weeks.has(week)) weeks.set(week, emptyBucket());
    add(weeks.get(week)!, pr);
  }

  // Cross-check: the weekly table must add up to the repo totals.
  const weekSum = [...weeks.values()].reduce((n, b) => n + b.total, 0);
  if (weekSum !== all.length || all.length !== results.reduce((n, r) => n + r.searchTotal, 0)) {
    throw new Error(`totals disagree: weeks ${weekSum}, PRs ${all.length}`);
  }

  const sortedWeeks = [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b));
  const peak = sortedWeeks.reduce((best, cur) => (cur[1].total > best[1].total ? cur : best));

  const report = {
    generated_at: new Date().toISOString(),
    source: `GitHub search API, is:pr is:merged, ${REPOS.length} in-scope repos under ${OWNER}`,
    week_rule: "Monday 00:00 UTC to Sunday, keyed on merged_at",
    author_rule:
      "Author is the PR's login. A PR under the petedillo login counts as Claude when its body contains 'Claude Code'.",
    totals: { merged: all.length },
    repos: results.map((r) => ({
      repo: r.repo,
      merged: r.prs.length,
      search_total: r.searchTotal,
      read: r.prs.length === r.searchTotal,
    })),
    authors: overall.byAuthor,
    peak_week: { week: peak[0], merged: peak[1].total },
    // The week that contains the run date is still open, so its count is partial.
    in_progress_week: weekOf(new Date().toISOString()),
    weeks: sortedWeeks.map(([week, b]) => ({
      week,
      merged: b.total,
      authors: b.byAuthor,
      repos: b.byRepo,
    })),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await Bun.write(OUT, JSON.stringify(report, null, 2) + "\n");
  console.error(
    `pr-stats: read ${all.length} merged PRs from ${results.length} repos; wrote ${OUT}; peak week ${peak[0]} (${peak[1].total})`,
  );
}

main().catch((err: unknown) => {
  console.error(`pr-stats: failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
