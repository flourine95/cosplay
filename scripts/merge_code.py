"""
merge_code.py - Gộp các file code thành 1 file
Usage:
    python scripts/merge_code.py                          # dùng config mặc định
    python scripts/merge_code.py --all                    # lấy tất cả file
    python scripts/merge_code.py --ext ts tsx             # chỉ lấy file .ts .tsx
    python scripts/merge_code.py --dir src app            # chỉ scan thư mục cụ thể
    python scripts/merge_code.py --out context.md         # đổi tên file output
    python scripts/merge_code.py --no-ignore              # bỏ qua filter, lấy hết
    python scripts/merge_code.py --max-size 100           # giới hạn file size (KB)
    python scripts/merge_code.py --tree-only-dirs components/ui  # hiện tree nhưng không show nội dung
"""

import os
import sys
import argparse
import fnmatch
from pathlib import Path
from datetime import datetime

# ============================================================
# CẤU HÌNH MẶC ĐỊNH
# ============================================================

DEFAULT_EXTENSIONS = {
    # Web / Next.js
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    # Style
    ".css", ".scss", ".sass",
    # Config
    ".json", ".yaml", ".yml", ".toml", ".env.example",
    # Python
    ".py", ".pyi",
    # Java / Spring Boot
    ".java", ".xml", ".properties", ".gradle",
    # Docs
    ".md", ".mdx",
    # HTML
    ".html",
}

DEFAULT_IGNORE_DIRS = {
    "node_modules", ".next", ".git", ".turbo", ".venv", "venv",
    "env", "__pycache__", ".pytest_cache", ".mypy_cache",
    "build", "dist", "out", "coverage", ".idea", ".vscode",
    "target", ".gradle", "gradle", ".husky",
    "playwright-report", "test-results", ".nyc_output",
    "htmlcov", ".eggs", "*.egg-info",
}

DEFAULT_IGNORE_FILES = {
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
    "next-env.d.ts", ".DS_Store", "Thumbs.db",
    "*.tsbuildinfo", "*.pyc", "*.pyo", "*.class",
    ".env.local", ".env.development.local", ".env.production.local",
}

DEFAULT_IGNORE_PATTERNS = {
    "*.min.js", "*.min.css", "*.map", "*.d.ts",
}

# Thư mục mặc định: hiện trong tree nhưng KHÔNG show nội dung
DEFAULT_TREE_ONLY_DIRS = {
    "components/ui",
}

MAX_FILE_SIZE_KB = 500

# ============================================================


def should_ignore_file(filepath: Path, ignore_files: set, ignore_patterns: set) -> bool:
    name = filepath.name
    if name in ignore_files:
        return True
    for pattern in ignore_patterns:
        if fnmatch.fnmatch(name, pattern):
            return True
    return False


def should_ignore_dir(dirpath: Path, ignore_dirs: set) -> bool:
    for part in dirpath.parts:
        for pattern in ignore_dirs:
            if fnmatch.fnmatch(part, pattern):
                return True
    return False


def is_tree_only(filepath: Path, root: Path, tree_only_dirs: set) -> bool:
    """Trả về True nếu file thuộc thư mục chỉ hiện tree, không show nội dung."""
    rel = filepath.relative_to(root)
    rel_str = rel.as_posix()
    for tod in tree_only_dirs:
        # normalize về posix để so sánh
        tod_norm = tod.replace("\\", "/").strip("/")
        if rel_str.startswith(tod_norm + "/") or rel_str == tod_norm:
            return True
    return False


def collect_files(
    root: Path,
    extensions: set,
    ignore_dirs: set,
    ignore_files: set,
    ignore_patterns: set,
    scan_dirs: list = None,
    max_size_kb: int = MAX_FILE_SIZE_KB,
) -> list[Path]:
    result = []

    search_roots = []
    if scan_dirs:
        for d in scan_dirs:
            p = root / d
            if p.exists():
                search_roots.append(p)
            else:
                print(f"  ⚠ Thư mục không tồn tại: {d}", file=sys.stderr)
    else:
        search_roots = [root]

    for search_root in search_roots:
        for dirpath, dirnames, filenames in os.walk(search_root):
            dp = Path(dirpath)
            rel = dp.relative_to(root)

            if should_ignore_dir(rel, ignore_dirs):
                dirnames.clear()
                continue

            dirnames[:] = [
                d for d in dirnames
                if not should_ignore_dir(rel / d, ignore_dirs)
            ]

            for filename in sorted(filenames):
                fp = dp / filename
                rel_fp = fp.relative_to(root)

                if should_ignore_file(fp, ignore_files, ignore_patterns):
                    continue

                if extensions != {"*"} and fp.suffix not in extensions:
                    continue

                size_kb = fp.stat().st_size / 1024
                if size_kb > max_size_kb:
                    print(f"  ⚠ Bỏ qua (quá lớn {size_kb:.0f}KB): {rel_fp}", file=sys.stderr)
                    continue

                result.append(fp)

    return sorted(result)


