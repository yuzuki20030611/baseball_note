#!/bin/bash
set -e
# [開発期間中一時的に導入] DBテーブルの削除
python seeder/run.py drop_all_tables || { echo "テーブルの削除に失敗しました"; exit 1; }

alembic upgrade head || { echo "Alembic migration failed"; exit 1; }

# [開発期間中一時的に導入] シードデータの投入
python seeder/run.py import_seed || { echo "シードデータの投入に失敗しました"; exit 1; }

exec "$@"
