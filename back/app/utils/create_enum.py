from alembic import op
import sqlalchemy as sa


def create_enum(enum_name, enum_values):
    conn = op.get_bind()

    check_enum_sql = f"""
    SELECT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = '{enum_name}'
    );
    """

    result = conn.execute(sa.text(check_enum_sql)).scalar()

    if result:
        drop_enum_sql = f"DROP TYPE {enum_name} CASCADE;"
        conn.execute(sa.text(drop_enum_sql))
        print(f"Dropped existing ENUM {enum_name}")

    values_sql = ", ".join(f"'{value}'" for value in enum_values)
    create_enum_sql = f"CREATE TYPE {enum_name} AS ENUM ({values_sql});"
    conn.execute(sa.text(create_enum_sql))
    print(f"Created ENUM {enum_name}")
