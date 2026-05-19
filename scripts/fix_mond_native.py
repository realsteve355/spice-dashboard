#!/usr/bin/env python3
"""Native-app sweep: replace bare-S currency suffix with the proper
display. JSX content (inside <Text>...</Text>) gets a MondSymbol SVG;
template-literal strings get the spelled-out word "MOND" (per brand spec).
"""
import re
import glob

files = (
    glob.glob('colony-app-native/src/**/*.js', recursive=True) +
    glob.glob('colony-app-native/src/**/*.jsx', recursive=True)
)
EXCLUDE = ('MondSymbol.jsx', 'MondSymbol.js')


def import_path_for(jsx_path: str) -> str:
    norm = jsx_path.replace('\\', '/')
    rel = norm[len('colony-app-native/src/'):]
    parts = rel.split('/')
    depth = len(parts) - 1
    return '../' * depth + 'components/MondSymbol'


changed = 0
for path in files:
    if any(x in path for x in EXCLUDE):
        continue
    t0 = open(path, encoding='utf-8').read()
    t = t0

    # --- Template literals / strings (where SVG can't render) ---
    # `${expr} S` → `${expr} MOND`
    t = re.sub(r"(`[^`]*?\$\{[^}]+\}) S\b", r"\1 MOND", t)
    # `5 S` (static) → `5 MOND`
    t = re.sub(r"(`[^`]*?\b\d[\d.,]*) S\b", r"\1 MOND", t)
    # `Convert S → V` etc. (free-form text inside backtick) → `Convert MOND → V`
    t = re.sub(r"(`[^`]*?)\bS → V", r"\1MOND → V", t)
    # `Max 200 S this epoch` etc. — already mostly caught above
    # Single-quoted: '200 S' → '200 MOND'
    t = re.sub(r"('[^']*?\b\d[\d.,]*) S\b", r"\1 MOND", t)
    # Double-quoted
    t = re.sub(r'("[^"]*?\b\d[\d.,]*) S\b', r'\1 MOND', t)

    # `Alert.alert(..., \`${amt} S sent.\`)` covered above

    # --- JSX content: `>{expr} S<` → `><MondSymbol /> {expr}<` ---
    # Pattern A: `>{expr} S<` followed by `<` (closing tag)
    t = re.sub(r'>(\{[^{}]+\}) S(?=<)',
               r'><MondSymbol size={12} /> \1', t)
    # Pattern B: `>{expr} × {expr2} S<` — multi-expression line items
    t = re.sub(r'(\{[^{}]+\} × \{[^{}]+\}) S(?=<)',
               r'\1 <MondSymbol size={10} />', t)
    # Pattern C: `{expr} S</Text>` after middle of JSX content
    # already caught by A

    # `Send <Text>...{amount} S</Text>` — already a Text element holding
    # the expression. Convert to inline component.
    # Already covered: `{amount} S</Text>` matches Pattern A.

    if '<MondSymbol' in t and 'import MondSymbol' not in t:
        imp = import_path_for(path)
        lines = t.splitlines(keepends=True)
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
                while last_import + 1 < len(lines) and (
                    lines[last_import + 1].startswith('import ')
                    or lines[last_import + 1].strip() == ''
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

print(f"Total: {changed}")
