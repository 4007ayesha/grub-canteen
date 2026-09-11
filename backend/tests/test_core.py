from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_register_and_login():
    client.post(
        "/auth/register",
        json={
            "name": "Test Student",
            "email": "teststudent@x.com",
            "password": "pass123",
            "role": "student",
        },
    )

    res = client.post(
        "/auth/login",
        json={
            "email": "teststudent@x.com",
            "password": "pass123",
        },
    )

    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password():
    res = client.post(
        "/auth/login",
        json={
            "email": "teststudent@x.com",
            "password": "wrongpass",
        },
    )

    assert res.status_code == 401


def test_menu_list_public():
    res = client.get("/menu/items")

    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_admin_route_blocked_for_student():
    login = client.post(
        "/auth/login",
        json={
            "email": "teststudent@x.com",
            "password": "pass123",
        },
    )

    assert login.status_code == 200

    token = login.json()["access_token"]

    res = client.post(
        "/menu/items",
        json={
            "name": "Hack Item",
            "price": 10,
            "category_id": 1,
        },
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert res.status_code == 403