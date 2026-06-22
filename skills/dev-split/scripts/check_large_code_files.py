#!/usr/bin/env python3
"""
Scan a repository for large code candidates.

The script is intentionally a rough triage tool. Line count is a signal that a
file or block may deserve review, not proof that it should be split.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

MAX_LINES_DEFAULT = 1200
DEFAULT_EXTENSIONS = {
    ".bash",
    ".cjs",
    ".py",
    ".js",
    ".jsx",
    ".astro",
    ".mjs",
    ".ts",
    ".tsx",
    ".vue",
    ".svelte",
    ".java",
    ".kt",
    ".kts",
    ".scala",
    ".cs",
    ".go",
    ".rs",
    ".rb",
    ".swift",
    ".cpp",
    ".cxx",
    ".cc",
    ".c",
    ".h",
    ".hpp",
    ".php",
    ".ps1",
    ".sh",
    ".sql",
    ".zsh",
}
IGNORE_DIRS = {
    ".git",
    ".next",
    ".nuxt",
    ".idea",
    ".vscode",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    "backup",
    "backups",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "uploads",
    "target",
    "bin",
    "obj",
}

PY_BLOCK_RE = re.compile(r"^(?P<indent>\s*)(?P<kind>def|class)\s+(?P<name>[A-Za-z_][A-Za-z0-9_]*)\b")
BRACE_BLOCK_RE = re.compile(
    r"""
    ^
    (?P<indent>\s*)
    (?:
        (?P<class_kw>export\s+)?(?P<class_type>class|interface|struct|enum)\s+(?P<class_name>[A-Za-z_][A-Za-z0-9_]*)
        |
        (?:
            export\s+|public\s+|private\s+|protected\s+|static\s+|async\s+|final\s+|virtual\s+|inline\s+
        )*
        [A-Za-z_<>\[\],:&*\s]+\s+
        (?P<func_name>[A-Za-z_][A-Za-z0-9_]*)\s*
        \([^;{}]*\)\s*
        (?::\s*[A-Za-z_<>\[\],.&*\s]+)?\s*
        \{
    )
    """,
    re.VERBOSE,
)


@dataclass
class Finding:
    kind: str
    path: str
    name: str
    start_line: int
    end_line: int
    line_count: int


def iter_source_files(root: Path, extensions: set[str]) -> Iterable[Path]:
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in extensions:
            yield path


def read_lines(path: Path) -> list[str]:
    try:
        return path.read_text(encoding="utf-8").splitlines()
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="ignore").splitlines()


def detect_python_blocks(lines: list[str], relative_path: str) -> list[Finding]:
    findings: list[Finding] = []
    stack: list[tuple[str, str, int, int]] = []
    for index, line in enumerate(lines, start=1):
        match = PY_BLOCK_RE.match(line)
        stripped = line.strip()
        current_indent = len(line) - len(line.lstrip(" "))

        while stack and stripped and current_indent <= stack[-1][3]:
            kind, name, start_line, _ = stack.pop()
            findings.append(
                Finding(kind=kind, path=relative_path, name=name, start_line=start_line, end_line=index - 1, line_count=index - start_line)
            )

        if match:
            indent = len(match.group("indent"))
            stack.append((match.group("kind"), match.group("name"), index, indent))

    end_line = len(lines)
    while stack:
        kind, name, start_line, _ = stack.pop()
        findings.append(
            Finding(kind=kind, path=relative_path, name=name, start_line=start_line, end_line=end_line, line_count=end_line - start_line + 1)
        )
    return findings


def detect_brace_blocks(lines: list[str], relative_path: str) -> list[Finding]:
    findings: list[Finding] = []
    pending: tuple[str, str, int] | None = None
    stack: list[tuple[str, str, int, int]] = []

    for index, line in enumerate(lines, start=1):
        stripped = line.strip()
        if pending and "{" in stripped:
            kind, name, start_line = pending
            stack.append((kind, name, start_line, 0))
            pending = None

        match = BRACE_BLOCK_RE.match(line)
        if match:
            if match.group("class_name"):
                kind = "class"
                name = match.group("class_name")
            else:
                kind = "function"
                name = match.group("func_name")

            if "{" in stripped:
                stack.append((kind, name, index, 0))
            else:
                pending = (kind, name, index)

        open_count = line.count("{")
        close_count = line.count("}")
        if stack:
            kind, name, start_line, balance = stack.pop()
            balance += open_count - close_count
            if balance <= 0:
                findings.append(
                    Finding(kind=kind, path=relative_path, name=name, start_line=start_line, end_line=index, line_count=index - start_line + 1)
                )
            else:
                stack.append((kind, name, start_line, balance))

    end_line = len(lines)
    while stack:
        kind, name, start_line, _ = stack.pop()
        findings.append(
            Finding(kind=kind, path=relative_path, name=name, start_line=start_line, end_line=end_line, line_count=end_line - start_line + 1)
        )
    return findings


def detect_blocks(path: Path, lines: list[str], relative_path: str) -> list[Finding]:
    suffix = path.suffix.lower()
    if suffix == ".py":
        return detect_python_blocks(lines, relative_path)
    return detect_brace_blocks(lines, relative_path)


def build_report(root: Path, max_lines: int, extensions: set[str]) -> dict:
    candidate_files: list[dict] = []
    candidate_blocks: list[dict] = []

    for path in iter_source_files(root, extensions):
        lines = read_lines(path)
        relative_path = path.relative_to(root).as_posix()
        line_count = len(lines)
        file_item = {
            "path": relative_path,
            "line_count": line_count,
            "candidate": line_count > max_lines,
        }
        if file_item["candidate"]:
            candidate_files.append(file_item)

        for finding in detect_blocks(path, lines, relative_path):
            if finding.line_count > max_lines:
                candidate_blocks.append(asdict(finding))

    candidate_files.sort(key=lambda item: (-item["line_count"], item["path"]))
    candidate_blocks.sort(key=lambda item: (-item["line_count"], item["path"], item["start_line"]))

    return {
        "root": str(root),
        "candidate_line_threshold": max_lines,
        "candidate_files": candidate_files,
        "candidate_blocks": candidate_blocks,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Find large code candidates for Agent review.")
    parser.add_argument("--root", default=".", help="Repository root or subdirectory to scan.")
    parser.add_argument(
        "--max-lines",
        type=int,
        default=MAX_LINES_DEFAULT,
        help="Candidate line-count threshold. This is a review signal, not a split rule.",
    )
    parser.add_argument(
        "--extensions",
        default=",".join(sorted(DEFAULT_EXTENSIONS)),
        help="Comma-separated list of file extensions to include.",
    )
    parser.add_argument("--json", action="store_true", help="Print JSON instead of text.")
    return parser.parse_args()


def print_text_report(report: dict) -> None:
    candidate_files = report["candidate_files"]
    candidate_blocks = report["candidate_blocks"]
    print(f"Scan root: {report['root']}")
    print(f"Candidate threshold: {report['candidate_line_threshold']} lines")
    print("Line count is a triage signal, not a mandatory split rule.")
    print("")

    print("Candidate large files:")
    if not candidate_files:
        print("  None")
    else:
        for item in candidate_files:
            print(f"  FILE  {item['line_count']:>5}  {item['path']}")

    print("")
    print("Candidate top-level blocks (heuristic):")
    if not candidate_blocks:
        print("  None")
    else:
        for item in candidate_blocks:
            print(
                f"  {item['kind'].upper():<8} {item['line_count']:>5}  {item['path']}:{item['start_line']}-{item['end_line']}  {item['name']}"
            )


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    extensions = {ext.strip().lower() for ext in args.extensions.split(",") if ext.strip()}
    report = build_report(root, args.max_lines, extensions)

    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print_text_report(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
