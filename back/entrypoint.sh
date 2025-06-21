#!/bin/bash

set -e

echo "Starting Cloud Run deployment..."

# Environment Check
echo "Environment Check:"
echo "PORT: ${PORT:-8080}"
echo "ENV: ${ENV:-development}"
echo "DATABASE_URL: ${DATABASE_URL:-'Not set'}"
echo "PYTHONPATH: ${PYTHONPATH}"

# Port setting
export PORT=${PORT:-8080}

# マイグレーションを完全にスキップ（テーブルは既に存在するため）
echo "Skipping database migrations (tables already exist)"

# テーブルがない場合はこちらを使用する
# # Database migration (production only)
# if [ "${ENV}" = "production" ]; then
#     echo "Running database migrations..."
#     alembic upgrade head
# else
#     echo "Skipping migrations (not production environment)"
# fi

# Application startup
echo "Starting FastAPI application on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT