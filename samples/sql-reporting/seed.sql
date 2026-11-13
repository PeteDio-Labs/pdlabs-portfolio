-- Deterministic seed: the same rows every run. 6 reviewers, 1,800 applications, Jan-Jun 2026.
-- The checklist template reaches reviewers one at a time between 2026-03-02 and 2026-04-13.
SELECT setseed(0.42);

INSERT INTO reviewers
SELECT n, 'Reviewer ' || n, DATE '2024-01-01' + (n * 97)
FROM generate_series(1, 6) n;

INSERT INTO applications
SELECT n,
       TIMESTAMPTZ '2026-01-05 08:00+00' + (random() * 176) * interval '1 day' + (random() * 9) * interval '1 hour',
       (ARRAY['portal','portal','portal','mail','phone'])[1 + floor(random() * 5)::int],
       (ARRAY['standard','standard','standard','complex','renewal'])[1 + floor(random() * 5)::int]
FROM generate_series(1, 1800) n;

WITH base AS (
  SELECT a.application_id, a.category,
         1 + floor(random() * 6)::int AS reviewer_id,
         a.submitted_at + (random() * 36) * interval '1 hour' AS started_at
  FROM applications a
), rollout AS (
  SELECT b.*,
         -- reviewer r gets the template on 2026-03-02 + (r-1)*7 days
         (b.started_at >= TIMESTAMPTZ '2026-03-02 00:00+00' + (b.reviewer_id - 1) * interval '7 days') AS used_template
  FROM base b
)
INSERT INTO reviews
SELECT row_number() OVER (ORDER BY application_id), application_id, reviewer_id, started_at,
       round((
         CASE category WHEN 'complex' THEN 42 WHEN 'renewal' THEN 18 ELSE 28 END
         * CASE WHEN used_template THEN 0.38 ELSE 1 END
         * (0.8 + random() * 0.4)
       )::numeric, 1),
       used_template,
       (ARRAY['approved','approved','approved','denied','returned'])[1 + floor(random() * 5)::int],
       random() < CASE WHEN used_template THEN 0.07 ELSE 0.11 END
FROM rollout;
