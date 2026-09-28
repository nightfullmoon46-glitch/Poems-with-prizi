import json
import re
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET
import pymupdf as fitz

ROOT = Path(__file__).resolve().parent
POEM_TITLES = [
    ("IN THE RAIN, WITHOUT YOU", "", "Heartbreak"),
    ("A Thousand Unsent Messages", "", "Longing"),
    ("I See You\U0001f97a", "The Monster Inside Me", "Tender"),
    ("A scar we both feel", "Scars that cannot be seen but only be felt.", "Healing"),
    ("If Time Could Stay", "Time: A fortune to pay", "Reflective"),
    ("If I Pushed You Away", "I got everything I wanted", "Understanding"),
    ("I Chose You", "Until Not Affected", "Love"),
    ("Maybe We Are The Same", "Loneliness: An epitome of Mistakes", "Empathy"),
    ("I loved till I was unable to love like that", "", "Devotion"),
    ("A Coward Called Love", "", "Longing"),
]
EXTRA_SECTIONS = {
    "A Page I Didn\u2019t Plan To Write",
    "A Letter",
    "A Note Before You Close This",
}


def poem_data():
    source = ROOT / "poems file.docx"
    with zipfile.ZipFile(source) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    paragraphs = [
        "".join(node.text or "" for node in item.findall(".//w:t", ns)).replace("\xa0", " ").strip()
        for item in document.findall(".//w:p", ns)
    ]
    starts = [paragraphs.index(title) for title, _, _ in POEM_TITLES]
    result = []
    for index, (title, subtitle, mood) in enumerate(POEM_TITLES):
        start = starts[index]
        end = starts[index + 1] if index + 1 < len(starts) else len(paragraphs)
        body = re.sub(r"\n{3,}", "\n\n", "\n".join(paragraphs[start + 1:end])).strip()
        lines = [line for line in body.splitlines() if line.strip()]
        result.append({
            "id": re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-"),
            "title": title,
            "subtitle": subtitle,
            "mood": mood,
            "excerpt": "\n".join(lines[:3]),
            "body": body,
        })
    return result


def story_data():
    source = ROOT / "TIK TIK TIK.pdf"
    document = fitz.open(source)
    paragraphs = []
    for page in document[4:108]:
        lines = []
        for block in page.get_text("dict")["blocks"]:
            if block.get("type") != 0:
                continue
            for line in block["lines"]:
                text = "".join(span["text"] for span in line["spans"]).strip()
                if text and not re.fullmatch(r"\d+", text):
                    lines.append((line["bbox"][1], line["bbox"][3], text))
        lines.sort(key=lambda line: line[0])

        current = []
        previous_bottom = None
        for top, bottom, text in lines:
            if current and top - previous_bottom > 8:
                paragraphs.append(" ".join(current))
                current = []
            current.append(text)
            previous_bottom = bottom
        if current:
            paragraphs.append(" ".join(current))

    chapter_heading = re.compile(r"^Chapter\s+(\d+):\s*(.+?)(?:\s+\(([^()]*)\))?$")
    headings = ["The Night Begins", *sorted(EXTRA_SECTIONS)]
    starts = []
    for index, paragraph in enumerate(paragraphs):
        match = chapter_heading.match(paragraph)
        if match:
            starts.append((index, paragraph, match, ""))
            continue
        heading = next((item for item in headings if paragraph == item or paragraph.startswith(item + " ")), None)
        if heading:
            remainder = paragraph[len(heading):].strip()
            starts.append((index, heading, None, remainder))

    sections = []
    for item, (start, heading, match, remainder) in enumerate(starts):
        end = starts[item + 1][0] if item + 1 < len(starts) else len(paragraphs)
        content = ([remainder] if remainder else []) + paragraphs[start + 1:end]
        subtitle = ""
        if match and match.group(3):
            subtitle = match.group(3)
        if content and content[0].startswith("(") and content[0].endswith(")"):
            subtitle = subtitle or content[0][1:-1]
            content.pop(0)
        if match:
            number = int(match.group(1))
            title = f"Chapter {number}: {match.group(2)}"
            kind = "Chapter"
        else:
            title = heading
            kind = "Opening" if heading == "The Night Begins" else "Afterword"
        sections.append({
            "title": title,
            "subtitle": subtitle,
            "kind": kind,
            "body": "\n\n".join(content),
        })

    if len([part for part in sections if part["kind"] == "Chapter"]) != 31:
        raise ValueError("Expected all 31 numbered chapters in the story PDF.")
    if len(sections) != 35:
        raise ValueError(f"Expected 35 narrative sections; found {len(sections)}.")

    dedication_lines = [line.strip() for line in document[1].get_text().splitlines() if line.strip()]
    dedication_start = dedication_lines.index("For my Moon.")
    dedication = {
        "title": "For my Moon.",
        "subtitle": "Dedication",
        "kind": "Dedication",
        "body": "\n".join(dedication_lines[dedication_start + 1:]),
    }
    back_cover = {
        "title": "Back cover",
        "subtitle": "",
        "kind": "Back cover",
        "body": "\n".join(line.strip() for line in document[108].get_text().splitlines() if line.strip()),
    }
    sections = [dedication, *sections, back_cover]

    return {
        "id": "tik-tik-tik",
        "title": "Tik. Tik. Tik.",
        "subtitle": "A love that refused to be silent",
        "mood": "A love that refused to be silent",
        "excerpt": "One night. One watch. Thirty-one thoughts. One name. Always.",
        "wordCount": sum(len((section["title"] + " " + section["subtitle"] + " " + section["body"]).split()) for section in sections),
        "sections": sections,
    }


data = {"poems": poem_data(), "stories": [story_data()]}
output = ROOT / "literature.js"
output.write_text("window.PRIZI_LITERATURE = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
print(f"Wrote {output.name}: {len(data['poems'])} poems, {len(data['stories'][0]['sections'])} story sections, {data['stories'][0]['wordCount']} story words.")
