"""add_img_path_to_profiles

Revision ID: 556b7357afbd
Revises: aa3febf53565
Create Date: 2025-02-28 10:39:32.486444

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '556b7357afbd'
down_revision = 'aa3febf53565'
branch_labels = None
depends_on = None


def upgrade():
     op.add_column('profiles', 
                 sa.Column('img_path', sa.String(255), nullable=True))


def downgrade():
    op.drop_column('profiles', 'img_path')
