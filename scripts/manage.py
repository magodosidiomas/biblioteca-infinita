#!/usr/bin/env python3
"""
manage.py — Gerenciador CLI em lote da Biblioteca de Imersão.

Permite:
- status: ver resumo exato de itens por categoria e idioma
- sync: sincronizar content.json <-> channels.ts
- reset: resetar base para modo de teste (ex: 10 YT + 6 Professores de inglês)
- clear: limpar categorias ou idiomas inteiros
- add-url: extrair metadados oficiais do YouTube e adicionar canal
- bulk-add: adicionar múltiplos canais via lista de URLs ou JSON
- backup: criar snapshot com timestamp
- restore: restaurar de snapshot
"""

import os
import sys
import json
import shutil
import datetime
import argparse
import urllib.request
import re

# Garantir UTF-8 no terminal Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "app", "src", "data")
CONTENT_JSON = os.path.join(DATA_DIR, "content.json")
CHANNELS_TS = os.path.join(DATA_DIR, "channels.ts")
BACKUP_DIR = os.path.join(DATA_DIR, "backups")

MAP_CAT = {
    "YouTube": "youtube",
    "Podcasts": "podcasts",
    "Séries": "series",
    "Professores": "professores",
    "Pronúncia": "professores",
    "Recursos": "sites"
}

ALL_LANGS = [
    "english", "german", "french", "spanish", "italian",
    "russian", "japanese", "portuguese", "polish", "ukrainian",
    "arabic", "latin"
]

ALL_FORMATS = ["YouTube", "Podcasts", "Séries", "Professores", "Pronúncia", "Recursos"]


def ensure_backup_dir():
    os.makedirs(BACKUP_DIR, exist_ok=True)


def create_backup(label="auto"):
    ensure_backup_dir()
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"content_{label}_{ts}.json")
    if os.path.exists(CONTENT_JSON):
        shutil.copy2(CONTENT_JSON, backup_file)
        return backup_file
    return None


