#!/usr/bin/env python3
"""
Fetch note RSS and generate HP column pages.

Policy:
- note is the primary article body.
- The HP gets an indexable column listing page.
- Each HP article page gets an original summary, related links, and structured data,
  then links to note for the full body.
"""

from __future__ import annotations

import email.utils
import html
import json
import re
import sys
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from generate_sitemap import generate_sitemap
from xml.etree import ElementTree as ET


NOTE_RSS_URL = "https://note.com/sugita_sakura_nt/rss"
SITE_URL = "https://sugita-sakuraclinic.com"
SITE_NAME = "杉田さくら柔整治療院"
COLUMN_TITLE = "院長のコラム"
MAX_POSTS = 12


@dataclass
class NotePost:
    title: str
    url: str
    slug: str
    published: str
    published_iso: str
    thumbnail: str
    excerpt: str


def text_or_empty(parent: ET.Element, path: str, namespaces: dict[str, str] | None = None) -> str:
    node = parent.find(path, namespaces or {})
    return (node.text or "").strip() if node is not None else ""


def strip_tags(value: str) -> str:
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"</p\s*>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"続きをみる\s*$", "", value).strip()
    return value


def make_slug(url: str) -> str:
    match = re.search(r"/n/([^/?#]+)", url)
    if match:
        return match.group(1)
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "-", url).strip("-")
    return cleaned[-80:] or "note-post"


def format_date(pub_date: str) -> tuple[str, str]:
    parsed = email.utils.parsedate_to_datetime(pub_date)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    local = parsed.astimezone()
    return local.strftime("%Y.%m.%d"), local.date().isoformat()


