#!/usr/bin/env python3
"""One-shot script to swap Unicode Ɱ in JSX contexts for <MondSymbol /> SVG.

Strategy:
- JSX content positions (e.g. `>Ɱ {expr}<`) → swap with React component.
- Template literals / string contexts (where SVG can't render) → revert to
  the word "MOND" (per brand spec: spell out the word when symbol can't be
  used; never use Unicode Ɱ because it varies across fonts).
"""
import re
import glob

files = (
    glob.glob('colony-app/src/**/*.jsx', recursive=True) +
    glob.glob('colony-app/src/**/*.js',  recursive=True)
)

EXCLUDE_SUBSTR = ('contracts.json', 'deployArtifacts.js', 'mock.js',
                  'logger.js', 'MondSymbol.jsx', 'Amount.jsx')


def import_path_for(jsx_path: str) -> str:
    norm = jsx_path.replace('\\', '/')
    rel = norm[len('colony-app/src/'):]
    parts = rel.split('/')
    depth = len(parts) - 1
    return '../' * depth + 'components/MondSymbol'


changed = 0
for path in files:
    if any(x in path for x in EXCLUDE_SUBSTR):
        continue
    t0 = open(path, encoding='utf-8').read()
    t = t0

    # --- Step 1: template literal / string contexts: revert Ɱ to MOND word ---
    # Backtick template literal: replace `Ɱ ${expr}` → `${expr} MOND`
    t = re.sub(r"(`[^`]*?)Ɱ (\$\{[^}]+\})", r"\1\2 MOND", t)
    # Also catch `Ɱ {var}` inside backtick template literals (the $ may have
    # been eaten by an earlier sweep). Rewrite back to `${var} MOND` so the
    # JS interpolation works again.
    t = re.sub(r"(`[^`]*?)Ɱ \{([^{}]+)\}", r"\1${\2} MOND", t)
    # Static template strings:  `Ɱ 5`  →  `5 MOND` inside any backtick literal
    t = re.sub(r"(`[^`]*?)Ɱ (\d[\d.,]*)([^`]*?`)", r"\1\2 MOND\3", t)

    # Double-quoted strings: "Ɱ 5" → "5 MOND" (rare cases like placeholders)
    t = re.sub(r'"([^"]*?)Ɱ (\d[\d.,]*)([^"]*?)"', r'"\1\2 MOND\3"', t)

    # Single-quoted strings (object value pairs, etc.): 'Ɱ 1,000 / month' → '1,000 MOND / month'
    t = re.sub(r"'([^']*?)Ɱ (\d[\d.,]*)([^']*?)'", r"'\1\2 MOND\3'", t)

    # Form labels and placeholders use plain string — revert to word.
    pairs = [
        ('label="Declared value (Ɱ)"', 'label="Declared value (MOND)"'),
        ('label="Monthly amount (Ɱ)"', 'label="Monthly amount (MOND)"'),
        ('"new declared value (Ɱ)"', '"new declared value (MOND)"'),
        ('"your new declared value (Ɱ)"', '"your new declared value (MOND)"'),
        ('"Ɱ price"', '"MOND price"'),
        ("placeholder=\"Price (e.g. Ɱ 5, Ɱ 10 / hr)\"",
         "placeholder=\"Price (e.g. 5 MOND, 10 MOND / hr)\""),
    ]
    for old, new in pairs:
        t = t.replace(old, new)

    # --- Step 2: JSX content positions: Ɱ → <MondSymbol /> ---
    # Expanded lookahead: also `/` (for `/month`, `/day` units).
    # `>Ɱ {expr}` followed by `<`, whitespace, or `/` (unit suffix)
    t = re.sub(r'>Ɱ (\{[^{}]+\})(?=[<\s/])', r'><MondSymbol size={12} /> \1', t)
    # `>Ɱ NUMBER` static
    t = re.sub(r'>Ɱ (\d[\d.,]*)(?=[<\s/])', r'><MondSymbol size={12} /> \1', t)
    # `Ɱ </span>` standalone label
    t = t.replace('>Ɱ</span>', '><MondSymbol size={10} /></span>')

    # `Ɱ {expr}` after a closing brace inside JSX (e.g. ternary result)
    t = re.sub(r'\}\s*Ɱ (\{[^{}]+\})', r'}<MondSymbol size={12} /> \1', t)

    # `Ɱ {expr}` after newline+indent within JSX (multiline)
    t = re.sub(r'(\n\s+)Ɱ (\{[^{}]+\})(?=[\s,/<])',
               r'\1<MondSymbol size={12} /> \2', t)

    # Compound prefix like `+Ɱ {expr}` or `-Ɱ {expr}` in JSX content
    t = re.sub(r'([\+\−\-])Ɱ (\{[^{}]+\})',
               r'\1<MondSymbol size={12} /> \2', t)

    # JSX content `&gt; Ɱ 500` → `&gt; 500 MOND` (HTML-escaped > followed by Ɱ)
    t = re.sub(r'&gt;\s*Ɱ (\d[\d.,]*)', r'&gt; \1 MOND', t)

    # Generic `Ɱ {expr}` left over inside JSX text — replace with SVG comp.
    # Match across all the common terminators: <, space, /, }, comma, period.
    t = re.sub(r'(?<=[\s>])Ɱ (\{[^{}]+\})(?=[\s/<},.])',
               r'<MondSymbol size={12} /> \1', t)

    # `reg. Ɱ {expr}` (specific phrase, no space before)
    t = re.sub(r'(\breg\. )Ɱ (\{[^{}]+\})', r'\1<MondSymbol size={10} /> \2', t)

    # JSX fragment content `<> · was Ɱ {expr}</>` → swap
    t = re.sub(r'(was )Ɱ (\{[^{}]+\})', r'\1<MondSymbol size={10} /> \2', t)

    # If MondSymbol now used but not imported, add the import.
    if '<MondSymbol' in t and 'import MondSymbol' not in t:
        imp = import_path_for(path)
        lines = t.splitlines(keepends=True)
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
                while (
                    last_import + 1 < len(lines)
                    and (
                        lines[last_import + 1].startswith('import ')
                        or lines[last_import + 1].strip() == ''
                    )
                ):
                    last_import += 1
                lines.insert(last_import + 1,
                             f"import MondSymbol from '{imp}'\n")
                break
        t = ''.join(lines)

    if t != t0:
        open(path, 'w', encoding='utf-8').write(t)
        changed += 1
        print('  ' + path)

print(f"Changed: {changed}")
