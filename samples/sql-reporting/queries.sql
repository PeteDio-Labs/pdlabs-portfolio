-- Twelve queries over the synthetic review queue. Each one answers a question a team lead asks.
\pset footer off

-- Q1. Volume by month. Is intake steady?
SELECT to_char(date_trunc('month', started_at), 'YYYY-MM') AS month, count(*) AS reviews
FROM reviews GROUP BY 1 ORDER BY 1;

-- Q2. Median and 90th-percentile review time overall. The median hides the slow tail, so read both.
SELECT round(percentile_cont(0.5) WITHIN GROUP (ORDER BY minutes)::numeric, 1) AS median_min,
       round(percentile_cont(0.9) WITHIN GROUP (ORDER BY minutes)::numeric, 1) AS p90_min
FROM reviews;

-- Q3. Template versus no template, same measures. The headline comparison.
SELECT used_template, count(*) AS reviews,
       round(percentile_cont(0.5) WITHIN GROUP (ORDER BY minutes)::numeric, 1) AS median_min,
       round(avg(minutes), 1) AS mean_min
FROM reviews GROUP BY used_template ORDER BY used_template;

-- Q4. The same comparison by category. A mix shift can fake a speedup, so check every category.
SELECT a.category, r.used_template, count(*) AS reviews,
       round(percentile_cont(0.5) WITHIN GROUP (ORDER BY r.minutes)::numeric, 1) AS median_min
FROM reviews r JOIN applications a USING (application_id)
GROUP BY 1, 2 ORDER BY 1, 2;

-- Q5. Weekly median review time with a four-week rolling mean. Shows the rollout as a step down.
WITH weekly AS (
  SELECT date_trunc('week', started_at) AS wk,
         percentile_cont(0.5) WITHIN GROUP (ORDER BY minutes) AS median_min
  FROM reviews GROUP BY 1
)
SELECT to_char(wk, 'YYYY-MM-DD') AS week_start, round(median_min::numeric, 1) AS median_min,
       round(avg(median_min) OVER (ORDER BY wk ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)::numeric, 1) AS rolling_4wk
FROM weekly ORDER BY wk;

-- Q6. Template adoption by reviewer: when did each person switch, and what share of their work uses it?
SELECT rv.name, min(r.started_at) FILTER (WHERE r.used_template)::date AS first_template_use,
       round(100.0 * avg(r.used_template::int), 1) AS pct_with_template
FROM reviews r JOIN reviewers rv USING (reviewer_id)
GROUP BY rv.name ORDER BY first_template_use;

-- Q7. Rework rate before and after. Faster must not mean sloppier.
SELECT used_template, count(*) AS reviews, round(100.0 * avg(reworked::int), 1) AS rework_pct
FROM reviews GROUP BY used_template ORDER BY used_template;

-- Q8. Outcome mix before and after. A speedup that moves outcomes needs a second look.
SELECT used_template, outcome, round(100.0 * count(*) / sum(count(*)) OVER (PARTITION BY used_template), 1) AS pct
FROM reviews GROUP BY used_template, outcome ORDER BY used_template, outcome;

-- Q9. Intake channel against review time. Which channel is slowest after the template?
SELECT a.channel, count(*) AS reviews, round(avg(r.minutes), 1) AS mean_min
FROM reviews r JOIN applications a USING (application_id)
WHERE r.used_template GROUP BY 1 ORDER BY mean_min DESC;

-- Q10. Hours of review work saved. Compares each templated review with the pre-template median for its category.
WITH baseline AS (
  SELECT a.category, percentile_cont(0.5) WITHIN GROUP (ORDER BY r.minutes) AS base_min
  FROM reviews r JOIN applications a USING (application_id)
  WHERE NOT r.used_template GROUP BY 1
)
SELECT round((sum(b.base_min - r.minutes) / 60)::numeric, 0) AS hours_saved, count(*) AS templated_reviews
FROM reviews r JOIN applications a USING (application_id) JOIN baseline b USING (category)
WHERE r.used_template;

-- Q11. Reviewers ranked by speed within category, using a window rank. Flags who might coach others.
SELECT * FROM (
  SELECT a.category, rv.name, round(avg(r.minutes), 1) AS mean_min,
         rank() OVER (PARTITION BY a.category ORDER BY avg(r.minutes)) AS speed_rank
  FROM reviews r JOIN applications a USING (application_id) JOIN reviewers rv USING (reviewer_id)
  WHERE r.used_template GROUP BY a.category, rv.name
) t WHERE speed_rank <= 2 ORDER BY category, speed_rank;

-- Q12. Data-quality check that must return zero rows: a review that starts before its application arrived.
SELECT r.review_id FROM reviews r JOIN applications a USING (application_id)
WHERE r.started_at < a.submitted_at;