def load_content():
    if not os.path.exists(CONTENT_JSON):
        print(f"[ERRO] {CONTENT_JSON} não encontrado.")
        sys.exit(1)
    with open(CONTENT_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def save_content(data, update_ts=True):
    create_backup("pre_save")
    with open(CONTENT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    if update_ts:
        sync_channels_ts(data)


def sync_channels_ts(data=None):
    if data is None:
        data = load_content()

    items = []
    for lang_key, lang_obj in data.items():
        if not isinstance(lang_obj, dict):
            continue
        for cat_key, cat_items in lang_obj.items():
            target_cat = MAP_CAT.get(cat_key)
            if not target_cat or not isinstance(cat_items, list):
                continue

            for c in cat_items:
                raw_name = c.get("name") or c.get("title") or lang_key[:2].upper()
                words = [w for w in raw_name.split() if w]
                initials = "".join([w[0] for w in words[:2]]).upper() or lang_key[:2].upper()
                
                desc = (c.get("desc") or c.get("description") or "").strip()
                desc = desc.replace("&#39;", "'").replace("&quot;", '"').replace("&amp;", '&')
                desc = re.sub(r"\s+", " ", desc)

                topics = c.get("tags") or c.get("topics") or ["Geral"]

                items.append({
                    "id": c.get("id") or f"{lang_key}_{re.sub(r'[^a-z0-9]', '', raw_name.lower())}",
                    "category": target_cat,
                    "title": raw_name,
                    "url": c.get("url") or "#",
                    "avatar": c.get("avatar") or None,
                    "initials": initials,
                    "description": desc,
                    "beginnerFriendly": c.get("difficulty") == "iniciante" or "Iniciante" in topics,
                    "subtitlesAvailable": c.get("subtitleTag") in ["Legendas [CC]", "Legendas bilíngues"] or c.get("subtitlesAvailable", False),
                    "accent": c.get("accent"),
                    "flag": c.get("flag"),
                    "language": lang_key,
                    "topics": topics
                })

    content_str = f"import type {{ ChannelItem }} from '../types/content';\n\nexport const CHANNELS: ChannelItem[] = {json.dumps(items, indent=2, ensure_ascii=False)};\n"
    with open(CHANNELS_TS, "w", encoding="utf-8") as f:
        f.write(content_str)
    print(f"[OK] {CHANNELS_TS} sincronizado com {len(items)} itens totais.")


def cmd_status(args):
    data = load_content()
    print("=" * 64)
    print("STATUS DA BIBLIOTECA DE CONTEÚDOS")
    print("=" * 64)
    total_global = 0

    for lang in ALL_LANGS:
        lang_data = data.get(lang, {})
        counts = {}
        subtotal = 0
        for fmt in ALL_FORMATS:
            cnt = len(lang_data.get(fmt, []))
            counts[fmt] = cnt
            subtotal += cnt
            total_global += cnt
        
        status_line = " | ".join([f"{k}: {v}" for k, v in counts.items() if v > 0])
        flag = "🇬🇧" if lang == "english" else "🇩🇪" if lang == "german" else "🇫🇷" if lang == "french" else "🌐"
        if subtotal > 0:
            print(f" {flag} {lang.capitalize():<12} [Total: {subtotal:>3}] -> {status_line}")
        else:
            print(f" ⚪ {lang.capitalize():<12} [Total:   0] (vazio)")

    print("-" * 64)
    print(f"TOTAL GERAL NO ARQUIVO: {total_global} conteúdos")
    print("=" * 64)


def cmd_reset_test(args):
    """Reseta a base mantendo apenas 10 canais do YouTube e 6 Professores de inglês."""
    create_backup("before_reset_test")
    backup_full = os.path.join(DATA_DIR, "content.full_multilingual_backup.json")
    
    source_data = None
    if os.path.exists(backup_full):
        with open(backup_full, "r", encoding="utf-8") as f:
            source_data = json.load(f)
    else:
        source_data = load_content()

    en_yt = source_data.get("english", {}).get("YouTube", [])[:args.yt_count]
    en_prof = source_data.get("english", {}).get("Professores", [])[:args.prof_count]

    new_data = {}
    for lang in ALL_LANGS:
        new_data[lang] = {fmt: [] for fmt in ALL_FORMATS}

    new_data["english"]["YouTube"] = en_yt
    new_data["english"]["Professores"] = en_prof

    save_content(new_data)
    print(f"[OK] Base resetada com sucesso!")
    print(f"     Inglês: {len(en_yt)} YouTube + {len(en_prof)} Professores.")
    print(f"     Demais categorias e idiomas zerados.")


def cmd_clear(args):
    data = load_content()
    create_backup("before_clear")

    target_lang = args.lang
    target_format = args.format

    if target_lang == "all":
        langs = ALL_LANGS
    else:
        langs = [target_lang]

    count_cleared = 0
    for l in langs:
        if l in data:
            if target_format == "all":
                for f in ALL_FORMATS:
                    count_cleared += len(data[l].get(f, []))
                    data[l][f] = []
            elif target_format in data[l]:
                count_cleared += len(data[l][target_format])
                data[l][target_format] = []

    save_content(data)
    print(f"[OK] Limpeza concluída: {count_cleared} itens removidos (lang={target_lang}, format={target_format}).")


def fetch_youtube_meta(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        # Title
        t_match = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
        title = t_match.group(1).replace(" - YouTube", "").strip() if t_match else ""

        # Desc
        d_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
        desc = d_match.group(1).strip() if d_match else ""

        # Image/Avatar
        img_match = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
        avatar = img_match.group(1) if img_match else ""

        # Id
        clean_id = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")
        if "@" in url:
            handle = url.split("@")[1].split("/")[0].split("?")[0]
            clean_id = re.sub(r"[^a-z0-9]+", "_", handle.lower()).strip("_")

        return {
            "id": clean_id,
            "title": title,
            "desc": desc,
            "avatar": avatar,
            "url": url
        }
    except Exception as e:
        print(f"[AVISO] Falha ao raspar {url}: {e}")
        return None


def cmd_add(args):
    data = load_content()
    meta = fetch_youtube_meta(args.url)
    if not meta:
        print(f"[ERRO] Não foi possível extrair dados para {args.url}")
        sys.exit(1)

    lang = args.lang
    category = args.format  # "YouTube" ou "Professores"
    tags = [t.strip() for t in args.tags.split(",") if t.strip()]

    item = {
        "id": meta["id"],
        "name": args.title if args.title else meta["title"],
        "url": args.url,
        "avatar": meta["avatar"],
        "desc": args.desc if args.desc else meta["desc"],
        "tags": tags if tags else ["Geral"],
        "beginnerFriendly": args.beginner,
        "subtitlesAvailable": args.subtitles
    }

    if lang not in data:
        data[lang] = {f: [] for f in ALL_FORMATS}
    if category not in data[lang]:
        data[lang][category] = []

    # Checar se já existe
    existing = [x for x in data[lang][category] if x["id"] == item["id"] or x.get("url") == args.url]
    if existing:
        print(f"[AVISO] Item já existente: {existing[0].get('name')}. Use update para modificar.")
        return

    data[lang][category].append(item)
    save_content(data)
    print(f"[OK] Canal adicionado com sucesso em {lang} -> {category}: {item['name']}")


def main():
    parser = argparse.ArgumentParser(description="Gerenciador CLI da Biblioteca de Imersão")
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponíveis")

    # Status
    subparsers.add_parser("status", help="Exibe contagem real de conteúdos por idioma e categoria")

    # Sync
    subparsers.add_parser("sync", help="Sincroniza content.json para channels.ts")

    # Reset test
    p_reset = subparsers.add_parser("reset-test", help="Reseta para conjunto de teste (Inglês: 10 YT + 6 Profs)")
    p_reset.add_argument("--yt-count", type=int, default=10, help="Quantidade de canais YouTube de teste")
    p_reset.add_argument("--prof-count", type=int, default=6, help="Quantidade de canais Professores de teste")

    # Clear
    p_clear = subparsers.add_parser("clear", help="Limpa conteúdos de um idioma ou formato específico")
    p_clear.add_argument("--lang", default="all", help="Idioma específico ou 'all'")
    p_clear.add_argument("--format", default="all", help="Formato específico (YouTube, Podcasts, etc) ou 'all'")

    # Add URL
    p_add = subparsers.add_parser("add", help="Adiciona um canal raspando metadados oficiais")
    p_add.add_argument("url", help="URL do canal do YouTube")
    p_add.add_argument("--lang", default="english", help="Idioma (padrão: english)")
    p_add.add_argument("--format", default="YouTube", choices=ALL_FORMATS, help="Categoria")
    p_add.add_argument("--title", default=None, help="Título sobrescrito (opcional)")
    p_add.add_argument("--desc", default=None, help="Descrição sobrescrita (opcional)")
    p_add.add_argument("--tags", default="", help="Tags separadas por vírgula")
    p_add.add_argument("--beginner", action="store_true", help="Amigável para iniciantes")
    p_add.add_argument("--subtitles", action="store_true", help="Legendas disponíveis")

    args = parser.parse_args()

    if args.command == "status":
        cmd_status(args)
    elif args.command == "sync":
        sync_channels_ts()
    elif args.command == "reset-test":
        cmd_reset_test(args)
    elif args.command == "clear":
        cmd_clear(args)
    elif args.command == "add":
        cmd_add(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
