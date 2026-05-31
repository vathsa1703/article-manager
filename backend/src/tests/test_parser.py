import pytest


@pytest.mark.parametrize(
    "url, title",
    [
        ("https://slatestarcodex.com/2017/10/02/different-worlds/", "Different Worlds"),
        (
            "https://sashachapin.substack.com/p/what-the-humans-like-is-responsiveness",
            "What the humans like is responsiveness",
        ),
        ("https://waitbutwhy.com/2016/03/cryonics.html", "Why Cryonics Makes Sense"),
        ("https://paulgraham.com/lesson.html", "The Lesson to Unlearn"),
    ],
)
def test_parse_title(auth_client, url, title):
    res = auth_client.post("/articles/metadata", json={"name": url})
    assert res.status_code == 200
    json = res.get_json()
    assert json["title"] == title
