import requests
from bs4 import BeautifulSoup
from bs4.element import Tag


def get_document(url: str) -> BeautifulSoup:
    headers = {"User-Agent": "ArticleManager/1.0"}
    res = requests.get(url, headers=headers, timeout=10)
    res.raise_for_status()
    return BeautifulSoup(res.text, "html.parser")


def extract_text(tag: Tag | None, location: str) -> str | None:
    if not tag:
        return ""
    if location == "content":
        content = tag.get("content")
        if content and isinstance(content, str):
            return content
        return ""
    if location == "datetime":
        datetime_value = tag.get("datetime")
        if datetime_value and isinstance(datetime_value, str):
            return datetime_value
        return ""
    return tag.get_text()


def clean_text(text: str | None) -> str:
    if not text:
        return ""
    return text.strip()


def get_title(html_doc: BeautifulSoup) -> str:
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
        tag = html_doc.find(candidate["name"], **candidate.get("kwargs", {}))
        text = extract_text(tag, candidate["location"])
        title = clean_text(text)
        if title:
            return title

    return ""


def get_author(html_doc: BeautifulSoup) -> str:
    candidates = [
        {
            "name": "meta",
            "kwargs": {"attrs": {"name": "author"}},
            "location": "content",
        },
        {
            "name": "meta",
            "kwargs": {"property": "article:author"},
            "location": "content",
        },
        {"name": True, "kwargs": {"attrs": {"rel": "author"}}, "location": "text"},
        {"name": True, "kwargs": {"attrs": {"class": "author"}}, "location": "text"},
        {"name": True, "kwargs": {"attrs": {"class": "byline"}}, "location": "text"},
    ]

    for candidate in candidates:
        tag = html_doc.find(candidate["name"], **candidate.get("kwargs", {}))
        text = extract_text(tag, candidate["location"])
        title = clean_text(text)
        if title:
            return title

    return ""


def get_date(html_doc: BeautifulSoup) -> str:
    candidates = [
        {
            "name": "meta",
            "kwargs": {"property": "article:published_time"},
            "location": "content",
        },
        {"name": "meta", "kwargs": {"attrs": {"name": "date"}}, "location": "content"},
        {
            "name": "meta",
            "kwargs": {"attrs": {"name": "pubdate"}},
            "location": "content",
        },
        {
            "name": "meta",
            "kwargs": {"attrs": {"name": "publish_date"}},
            "location": "content",
        },
        {
            "name": "meta",
            "kwargs": {"attrs": {"name": "publication_date"}},
            "location": "content",
        },
        {
            "name": "meta",
            "kwargs": {"attrs": {"itemprop": "datePublished"}},
            "location": "content",
        },
        {
            "name": "time",
            "kwargs": {"attrs": {"datetime": True}},
            "location": "datetime",
        },
        {"name": "time", "location": "text"},
    ]

    for candidate in candidates:
        tag = html_doc.find(candidate["name"], **candidate.get("kwargs", {}))
        text = extract_text(tag, candidate["location"])
        title = clean_text(text)
        if title:
            return title

    return ""
