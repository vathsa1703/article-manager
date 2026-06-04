import re
from typing import Any

import requests
from bs4 import BeautifulSoup
from bs4.element import Tag

type Candidate = dict[str, Any]


class MetadataParser:
    def __init__(self, url: str):
        self.url = url
        self.doc: BeautifulSoup | None = None
        self.title = ""
        self.author = ""
        self.date = ""
        self.text = ""

    def parse(self):
        self.get_document(self.url)
        self.get_title()
        self.get_author()
        self.get_date()
        self.get_text()

    @staticmethod
    def get_attribute(
        candidates: list[Candidate], html_doc: BeautifulSoup | None
    ) -> str:
        if not html_doc:
            return ""
        for candidate in candidates:
            tag = html_doc.find(candidate["name"], **candidate.get("kwargs", {}))
            text = MetadataParser.extract_text(tag, candidate["location"])
            element = MetadataParser.clean_text(text)
            if element:
                return element
        return ""

    @staticmethod
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

    @staticmethod
    def clean_text(text: str | None) -> str:
        if not text:
            return ""
        return text.strip()

    def get_document(self, url: str) -> None:
        headers = {"User-Agent": "ArticleManager/1.0"}
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        self.doc = BeautifulSoup(res.text, "html.parser")

    def get_title(self) -> None:
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
        self.title = MetadataParser.get_attribute(candidates, self.doc)

    def get_author(self) -> None:
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
            {
                "name": True,
                "kwargs": {"attrs": {"class": "author"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"class": "byline"}},
                "location": "text",
            },
        ]
        self.author = self.get_attribute(candidates, self.doc)

    def get_date(self) -> None:
        candidates = [
            {
                "name": "meta",
                "kwargs": {"property": "article:published_time"},
                "location": "content",
            },
            {
                "name": "meta",
                "kwargs": {"attrs": {"name": "date"}},
                "location": "content",
            },
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
        self.date = self.get_attribute(candidates, self.doc)

    def get_text(self) -> None:
        candidates = [
            {
                "name": "article",
                "location": "text",
            },
            {
                "name": "main",
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"class": "article-content"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {
                    "attrs": {"class": re.compile(r"(?:^|-)postcontent$|post-content")}
                },
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"class": "entry-content"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"class": "content"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"class": "article-body"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"class": "post-body"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"id": "article"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"id": "content"}},
                "location": "text",
            },
            {
                "name": True,
                "kwargs": {"attrs": {"id": "main-content"}},
                "location": "text",
            },
        ]
        self.text = self.get_attribute(candidates, self.doc)
