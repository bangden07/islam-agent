import os
import glob

DOCS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "docs")
DOCS_DIR = os.path.abspath(DOCS_DIR)

KASRA = "\u0650"      # ِ
SMALL_WAW = "\u06E5"  # ۥ
SMALL_YA = "\u06E6"   # ۦ


def iter_files():
    return sorted(glob.glob(os.path.join(DOCS_DIR, "*.md")))


def find_kasra_small_waw():
    hits: list[tuple[str, int, str]] = []
    for fpath in iter_files():
        with open(fpath, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f.read().splitlines(), 1):
                idx = 0
                while True:
                    j = line.find(KASRA + SMALL_WAW, idx)
                    if j == -1:
                        break
                    ctx = line[max(0, j - 24) : min(len(line), j + 24)]
                    hits.append((os.path.basename(fpath), line_no, ctx))
                    idx = j + 2
    return hits


def find_small_waw_context(window: int = 3):
    hits: list[tuple[str, int, str, str]] = []
    for fpath in iter_files():
        with open(fpath, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f.read().splitlines(), 1):
                idx = 0
                while True:
                    j = line.find(SMALL_WAW, idx)
                    if j == -1:
                        break
                    prev = line[max(0, j - window) : j]
                    ctx = line[max(0, j - 24) : min(len(line), j + 24)]
                    prev_hex = " ".join(f"U+{ord(ch):04X}" for ch in prev)
                    hits.append((os.path.basename(fpath), line_no, prev_hex, ctx))
                    idx = j + 1
    return hits


if __name__ == "__main__":
    hits = find_kasra_small_waw()
    print(f"Docs dir: {DOCS_DIR}")
    print(f"FOUND {len(hits)} occurrences of kasra+SMALL_WAW (\\u0650\\u06E5).")
    for fname, line_no, ctx in hits:
        print(f"- {fname}:{line_no} ...{ctx}...")

    print()
    all_waw = find_small_waw_context(window=3)
    print(f"FOUND {len(all_waw)} total occurrences of SMALL_WAW (\\u06E5). Showing up to 50.")
    for fname, line_no, prev_hex, ctx in all_waw[:50]:
        flag = " <-- has KASRA nearby" if "U+0650" in prev_hex else ""
        print(f"- {fname}:{line_no} prev=[{prev_hex}]{flag} ...{ctx}...")
