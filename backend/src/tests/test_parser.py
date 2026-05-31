from pathlib import Path

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures" / "parser"


@pytest.mark.parametrize(
    "fixture_name, title",
    [
        ("og_title.html", "Different Worlds"),
        ("twitter_title.html", "What the humans like is responsiveness"),
        ("title_tag.html", "Why Cryonics Makes Sense"),
        ("h1_fallback.html", "The Lesson to Unlearn"),
    ],
)
def test_parse_title(auth_client, monkeypatch, fixture_name, title):
    html = (FIXTURES_DIR / fixture_name).read_text(encoding="utf-8")
    monkeypatch.setattr("app.blueprints.articles.get_document", lambda _url: html)

    res = auth_client.post("/articles/metadata", json={"name": "https://example.com"})
    assert res.status_code == 200
    json = res.get_json()
    assert json["title"] == title