def fetch_rss(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "sugita-sakura-note-sync/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def parse_posts(xml_bytes: bytes) -> list[NotePost]:
    namespaces = {"media": "http://search.yahoo.com/mrss/"}
    root = ET.fromstring(xml_bytes)
    items = root.findall("./channel/item")
    posts: list[NotePost] = []

    for item in items[:MAX_POSTS]:
        title = text_or_empty(item, "title")
        url = text_or_empty(item, "link")
        pub_date = text_or_empty(item, "pubDate")
        description = text_or_empty(item, "description")
        thumb_node = item.find("media:thumbnail", namespaces)
        thumbnail = thumb_node.text.strip() if thumb_node is not None and thumb_node.text else ""
        if thumb_node is not None and thumb_node.attrib.get("url"):
            thumbnail = thumb_node.attrib["url"].strip()

        if not title or not url or not pub_date:
            continue

        published, published_iso = format_date(pub_date)
        excerpt = strip_tags(description)
        if excerpt.startswith("この記事の著者"):
            excerpt = f"{title}について、杉田さくら柔整治療院の院長がnoteでわかりやすく解説しています。"
        if len(excerpt) > 180:
            excerpt = excerpt[:180].rstrip() + "..."

        posts.append(
            NotePost(
                title=title,
                url=url,
                slug=make_slug(url),
                published=published,
                published_iso=published_iso,
                thumbnail=thumbnail,
                excerpt=excerpt,
            )
        )

    return posts


def page_shell(
    title: str,
    description: str,
    body: str,
    canonical: str,
    robots: str = "index, follow",
    json_ld: dict | None = None,
) -> str:
    escaped_title = html.escape(title)
    escaped_description = html.escape(description)
    escaped_canonical = html.escape(canonical)
    structured_data = ""
    if json_ld:
        structured_data = (
            '  <script type="application/ld+json">'
            + json.dumps(json_ld, ensure_ascii=False, indent=2)
            + "</script>\n"
        )
    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{escaped_description}">
  <meta name="robots" content="{robots}">
  <title>{escaped_title}</title>
  <link rel="canonical" href="{escaped_canonical}">
  <link rel="icon" href="/images/logo.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/css/style.css">
{structured_data}  <meta property="og:type" content="article">
  <meta property="og:site_name" content="{SITE_NAME}">
  <meta property="og:title" content="{escaped_title}">
  <meta property="og:description" content="{escaped_description}">
  <meta property="og:url" content="{escaped_canonical}">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PHF5R7GY8F"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-PHF5R7GY8F');</script>
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){{
        c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    }})(window, document, "clarity", "script", "w8rn6ibpei");
  </script>
  <style>
    .note-column-hero {{ margin-top: var(--header-height); padding: 4rem 1rem 2.5rem; background: linear-gradient(135deg, #fff6f8, #fff); text-align: center; }}
    .note-column-hero h1 {{ margin: 0 0 .75rem; color: #3a2d32; font-size: clamp(1.8rem, 4vw, 2.7rem); }}
    .note-column-hero p {{ margin: 0 auto; max-width: 760px; color: #7a6b70; }}
    .note-column-list {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.4rem; }}
    .note-column-card {{ background: #fff; border: 1px solid #f0e0e3; border-radius: .75rem; overflow: hidden; box-shadow: 0 8px 24px rgba(30, 15, 20, .07); display: flex; flex-direction: column; }}
    .note-column-card img {{ width: 100%; aspect-ratio: 16 / 9; object-fit: contain; background: #fff4f7; }}
    .note-column-card__body {{ padding: 1.2rem; display: flex; flex-direction: column; gap: .7rem; flex: 1; }}
    .note-column-card time {{ color: #9b7c86; font-size: .85rem; }}
    .note-column-card h2 {{ font-size: 1.05rem; line-height: 1.55; margin: 0; color: #3a2d32; }}
    .note-column-card p {{ margin: 0; color: #6f6267; font-size: .92rem; line-height: 1.8; }}
    .note-column-card a {{ margin-top: auto; color: #e85b81; font-weight: 700; }}
    .note-summary {{ max-width: 820px; margin: 0 auto; }}
    .note-summary__image {{ width: 100%; height: auto; object-fit: contain; border-radius: .75rem; margin-bottom: 1.5rem; background: #fff4f7; }}
    .note-summary__date {{ color: #9b7c86; }}
    .note-summary h1 {{ font-size: clamp(1.65rem, 4vw, 2.4rem); line-height: 1.45; color: #3a2d32; }}
    .note-summary__box {{ background: #fff8fb; border-left: 4px solid #e85b81; border-radius: 0 .5rem .5rem 0; padding: 1.4rem; margin: 1.5rem 0; }}
    .note-summary__links {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; margin: 1.5rem 0; }}
    .note-summary__links a {{ display: block; padding: .85rem 1rem; border: 1px solid #f0dfe5; border-radius: .5rem; color: #3a2d32; font-weight: 700; background: #fff; }}
    .note-summary__links a:hover {{ color: #e85b81; border-color: #e85b81; }}
    .note-summary h2 {{ margin: 1.8rem 0 .8rem; color: #3a2d32; font-size: 1.35rem; }}
    .note-summary ul {{ padding-left: 1.2rem; color: #6f6267; line-height: 1.9; }}
    @media (max-width: 900px) {{ .note-column-list {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} }}
    @media (max-width: 640px) {{ .note-column-list, .note-summary__links {{ grid-template-columns: 1fr; }} }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""


def site_header() -> str:
    return """  <header class="header" id="header">
    <div class="header__inner">
      <a href="/" class="header__logo" aria-label="トップへ戻る"><img src="/images/logo.png" alt="杉田さくら柔整治療院ロゴ" class="header__logo-img" width="150" height="150"><span class="header__logo-text"><span class="header__logo-main">杉田さくら柔整治療院</span></span></a>
      <nav class="header__nav" id="nav" aria-label="メインナビゲーション"><ul class="header__nav-list"><li><a href="/" class="header__nav-link">TOP</a></li><li><a href="/about/" class="header__nav-link">当院について</a></li><li><a href="/services/" class="header__nav-link">施術メニュー</a></li><li><a href="/accident/" class="header__nav-link">交通事故治療</a></li><li><a href="/column/" class="header__nav-link active">院長のコラム</a></li><li><a href="/hours/" class="header__nav-link">診療時間</a></li><li><a href="/access/" class="header__nav-link">アクセス</a></li><li><a href="/faq/" class="header__nav-link">よくある質問</a></li></ul></nav>
      <div class="header__actions"><a href="tel:045-353-8852" class="header__tel" aria-label="電話でお問い合わせ"><i class="fas fa-phone-alt"></i><span>045-353-8852</span></a></div>
    </div>
  </header>"""


def site_footer() -> str:
    return """  <footer class="footer"><div class="container"><div class="footer__top"><div class="footer__brand"><div class="footer__logo"><img src="/images/logo.png" alt="杉田さくら柔整治療院ロゴ" class="footer__logo-img" width="150" height="150" loading="lazy" decoding="async"><span class="footer__logo-text"><span class="footer__logo-main">杉田さくら柔整治療院</span></span></div><p class="footer__address">〒235-0033 神奈川県横浜市磯子区杉田1-14-15 エマネート和光1F<br>TEL: <a href="tel:045-353-8852">045-353-8852</a></p></div><div class="footer__nav"><div class="footer__nav-col"><h3 class="footer__nav-title">メニュー</h3><ul><li><a href="/about/">当院について</a></li><li><a href="/services/">施術メニュー</a></li><li><a href="/accident/">交通事故治療</a></li><li><a href="/column/">院長のコラム</a></li></ul></div><div class="footer__nav-col"><h3 class="footer__nav-title">ご案内</h3><ul><li><a href="/hours/">診療時間</a></li><li><a href="/access/">アクセス</a></li><li><a href="/faq/">よくある質問</a></li></ul></div></div></div><div class="footer__bottom"><p class="footer__copy">© 2026 杉田さくら柔整治療院. All Rights Reserved.</p></div></div></footer>
  <script src="/js/main.js"></script>"""


RELATED_LINKS = [
    ("腰痛", "腰痛・ぎっくり腰", "/lumbar-pain/"),
    ("ぎっくり腰", "腰痛・ぎっくり腰", "/lumbar-pain/"),
    ("むちうち", "首痛・寝違え", "/neck-pain/"),
    ("首", "首痛・寝違え", "/neck-pain/"),
    ("肩", "肩こり・四十肩", "/shoulder-pain/"),
    ("膝", "膝の痛み", "/knee-pain/"),
    ("事故", "交通事故治療", "/accident/"),
    ("交通事故", "交通事故治療", "/accident/"),
    ("接骨院", "整形外科・整骨院・整体・鍼灸院の違い", "/clinic-guide/"),
    ("整形外科", "整形外科・整骨院・整体・鍼灸院の違い", "/clinic-guide/"),
    ("整体", "整形外科・整骨院・整体・鍼灸院の違い", "/clinic-guide/"),
]


def related_links(post: NotePost) -> list[tuple[str, str]]:
    haystack = f"{post.title} {post.excerpt}"
    links: list[tuple[str, str]] = []
    seen: set[str] = set()
    for keyword, label, href in RELATED_LINKS:
        if keyword in haystack and href not in seen:
            links.append((label, href))
            seen.add(href)
    if not links:
        links.append(("症状から探す", "/services/#symptom-search"))
        links.append(("施術メニュー", "/services/"))
    return links[:4]


def summary_points(post: NotePost) -> list[str]:
    title = post.title
    points = ["記事テーマの要点と、来院前に確認したい判断材料"]
    if "ぎっくり腰" in title:
        points = ["ぎっくり腰直後に避けたい動き", "冷却・安静・受診相談の目安", "腰痛を繰り返さないための注意点"]
    elif "腰痛" in title:
        points = ["腰痛の原因を見分ける考え方", "放置せず相談したい症状", "整骨院で行う状態確認と施術の方向性"]
    elif "むちうち" in title or "交通事故" in title:
        points = ["事故後に症状が遅れて出る理由", "整形外科と整骨院の役割分担", "自賠責保険で通院する際の確認点"]
    elif "首" in title:
        points = ["首の痛みで注意したい症状", "むちうち以外に考えられる不調", "早めに相談するべきタイミング"]
    return points


def column_json_ld(post: NotePost) -> dict:
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "datePublished": post.published_iso,
                "dateModified": post.published_iso,
                "image": post.thumbnail or f"{SITE_URL}/images/logo.png",
                "url": f"{SITE_URL}/column/{post.slug}/",
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": f"{SITE_URL}/column/{post.slug}/"
                },
                "inLanguage": "ja",
                "author": {
                    "@type": "Person",
                    "name": "谷内 直人",
                    "jobTitle": "院長・柔道整復師"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": SITE_NAME,
                    "logo": {
                        "@type": "ImageObject",
                        "url": f"{SITE_URL}/images/logo.png"
                    }
                },
                "isBasedOn": post.url
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "トップ", "item": SITE_URL + "/"},
                    {"@type": "ListItem", "position": 2, "name": COLUMN_TITLE, "item": SITE_URL + "/column/"},
                    {"@type": "ListItem", "position": 3, "name": post.title, "item": f"{SITE_URL}/column/{post.slug}/"}
                ]
            }
        ]
    }


def render_index(posts: Iterable[NotePost]) -> str:
    posts = list(posts)
    cards = []
    for post in posts:
        image = (
            f'<img src="{html.escape(post.thumbnail)}" alt="{html.escape(post.title)}" loading="lazy">'
            if post.thumbnail
            else ""
        )
        cards.append(
            f"""          <article class="note-column-card">
            {image}
            <div class="note-column-card__body">
              <time datetime="{html.escape(post.published_iso)}">{html.escape(post.published)}</time>
              <h2>{html.escape(post.title)}</h2>
              <p>{html.escape(post.excerpt)}</p>
              <a href="/column/{html.escape(post.slug)}/">要約を読む</a>
            </div>
          </article>"""
        )

    body = f"""{site_header()}
  <main>
    <section class="note-column-hero">
      <h1>{COLUMN_TITLE}</h1>
      <p>院長がnoteで発信している健康コラムの新着一覧です。本文はnoteでお読みいただけます。</p>
    </section>
    <section class="section">
      <div class="container">
        <div class="note-column-list">
{chr(10).join(cards)}
        </div>
      </div>
    </section>
  </main>
{site_footer()}"""
    return page_shell(
        f"{COLUMN_TITLE}｜{SITE_NAME}",
        "杉田さくら柔整治療院の院長がnoteで発信している健康コラムの新着一覧です。",
        body,
        f"{SITE_URL}/column/",
        json_ld={
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": COLUMN_TITLE,
            "url": f"{SITE_URL}/column/",
            "publisher": {"@type": "Organization", "name": SITE_NAME},
            "blogPost": [
                {
                    "@type": "BlogPosting",
                    "headline": post.title,
                    "url": f"{SITE_URL}/column/{post.slug}/",
                    "datePublished": post.published_iso,
                    "isBasedOn": post.url,
                }
                for post in posts
            ],
        },
    )


def render_summary(post: NotePost) -> str:
    image = (
        f'<img class="note-summary__image" src="{html.escape(post.thumbnail)}" alt="{html.escape(post.title)}" loading="lazy">'
        if post.thumbnail
        else ""
    )
    points = "\n".join(f"          <li>{html.escape(point)}</li>" for point in summary_points(post))
    links = "\n".join(
        f'          <a href="{html.escape(href)}">{html.escape(label)}</a>' for label, href in related_links(post)
    )
    body = f"""{site_header()}
  <main>
    <section class="note-column-hero">
      <p>NOTE COLUMN</p>
      <p style="font-size: clamp(1.8rem, 4vw, 2.7rem); font-weight: 700; color: #3a2d32;">noteコラム要約</p>
    </section>
    <section class="section">
      <div class="container note-summary">
        {image}
        <time class="note-summary__date" datetime="{html.escape(post.published_iso)}">{html.escape(post.published)}</time>
        <h1>{html.escape(post.title)}</h1>
        <div class="note-summary__box">
          <p>{html.escape(post.excerpt)}</p>
        </div>
        <h2>この記事でわかること</h2>
        <ul>
{points}
        </ul>
        <h2>関連する症状・治療ページ</h2>
        <div class="note-summary__links">
{links}
        </div>
        <p>この記事の本文はnoteで公開しています。HPでは要点と関連ページを整理し、詳しい本文はnoteで継続的に更新しています。</p>
        <p><a class="btn btn--primary" href="{html.escape(post.url)}" target="_blank" rel="noopener noreferrer">noteで全文を読む</a></p>
      </div>
    </section>
  </main>
{site_footer()}"""
    return page_shell(
        f"{post.title}｜{SITE_NAME}",
        post.excerpt,
        body,
        f"{SITE_URL}/column/{post.slug}/",
        json_ld=column_json_ld(post),
    )


def write_outputs(root: Path, posts: list[NotePost]) -> None:
    data_dir = root / "data"
    column_dir = root / "column"
    data_dir.mkdir(exist_ok=True)
    column_dir.mkdir(exist_ok=True)

    (data_dir / "note-posts.json").write_text(
        json.dumps([asdict(post) for post in posts], ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (column_dir / "index.html").write_text(render_index(posts), encoding="utf-8")

    for post in posts:
        post_dir = column_dir / post.slug
        post_dir.mkdir(exist_ok=True)
        (post_dir / "index.html").write_text(render_summary(post), encoding="utf-8")


def load_cached_posts(root: Path) -> list[NotePost]:
    cache_path = root / "data" / "note-posts.json"
    if not cache_path.exists():
        return []
    raw_posts = json.loads(cache_path.read_text(encoding="utf-8"))
    return [NotePost(**post) for post in raw_posts]


def update_sitemap(root: Path) -> None:
    generate_sitemap(root)


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
    try:
        posts = parse_posts(fetch_rss(NOTE_RSS_URL))
    except Exception as exc:
        print(f"RSS fetch failed, using cached posts: {exc}", file=sys.stderr)
        posts = load_cached_posts(root)
    if not posts:
        print("No note posts found.", file=sys.stderr)
        return 1
    write_outputs(root, posts)
    update_sitemap(root)
    print(f"Generated {len(posts)} note column entries in {root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
