"""create_tables

Revision ID: bf9ed9e50554
Revises: 
Create Date: 2025-02-18 13:44:21.313797

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bf9ed9e50554'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('trainings',
    sa.Column('menu', sa.Text(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id')
    )
    op.create_table('users',
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('role', sa.Integer(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('id')
    )
    op.create_table('notes',
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('theme', sa.String(length=255), nullable=False),
    sa.Column('assignment', sa.Text(), nullable=False),
    sa.Column('practice_video', sa.String(length=255), nullable=True),
    sa.Column('my_video', sa.String(length=255), nullable=True),
    sa.Column('weight', sa.DECIMAL(precision=4, scale=1), nullable=False),
    sa.Column('sleep', sa.DECIMAL(precision=3, scale=1), nullable=False),
    sa.Column('looked_day', sa.Text(), nullable=False),
    sa.Column('practice', sa.Text(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id')
    )
    op.create_table('profiles',
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('team_name', sa.String(length=255), nullable=False),
    sa.Column('birthday', sa.TIMESTAMP(timezone=True), nullable=False),
    sa.Column('player_dominant', sa.Enum('RIGHT_RIGHT', 'RIGHT_LEFT', 'LEFT_RIGHT', 'LEFT_LEFT', 'BOTH_RIGHT', 'BOTH_LEFT', 'RIGHT_BOTH', 'LEFT_BOTH', 'BOTH_BOTH', name='dominant_hand_type'), nullable=False),
    sa.Column('player_position', sa.Enum('PITCHER', 'CATCHER', 'FIRST', 'SECOND', 'THIRD', 'SHORT', 'LEFT', 'CENTER', 'RIGHT', name='player_position_type'), nullable=False),
    sa.Column('admired_player', sa.String(length=255), nullable=True),
    sa.Column('introduction', sa.Text(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id')
    )
    op.create_table('comments',
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('note_id', sa.UUID(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['note_id'], ['notes.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id')
    )
    op.create_table('training_notes',
    sa.Column('training_id', sa.UUID(), nullable=False),
    sa.Column('note_id', sa.UUID(), nullable=False),
    sa.Column('count', sa.Integer(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['note_id'], ['notes.id'], ),
    sa.ForeignKeyConstraint(['training_id'], ['trainings.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('training_notes')
    op.drop_table('comments')
    op.drop_table('profiles')
    op.drop_table('notes')
    op.drop_table('users')
    op.drop_table('trainings')
    # ### end Alembic commands ###
    