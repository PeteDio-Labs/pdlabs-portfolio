-- Synthetic review-queue data. Nothing here comes from a real person, employer or system.
DROP TABLE IF EXISTS reviews, applications, reviewers CASCADE;

CREATE TABLE reviewers (
  reviewer_id  int PRIMARY KEY,
  name         text NOT NULL,
  hired_on     date NOT NULL
);

CREATE TABLE applications (
  application_id int PRIMARY KEY,
  submitted_at   timestamptz NOT NULL,
  channel        text NOT NULL CHECK (channel IN ('portal', 'mail', 'phone')),
  category       text NOT NULL CHECK (category IN ('standard', 'complex', 'renewal'))
);

CREATE TABLE reviews (
  review_id      int PRIMARY KEY,
  application_id int NOT NULL REFERENCES applications,
  reviewer_id    int NOT NULL REFERENCES reviewers,
  started_at     timestamptz NOT NULL,
  minutes        numeric(6,1) NOT NULL CHECK (minutes > 0),
  used_template  boolean NOT NULL,
  outcome        text NOT NULL CHECK (outcome IN ('approved', 'denied', 'returned')),
  reworked       boolean NOT NULL
);

CREATE INDEX reviews_started_idx ON reviews (started_at);
