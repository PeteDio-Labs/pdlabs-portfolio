# SQL and reporting sample

Twelve documented PostgreSQL queries over a synthetic review queue. The question: **did a
checklist template make reviews faster without making them worse?**

## The data is synthetic, and the effect is built in

`seed.sql` generates 6 reviewers, 1,800 applications and 1,800 reviews with a fixed random seed.
No row comes from a real person, employer or system. The generator cuts a templated review's
expected time to 38% of the untemplated time, so the speedup in the results is **a design choice,
not a finding**. The sample shows how to measure a change like this, not that any real change worked.

The template reaches one reviewer per week from 2026-03-02, so every reviewer has untemplated
work before and templated work after. That staggered start lets query Q5 show the step down.

## Run it

```sh
createdb sqlsample
./run.sh sqlsample          # builds the tables, checks the row count, runs queries.sql
```

`run.sh` exits non-zero when the seed does not produce 1,800 reviews, and prints how many it examined.
`results.txt` holds one run's output.

## What the numbers say

| Question | Query | Result |
|---|---|---|
| Is the speedup real? | Q3 | Median review time fell from 28.1 to 10.8 minutes (762 reviews before, 1,038 after). |
| Is it a mix shift? | Q4 | No. Every category fell by 60% or more: standard 28.2 to 10.7, complex 41.5 to 15.8, renewal 18.4 to 6.9. |
| Did quality slip? | Q7 | Rework fell from 9.6% to 6.5%. |
| Did outcomes change? | Q8 | Denials rose from 17.7% to 21.5%. The generator draws outcomes at the same rate in both groups, so this gap is sampling noise. On real data, this is the row to investigate before you report the speedup. |
| How did it roll out? | Q5, Q6 | Weekly median fell from about 28 to about 11 minutes across six weeks, as each reviewer switched. |
| What did it save? | Q10 | About 312 review hours across 1,038 templated reviews, measured against each category's untemplated median. |
| Is the data clean? | Q12 | Zero reviews start before their application arrives. A non-empty result would mean the join or the load is wrong. |

## Techniques covered

Joins, `FILTER`, `percentile_cont` for medians and tails, window functions (`rank`, rolling
`avg`, `sum() OVER (PARTITION BY)`), CTEs, `date_trunc`, and a data-quality query that must return
zero rows. Q2 reports the 90th percentile next to the median, because a median hides the slow tail.

## Limits

- A before-and-after comparison does not prove cause. The staggered rollout helps, because a
  calendar effect would hit all reviewers at once, but a real study would also check for a change in
  case mix and in who got the template first.
- The mean and the median agree here because the generator has no outliers. Real review times skew
  long, so report the median and the 90th percentile.
