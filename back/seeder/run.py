import logging
from pathlib import Path
import fire
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemyseed import Seeder, load_entities_from_json
from app.core import database
from app.core.config import settings
from app.core.logger.logger import init_logger


logger = logging.getLogger(__name__)


def drop_all_tables() -> None:
    database.drop_all_tables()

def convert_uuids(data: list) -> list:
    """
    指定されたシードデータ内のUUIDフィールドを適切なUUID型に変換する
    """
    for entity in data:
        for key, value in entity.items():
            if isinstance(value, str) and len(value) == 36:
                try:
                    entity[key] = UUID(value)
                except ValueError:
                    pass
    return data

def import_seed() -> None:
    logger.info("start: import_seed")
    seeds_dir = Path(__file__).parent / "seeds_json"
    seeds_json_files = list(seeds_dir.glob("*.json"))
    db: Session = database.session_factory()
    try:
        entities = []
        for file in seeds_json_files:
            logger.info(f"load seed file={file!s}")
            entity = load_entities_from_json(str(file))
            if entity is None:
                logger.error(f"Failed to load entities from {file!s}")
                continue
            entity['data'] = convert_uuids(entity['data'])
            entities.append(entity)

        seeder = Seeder(db)
        seeder.seed(entities)
        db.commit()
        logger.info("end: seeds import completed")
    except Exception as e:
        db.rollback()
        logger.error(f"end: seeds import failed. detail={e}")


if __name__ == "__main__":
    init_logger(settings.LOGGER_CONFIG_PATH)
    fire.Fire()