def build_output(files: list[Path], root: Path, tree_only_dirs: set) -> str:
    lines = []
    lines.append(f"# AI Context — {root.name}")
    lines.append(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"# Total files: {len(files)}")
    if tree_only_dirs:
        lines.append(f"# Tree-only dirs (no content): {', '.join(sorted(tree_only_dirs))}")
    lines.append("")

    # File tree
    lines.append("## File Tree")
    lines.append("```")
    for f in files:
        rel = f.relative_to(root)
        marker = "  [tree only]" if is_tree_only(f, root, tree_only_dirs) else ""
        lines.append(str(rel) + marker)
    lines.append("```")
    lines.append("")

    # File contents — bỏ qua tree-only
    lines.append("## File Contents")
    lines.append("")

    skipped = 0
    for fp in files:
        if is_tree_only(fp, root, tree_only_dirs):
            skipped += 1
            continue

        rel = fp.relative_to(root)
        ext = fp.suffix.lstrip(".")
        lines.append(f"### `{rel}`")
        lines.append(f"```{ext}")
        try:
            content = fp.read_text(encoding="utf-8", errors="replace")
            lines.append(content.rstrip())
        except Exception as e:
            lines.append(f"[Không đọc được file: {e}]")
        lines.append("```")
        lines.append("")

    if skipped:
        lines.append(f"> ℹ {skipped} file từ tree-only dirs không hiển thị nội dung.")
        lines.append("")

    return "\n".join(lines)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Gộp file code để gửi cho AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--root", default=".", help="Thư mục gốc (mặc định: .)")
    parser.add_argument("--out", default="ai-context.md", help="Tên file output")
    parser.add_argument("--ext", nargs="+", metavar="EXT", help="Chỉ lấy extension này")
    parser.add_argument("--dir", nargs="+", metavar="DIR", help="Chỉ scan thư mục này")
    parser.add_argument("--all", action="store_true", help="Lấy tất cả file")
    parser.add_argument("--no-ignore", action="store_true", help="Tắt toàn bộ ignore")
    parser.add_argument("--max-size", type=int, default=MAX_FILE_SIZE_KB, metavar="KB")
    parser.add_argument("--exclude-dir", nargs="+", metavar="DIR", help="Thêm dir cần ignore")
    parser.add_argument("--exclude-file", nargs="+", metavar="FILE", help="Thêm file cần ignore")
    parser.add_argument(
        "--tree-only-dirs", nargs="+", metavar="DIR",
        help="Thư mục chỉ hiện trong tree, không show nội dung (mặc định: components/ui)"
    )
    parser.add_argument(
        "--no-tree-only", action="store_true",
        help="Tắt tree-only mặc định, show nội dung tất cả"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    root = Path(args.root).resolve()

    print(f"📁 Root: {root}")

    # Extensions
    if args.all:
        extensions = {"*"}
    elif args.ext:
        extensions = {"." + e.lstrip(".") for e in args.ext}
    else:
        extensions = DEFAULT_EXTENSIONS

    # Ignore
    if args.no_ignore:
        ignore_dirs = {".git", "node_modules"}
        ignore_files = set()
        ignore_patterns = set()
    else:
        ignore_dirs = DEFAULT_IGNORE_DIRS.copy()
        ignore_files = DEFAULT_IGNORE_FILES.copy()
        ignore_patterns = DEFAULT_IGNORE_PATTERNS.copy()

    if args.exclude_dir:
        ignore_dirs.update(args.exclude_dir)
    if args.exclude_file:
        ignore_files.update(args.exclude_file)

    # Tree-only dirs
    if args.no_tree_only:
        tree_only_dirs = set()
    elif args.tree_only_dirs:
        tree_only_dirs = set(args.tree_only_dirs)
    else:
        tree_only_dirs = DEFAULT_TREE_ONLY_DIRS.copy()

    print(f"🔍 Đang scan...")
    files = collect_files(
        root=root,
        extensions=extensions,
        ignore_dirs=ignore_dirs,
        ignore_files=ignore_files,
        ignore_patterns=ignore_patterns,
        scan_dirs=args.dir,
        max_size_kb=args.max_size,
    )

    if not files:
        print("⚠ Không tìm thấy file nào phù hợp.")
        return

    tree_only_count = sum(1 for f in files if is_tree_only(f, root, tree_only_dirs))
    content_count = len(files) - tree_only_count
    print(f"✅ Tìm thấy {len(files)} file ({content_count} có nội dung, {tree_only_count} tree-only)")

    content = build_output(files, root, tree_only_dirs)

    out_path = Path(args.out)
    out_path.write_text(content, encoding="utf-8")

    size_kb = out_path.stat().st_size / 1024
    print(f"💾 Đã lưu: {out_path} ({size_kb:.1f} KB)")
    print(f"📋 Copy nội dung file này và paste vào chat AI!")


if __name__ == "__main__":
    main()
