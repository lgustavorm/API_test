import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db import create_db_and_tables


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # use separate sqlite file for tests
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    create_db_and_tables()
    yield
    try:
        os.remove("test.db")
    except FileNotFoundError:
        pass


def get_client():
    return TestClient(app)


def test_register_and_login_and_crud():
    c = get_client()

    # register
    r = c.post("/api/v1/auth/register", json={"email": "a@a.com", "password": "x"})
    assert r.status_code == 201
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # login
    r = c.post(
        "/api/v1/auth/login",
        data={"username": "a@a.com", "password": "x"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200

    # create item
    r = c.post("/api/v1/items/", json={"title": "one", "description": "d"}, headers=headers)
    assert r.status_code == 201
    item_id = r.json()["id"]

    # list items
    r = c.get("/api/v1/items/", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1

    # get item
    r = c.get(f"/api/v1/items/{item_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["title"] == "one"

    # update item
    r = c.put(f"/api/v1/items/{item_id}", json={"title": "two"}, headers=headers)
    assert r.status_code == 200
    assert r.json()["title"] == "two"

    # delete item
    r = c.delete(f"/api/v1/items/{item_id}", headers=headers)
    assert r.status_code == 204

    # not found after delete
    r = c.get(f"/api/v1/items/{item_id}", headers=headers)
    assert r.status_code == 404
