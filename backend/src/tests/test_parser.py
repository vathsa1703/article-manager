from pathlib import Path
from types import SimpleNamespace

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures" / "parser"


@pytest.mark.parametrize(
    "fixture_name, title, author",
    [
        ("og_title.html", "Different Worlds", "Scott Alexander"),
        (
            "twitter_title.html",
            "What the humans like is responsiveness",
            "Sasha Chapin",
        ),
        ("title_tag.html", "Why Cryonics Makes Sense", "Tim Urban"),
        ("h1_fallback.html", "The Lesson to Unlearn", "Paul Graham"),
    ],
)
def test_parse_title(auth_client, monkeypatch, fixture_name, title, author):
    html = (FIXTURES_DIR / fixture_name).read_text(encoding="utf-8")
    response = SimpleNamespace(text=html, raise_for_status=lambda: None)
    monkeypatch.setattr("app.parser.requests.get", lambda *args, **kwargs: response)

    res = auth_client.post("/articles/metadata", json={"name": "https://example.com"})
    assert res.status_code == 200
    json = res.get_json()
    assert json["title"] == title
    assert json["author"] == author
