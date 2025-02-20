#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "docker" --dbname "baseball_note" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL
