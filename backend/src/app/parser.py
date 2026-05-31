import requests
from bs4 import BeautifulSoup
from bs4.element import Tag


def get_document(url: str) -> str:
    headers = {"User-Agent": "ArticleManager/1.0"}
    res = requests.get(url, headers=headers, timeout=10)
    res.raise_for_status()
    return res.text


def extract_text(tag: Tag | None, location: str) -> str | None:
    if not tag:
        return ""
    if location == "content":
        content = tag.get("content")
        if content and isinstance(content, str):
            return content
        return ""
    return tag.get_text()


def clean_text(text: str | None) -> str:
    if not text:
        return ""
    return text.strip()


def get_title(html_doc: str) -> str:
    soup = BeautifulSoup(html_doc, "html.parser")

    candidates = [
        {"name": "meta", "kwargs": {"property": "og:title"}, "location": "content"},
        {
            "name": "meta",
            "kwargs": {"attrs": {"name": "twitter:title"}},
            "location": "content",
        },
        {"name": "title", "location": "text"},
        {"name": "h1", "location": "text"},
    ]

    for candidate in candidates:
        tag = soup.find(candidate["name"], **candidate.get("kwargs", {}))
        text = extract_text(tag, candidate["location"])
        title = clean_text(text)
        if title:
            return title

    return ""
