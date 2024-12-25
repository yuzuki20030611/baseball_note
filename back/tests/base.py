from typing import Any
from uuid import UUID

from httpx import AsyncClient
from starlette import status

from tests.testing_utils import assert_dict_part


async def assert_create(
    uri: str,
    client: AsyncClient,
    data_in: dict[str, Any],
    expected_status: int,
    expected_data: dict[str, Any] | None,
    files: dict | None = None,
) -> None:
    if files:
        res = await client.post(uri, data=data_in, files=files)
    else:
        res = await client.post(uri, json=data_in)
    assert res.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        res_data = res.json()
        assert_dict_part(res_data, expected_data)
        return res_data


async def assert_multiple_create(
    uri: str,
    client: AsyncClient,
    data_in: list[dict[str, Any]],
    expected_status: int,
    expected_data: list[dict[str, Any]] | None,
) -> None:
    response = await client.post(uri, json=data_in)
    assert response.status_code == expected_status
    if expected_data:
        response_data = response.json()
        assert all(
            all(item[k] == v for k, v in expected.items())
            for item, expected in zip(response_data, expected_data)
        )


async def assert_bulk_create(
    uri: str,
    client: AsyncClient,
    data_in: list[dict[str, Any]],
    expected_status: int,
    expected_data: list[dict[str, Any]] | None,
) -> None:
    res = await client.post(uri, json=data_in)
    assert res.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        res_data = res.json()
        assert isinstance(res_data, list)
        for item, expected_item in zip(res_data, expected_data):
            assert_dict_part(item, expected_item)


async def assert_update(
    uri: str,
    client: AsyncClient,
    id: UUID,
    data_in: dict[str, Any],
    expected_status: int,
    expected_data: dict[str, Any] | None,
    files: dict | None = None,
) -> None:
    if files:
        res = await client.patch(
            f"{uri}/{id}",
            data=data_in,
            files=files,
            params={"exclude_unset": "true"}
        )
    else:
        res = await client.patch(
            f"{uri}/{id}",
            json=data_in,
            params={"exclude_unset": "true"}
        )
    assert res.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        res_data = res.json()
        assert_dict_part(res_data, expected_data)


async def assert_get_all(
    uri: str,
    client: AsyncClient,
    expected_status: int,
    expected_data: list[dict[str, Any]] | None,
    params: dict | None = None,
) -> None:
    res = await client.get(uri, params=params)
    assert res.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        res_data = res.json()
        assert isinstance(res_data, list)
        for item, expected_item in zip(res_data, expected_data):
            assert_dict_part(item, expected_item)


async def assert_get_by_id(
    uri: str,
    client: AsyncClient,
    id: UUID,
    expected_status: int,
    expected_data: dict[str, Any] | None,
) -> None:
    res = await client.get(f"{uri}/{id}")
    assert res.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        res_data = res.json()
        assert_dict_part(res_data, expected_data)


async def assert_get_paged_list(
    uri: str,
    client: AsyncClient,
    params: dict[str, Any],
    expected_status: int,
    expected_first_data: dict[str, Any],
    expected_paging_meta: dict[str, Any],
) -> None:
    res = await client.get(uri, params=params)
    print(res.json())
    assert res.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        res_data = res.json()
        assert res_data["data"]
        assert_dict_part(res_data["data"][0], expected_first_data)
        assert_dict_part(res_data["meta"], expected_paging_meta)


async def assert_soft_delete(
    uri: str,
    client: AsyncClient,
    id: UUID,
    expected_status: int,
    expected_error: dict[str, Any] | None = None,
) -> None:
    res = await client.delete(f"{uri}/{id}")
    assert res.status_code == expected_status
    if expected_error:
        assert res.json() == expected_error
