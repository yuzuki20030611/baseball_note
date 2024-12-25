from tests.testing_utils import insert_data, generate_uuid, cycle_list_items
from app import models
from sqlalchemy.orm import Session
import datetime
from uuid import UUID


now = datetime.datetime.now(tz=datetime.timezone.utc)
DEFAULT_BUFFER_SIZE = 10
base_uuids = {
    "example": UUID("e570f1ee-6c54-4b01-90e6-d701718f0150"),
}
