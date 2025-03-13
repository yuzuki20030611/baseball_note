from passlib.context import CryptContext
import uuid
import json
from pathlib import Path

# 'schemas' から 'schemes' に修正
# パスワードハッシュ化とパスワード検証機能
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def generate_single_user_seed():
    user_data = {
        "model": "app.models.base.Users",
        "data": [{
            "id": str(uuid.uuid4()),
            "email": "test_player@example.com",
            "password": get_password_hash("password123"),
            "role": 0  # PLAYER role
        }]
    }

    seeds_dir = Path(__file__).parent / "seeds_json"
    seeds_dir.mkdir(exist_ok=True)

    with open(seeds_dir / "users.json", 'w') as f:
        json.dump(user_data, f, indent=4)

if __name__ == "__main__":
    generate_single_user_seed()
