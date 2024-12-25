import logging
from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from fastapi import status
from httpx import AsyncClient
from pydantic_settings import SettingsConfigDict
from pytest_postgresql import factories
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy.sql import select

import alembic.command
import alembic.config
from app import schemas
from app.core.config import Settings
from app.core.database import get_async_db
from app.main import app
from app.models.base import Base
from app.models.users import User

from unittest.mock import MagicMock, patch
from google.oauth2 import service_account

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s  %(message)s %(filename)s %(module)s %(funcName)s %(lineno)d",
)
logger = logging.getLogger(__name__)


pytest.USER_ID: str | None = None
pytest.USER_DICT: dict[str, Any] | None = None
pytest.ACCESS_TOKEN: str | None = None

logger.info("root-conftest")


class TestSettings(Settings):
    """テストのみで使用する設定を記述"""

    TEST_USER_UID: str = "test-uid"
    TEST_USER_NAME: str = "test-user"

    model_config = SettingsConfigDict(env_file=".env.test")
    def get_database_url(self, is_async: bool = False) -> str:
        db_url = f"postgresql+asyncpg://{self.DB_USER_NAME}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return db_url if is_async else db_url.replace("+asyncpg", "")


settings = TestSettings()

logger.debug("start:postgres_proc")
db_proc = factories.postgresql_noproc(
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    user=settings.DB_USER_NAME,
    password=settings.DB_PASSWORD,
)
postgresql = factories.postgresql("db_proc")
logger.debug("end:postgres_proc")


TEST_USER_CREATE_SCHEMA = schemas.UserCreate(
    uid=settings.TEST_USER_UID,
    name=settings.TEST_USER_NAME,
)


def migrate(
    versions_path: str,
    migrations_path: str,
    uri: str,
    alembic_ini_path: str,
    connection: Any = None,
    revision: str = "head",
) -> None:
    config = alembic.config.Config(alembic_ini_path)
    config.set_main_option("version_locations", versions_path)
    config.set_main_option("script_location", migrations_path)
    config.set_main_option("sqlalchemy.url", uri)
    # config.set_main_option("is_test", "1")
    if connection is not None:
        config.attributes["connection"] = connection
    alembic.command.upgrade(config, revision)


@pytest_asyncio.fixture
async def engine(
    postgresql: Any,  # noqa: ARG001
) -> AsyncEngine:
    """fixture: db-engineの作成およびmigrate"""
    logger.debug("fixture:engine")
    uri = settings.get_database_url(is_async=True)
    engine = create_async_engine(uri, echo=False, poolclass=NullPool)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await create_enums(conn)
        await conn.run_sync(Base.metadata.create_all)
    return engine


async def create_enums(conn):
    await conn.execute(sa.text("""
        CREATE TYPE instagrampostreservationstatusenum AS ENUM (
            'SUCCESS',
            'FAILED',
            'NOT_EXECUTE'
        );
    """))


@pytest_asyncio.fixture
async def db(
    engine: AsyncEngine,
) -> AsyncGenerator[AsyncSession, None]:
    """fixture: db-sessionの作成"""
    logger.debug("fixture:db")
    test_session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

    async with test_session_factory() as session:
        yield session
        await session.commit()


@pytest_asyncio.fixture
async def client(engine: AsyncEngine) -> AsyncClient:
    """fixture: HTTP-Clientの作成"""
    logger.debug("fixture:client")
    test_session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with test_session_factory() as session:
            yield session
            await session.commit()

    # get_dbをTest用のDBを使用するようにoverrideする
    app.dependency_overrides[get_async_db] = override_get_db
    app.debug = False
    return AsyncClient(app=app, base_url="http://test")


async def _insert_user(db: AsyncSession, user_dict: dict[str, Any]) -> None:
    del user_dict["_sa_instance_state"]
    db.add(User(**user_dict))
    await db.commit()


@pytest_asyncio.fixture
async def authed_client(client: AsyncClient, db: AsyncSession) -> AsyncClient:
    """fixture: clietnに認証情報をセット"""
    logger.debug("fixture:authed_client")

    if pytest.USER_DICT:
        # すでに１度ユーザー登録している場合は、過去に登録したレコードを再登録する
        _insert_user(db, user_dict=pytest.USER_DICT)
        logger.debug("already user created. restore user.")
        client.headers = {"authorization": f"Bearer {pytest.ACCESS_TOKEN}"}
        return client

    # ユーザー登録
    res = await client.post(
        "/users",
        json=TEST_USER_CREATE_SCHEMA.dict(),
    )
    assert res.status_code == status.HTTP_200_OK

    # ログインしてアクセストークンを取得
    res = await client.post(
        "/auth/login",
        data={
            "username": settings.TEST_USER_EMAIL,
            "password": settings.TEST_USER_PASSWORD,
        },
    )
    assert res.status_code == status.HTTP_200_OK
    access_token = res.json().get("access_token")
    client.headers = {"authorization": f"Bearer {access_token}"}
    pytest.ACCESS_TOKEN = access_token

    # 登録したユーザーIDを取得
    res = await client.get("users/me")
    assert res.json().get("id")
    pytest.USER_ID = res.json().get("id")

    # ユーザーレコードを丸ごと取得して、次回以降のテストを高速化する
    stmt = select(User).where(User.id == res.json().get("id"))
    user = (await db.execute(stmt)).scalars().first()
    pytest.USER_DICT = user.__dict__.copy()

    return client


@pytest.fixture(autouse=True)
def mock_google_auth():
    """Google認証をモック化するフィクスチャ"""
    mock_credentials = MagicMock(spec=service_account.Credentials)
    mock_credentials.project_id = "test-project"
    def mock_default_creds(*args, **kwargs):
        return mock_credentials, "test-project"
    with patch('google.auth.default', mock_default_creds):
        with patch('google.cloud.storage.Client') as mock_storage:
            with patch('google.cloud.discoveryengine_v1alpha.ConversationalSearchServiceClient') as mock_search:
                mock_storage.return_value = MagicMock()
                mock_search.return_value = MagicMock()
                yield
