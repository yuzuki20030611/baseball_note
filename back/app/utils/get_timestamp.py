from datetime import datetime


def get_timestamp() -> str:
    now = datetime.now()
    return now.strftime('%Y%m%d_%H%M%S') + f'_{now.microsecond:06d}'
