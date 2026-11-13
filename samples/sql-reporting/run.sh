#!/usr/bin/env bash
# Builds the synthetic dataset in a scratch Postgres database and runs the twelve queries.
# Usage: ./run.sh [database]   (defaults to "sqlsample"; needs psql and a reachable server)
set -euo pipefail
cd "$(dirname "$0")"
db="${1:-sqlsample}"
psql -q -v ON_ERROR_STOP=1 "$db" -f schema.sql -f seed.sql >/dev/null
rows=$(psql -Atq "$db" -c 'SELECT count(*) FROM reviews')
[ "$rows" -eq 1800 ] || { echo "expected 1800 reviews, found $rows" >&2; exit 1; }
echo "examined $rows reviews in $db"
psql "$db" -f queries.sql
