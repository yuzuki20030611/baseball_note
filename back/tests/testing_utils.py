from typing import Any, List
from sqlalchemy.orm import Session
from uuid import UUID


def assert_dict_part(
    result_dict: dict[Any, Any],
    expected_dict: dict[Any, Any],
    exclude_fields: list[str] | None = None,
    expected_delete: bool = False,
) -> None:
    """dictの部分一致でのassertion

    expected_dictに指定したkeyのみをチェックする

    Args:
        result_dict: チェック対象のdict
        expected_dict: 期待値のdict
        exclude_fields: チェック対象から除外するfieldのlist
        expected_delete: Trueの場合、削除済データを取得する場合は、deleted_atにデータが存在することのみをチェックする
    """
    _exclude_fields = exclude_fields or []
    if expected_delete:
        assert result_dict.get("deleted_at") or result_dict.get("deletedAt")
        _exclude_fields.extend(["deleted_at", "deletedAt"])

    for key, value in expected_dict.items():
        if key in _exclude_fields:
            continue
        assert key in result_dict, f"Key {key} not found in result_dict"
        result_value = result_dict[key]

        if isinstance(value, dict):
            # dictの場合は再帰的に部分一致チェック
            assert_dict_part(result_value, value, exclude_fields)
        elif isinstance(value, list):
            # リストの処理
            assert isinstance(result_value, list), f"key={key} should be a list"
            assert len(result_value) == len(value), f"key={key} length mismatch. result={len(result_value)}, expected={len(value)}"
            # 期待値の各要素について、マッチする結果が存在するかチェック
            for expected_item in value:
                if not isinstance(expected_item, dict):
                    assert expected_item in result_value, f"Value {expected_item} not found in {result_value}"
                    continue

                # dictの場合の処理
                match_found = False
                for result_item in result_value:
                    try:
                        assert_dict_part(result_item, expected_item)
                        match_found = True
                        break
                    except AssertionError:
                        continue
                assert match_found, f"No matching item found for expected: {expected_item}"
        else:
            # 通常の値の比較
            assert result_value == value, f"key={key}. result_value={result_value}. expected_value={value}"


def assert_is_deleted(result_dict: dict[Any, Any]) -> None:
    assert result_dict.get("deleted_at")


def assert_successful_status_code(status_code: int) -> None:
    assert 300 > status_code >= 200, f"status_code={status_code}. expected: 300 > status_code >= 200"


def assert_failed_status_code(status_code: int) -> None:
    assert not (300 > status_code >= 200), f"status_code={status_code}. expected: not(300 > status_code >= 200)"


def assert_crud_model(result_obj: Any, expected_obj: Any, exclude_fileds: list[str] | None = None) -> None:
    """sqlalchemy-modelのassertion"""
    expected_dict = expected_obj.__dict__.copy()
    del expected_dict["_sa_instance_state"]
    _exclude_fileds = exclude_fileds or []
    for key, value in expected_dict.items():
        if key in _exclude_fileds:
            continue
        assert (
            getattr(result_obj, key) == value
        ), f"{key=}, result_value={getattr(result_obj, key)}, expected_value={value}"


def assert_api_error(result_error: Any, expected_error: Any) -> None:
    assert result_error.detail["error_code"] == expected_error.detail["error_code"]


async def insert_data(db: Session, model: Any, data: List[dict]) -> None:
    instances = [model(**item) for item in data]
    db.add_all(instances)
    await db.commit()


def generate_uuid_str(base_uuid, i):
    uuid_str = str(base_uuid)[:-1] + hex(i)[-1]
    return uuid_str


def generate_uuid(base_uuid, i):
    return UUID(generate_uuid_str(base_uuid, i))


def cycle_list_items(items: list, count: int) -> list:
    """リストの要素をcount回繰り返して新しいリストを生成する"""
    return [items[i % len(items)] for i in range(count)]
