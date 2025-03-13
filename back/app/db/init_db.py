import sys
import os
from pathlib import Path

# プロジェクトルートへのパスを追加
project_root = str(Path(__file__).parents[2].absolute())
sys.path.append(project_root)

from sqlalchemy import create_engine
from app.models.base import Base
from app.core.database import engine, async_engine
from app.core.logger import get_logger
from app.core.config import settings

logger = get_logger(__name__)

def init_db() -> None:
    """
    データベーステーブルを作成する
    """

    temp_engine = create_engine(
        settings.get_database_url(),
        pool_pre_ping=True,
        echo=False,
    )

    try:
        logger.info("データベーステーブルの作成を開始します")
        
        # 開発環境の場合、既存のテーブルを削除（オプション）
        if settings.ENV == "local" and settings.DEBUG:
            from app.core.database import drop_all_tables
            drop_all_tables()
            logger.info("既存のテーブルを削除しました")

        # テーブルの作成
        Base.metadata.create_all(bind=engine)
        logger.info("データベーステーブルを作成しました")

    except Exception as e:
        logger.error(f"テーブル作成中にエラーが発生しました: {str(e)}")
        raise
    finally:
        temp_engine.dispose()
        
async def init_async_db() -> None:
    """
    非同期でデータベーステーブルを作成する
    """
    try:
        logger.info("非同期でデータベーステーブルの作成を開始します")
        
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("データベーステーブルを作成しました（非同期）")

    except Exception as e:
        logger.error(f"テーブル作成中にエラーが発生しました（非同期）: {str(e)}")
        raise
    finally:
        await async_engine.dispose()

if __name__ == "__main__":
    init_db()