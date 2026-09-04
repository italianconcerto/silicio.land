#!/usr/bin/env python3
"""Download a small, licensed computer-humor reference library from Wikimedia Commons."""

from __future__ import annotations

import json
import re
import unicodedata
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/meme-library"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "silicio.land asset research/1.0 (https://silicio.land)"

TITLES = [
    'File:IL FAIT UN "BACKUP" ! - HE MAKES A "BACKUP" ! (2803018812).jpg',
    'File:INFORMATIQUE "Crash dump" ! (3910150268).jpg',
    "File:COMPRESSION DES FICHIERS-COMPRESSION OF FILES (2710084992).jpg",
    "File:ME FEED MONARCH (cropped).jpg",
    "File:THE REPAIRER- LE REPARATEUR... (2703291441).jpg",
    "File:Cat Sleeping on Keyboard.jpg",
    "File:Cat using computer.jpg",
    "File:Charlie the pink cat studies a spreadsheet.jpg",
    "File:Computer Cat Nap.jpg",
    "File:Computer-kitten.jpg",
    "File:You shall not work.jpg",
    "File:Analogrechner (30294894355) (cropped).jpg",
    "File:Hackathon NYC 114 (17171709507).jpg",
    "File:Manga-like figure displayed on the screen of an analog oscilloscope via a hardware hack (cropped).jpg",
    "File:Ocilloscope Tetris.jpg",
    "File:Trojan Room coffee pot xcoffee.png",
    "File:TuringBombeBletchleyPark.jpg",
    "File:WiFi beer antenna.jpg",
]


def plain(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", value or ""))).strip()


def slug(title: str) -> str:
    name = title.removeprefix("File:")
    stem, dot, suffix = name.rpartition(".")
    normalized = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode()
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
    return f"{normalized[:72]}.{suffix.lower() if dot else 'jpg'}"


def get_json(parameters: dict[str, str]) -> dict:
    url = f"{API}?{urllib.parse.urlencode(parameters)}"
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    data = get_json({
        "action": "query",
        "format": "json",
        "prop": "imageinfo",
        "iiprop": "url|mime|extmetadata",
        "iiurlwidth": "1400",
        "titles": "|".join(TITLES),
    })

    assets = []
    for page in sorted(data["query"]["pages"].values(), key=lambda item: item.get("title", "")):
        if "imageinfo" not in page:
            continue
        info = page["imageinfo"][0]
        metadata = info.get("extmetadata", {})
        value = lambda key: plain(metadata.get(key, {}).get("value", ""))
        filename = slug(page["title"])
        source_url = info.get("thumburl") or info["url"]
        request = urllib.request.Request(source_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(request, timeout=60) as response:
            (OUTPUT / filename).write_bytes(response.read())
        assets.append({
            "file": filename,
            "title": page["title"].removeprefix("File:"),
            "creator": value("Artist") or "See source page",
            "license": value("LicenseShortName") or value("UsageTerms"),
            "license_url": value("LicenseUrl"),
            "source_page": info["descriptionurl"],
            "original_file": info["url"],
        })

    (OUTPUT / "manifest.json").write_text(json.dumps(assets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Meme and computer-humor image library",
        "",
        "Local reference set downloaded from Wikimedia Commons. Check this file before publishing an image; preserve its attribution and license link.",
        "",
    ]
    for asset in assets:
        creator = asset["creator"].replace("|", "\\|")
        lines.extend([
            f"## {asset['title']}",
            "",
            f"- Local file: `{asset['file']}`",
            f"- Creator: {creator}",
            f"- License: [{asset['license']}]({asset['license_url']})" if asset["license_url"] else f"- License: {asset['license']}",
            f"- Source: {asset['source_page']}",
            "",
        ])
    (OUTPUT / "ATTRIBUTION.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Downloaded {len(assets)} images to {OUTPUT}")


if __name__ == "__main__":
    main()
