from tests.conftest import get_cookie_value, get_csrf_header


def test_register(client):
    res = client.post("/auth/register", json={"name": "Test", "password": "Test"})
    assert res.status_code == 201
    assert get_cookie_value(res, "access_token_cookie")
    assert get_cookie_value(res, "refresh_token_cookie")
    assert get_cookie_value(res, "csrf_access_token")
    assert get_cookie_value(res, "csrf_refresh_token")


def test_login(client):
    client.post("/auth/register", json={"name": "Test", "password": "Test"})
    res = client.post("/auth/login", json={"name": "Test", "password": "Test"})
    assert res.status_code == 200
    assert get_cookie_value(res, "access_token_cookie")
    assert get_cookie_value(res, "refresh_token_cookie")
    assert get_cookie_value(res, "csrf_access_token")
    assert get_cookie_value(res, "csrf_refresh_token")


def test_refresh(client):
    res = client.post("/auth/register", json={"name": "Test", "password": "Test"})
    headers = get_csrf_header(res, "refresh")
    res = client.post("/auth/refresh", headers=headers)
    assert res.status_code == 200
    assert get_cookie_value(res, "access_token_cookie")
    assert get_cookie_value(res, "csrf_access_token")


def test_logout(auth_client):
    res = auth_client.post("/auth/logout")
    assert res.status_code == 200
    assert not get_cookie_value(res, "access_token_cookie")
    assert not get_cookie_value(res, "csrf_access_token")


def test_method_not_allowed(client):
    res = client.get("/auth/register")
    assert res.status_code == 405
