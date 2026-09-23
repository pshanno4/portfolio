#!/usr/bin/env python3
"""Import authorized, public-facing Workinman articles as structured text.

Paul Shannon has permission from Workinman Interactive to reproduce his
public-facing, non-confidential articles in his portfolio. The generated
records deliberately retain Workinman Interactive as the original publisher
and identify Paul Shannon as the author in the site generator.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "content" / "articles"

ARTICLES = {
    "5-tips-for-gamifying-boring-apps": "https://workinman.com/5-tips-for-gamifying-boring-apps/",
    "digital-board-games": "https://workinman.com/digital-board-games/",
    "games-for-brands": "https://workinman.com/games-for-brands/",
    "noovie-trivia-app": "https://workinman.com/noovie-trivia-app/",
    "museums-relevant-with-digital-exhibits": "https://workinman.com/museums-relevant-with-digital-exhibits/",
    "trade-show-booth-gamification": "https://workinman.com/trade-show-booth-gamification/",
    "noovie-trivia-levels-up": "https://workinman.com/noovie-trivia-levels-up/",
}


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def download(url: str) -> bytes:
    return subprocess.run(
        [
            "curl",
            "--location",
            "--fail",
            "--silent",
            "--show-error",
            "--max-time",
            "45",
            url,
        ],
        check=True,
        capture_output=True,
    ).stdout


def extract_blocks(markup: bytes) -> list[dict[str, str]]:
    document = html.fromstring(markup)
    containers = document.xpath(
        '//div[contains(concat(" ", normalize-space(@class), " "), " post_content ")]'
    )
    if len(containers) != 1:
        raise RuntimeError(f"Expected one Workinman post body; found {len(containers)}")

    elements = containers[0].xpath(
        ".//*[self::h2 or self::h3 or self::h4 or self::p or self::li or self::blockquote]"
    )
    blocks: list[dict[str, str]] = []
    selected_tags = {"h2", "h3", "h4", "p", "li", "blockquote"}

    for element in elements:
        # A blockquote or list item can contain a paragraph. Keep the outer
        # semantic block once instead of duplicating its text.
        if any(ancestor.tag in selected_tags for ancestor in element.iterancestors() if ancestor is not containers[0]):
            continue
        text = clean_text(element.text_content())
        if not text:
            continue
        block_type = {
            "h2": "h2",
            "h3": "h3",
            "h4": "h3",
            "li": "li",
            "blockquote": "blockquote",
        }.get(element.tag, "p")
        blocks.append({"type": block_type, "text": text})

    return blocks


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for article_id, url in ARTICLES.items():
        blocks = extract_blocks(download(url))
        word_count = sum(
            len(block["text"].split())
            for block in blocks
            if block["type"] not in {"h2", "h3"}
        )
        # Product-update articles can be brief while still complete. Guard
        # against a failed selector without rejecting a legitimate short post.
        if len(blocks) < 5 or word_count < 300:
            raise RuntimeError(
                f"{article_id} extraction looks incomplete: {len(blocks)} blocks, {word_count} words"
            )

        record = {
            "id": article_id,
            "source": "Workinman Interactive",
            "sourceUrl": url,
            "reproduction": "authorized-client-portfolio-edition",
            "wordCount": word_count,
            "blocks": blocks,
        }
        target = OUTPUT / f"{article_id}.json"
        target.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Imported {article_id}: {word_count} words in {len(blocks)} blocks")


if __name__ == "__main__":
    main()
