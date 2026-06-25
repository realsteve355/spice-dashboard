# SPICE [ZPC] - Claude Code Setup (v2 - NOW WITH READABLE DOCS!)

## Great News!

Your `.docx` files are actually **plain text** already - Claude Code CAN read them!

I've renamed them to `.md` so Claude Code recognizes them as markdown files.

## What's in This Package

```
spice-claude-code-v2/
├── CLAUDE.md                           # Main configuration file
├── README.md                           # This file
└── docs/                               # All docs now readable by Claude Code!
    ├── SPICE_Project_Brief_v1.md       ✅ 15KB - readable
    ├── SPICE_Pitch_v1.md               ✅ 12KB - readable
    ├── SPICE_Product_Decisions.md      ✅ 53KB - readable (867 lines!)
    ├── SPICE_Macro_Thesis_v2.md        ✅ 66KB - readable (30+ pages)
    ├── SPICE_Investment_Strategy_v4.md ✅ 34KB - readable
    ├── SPICE_Legal_Architecture_v1.md  ✅ 49KB - readable
    ├── SPICE_Technical_Requirements_v4.md ✅ 45KB - readable
    ├── SPICECode.txt                   ✅ 23KB - readable
    └── CLAUDE.md                       ✅ Duplicate for reference
```

All files are now `.md` or `.txt` format - **Claude Code can read every single one**.

## Quick Setup

```bash
# Navigate to your project
cd C:\Users\user\OneDrive\Documents\Crypto\spice-dashboard

# Copy CLAUDE.md to project root
copy path\to\spice-claude-code-v2\CLAUDE.md .

# Copy docs directory
xcopy path\to\spice-claude-code-v2\docs docs\ /E /I

# Launch Claude Code
claude
```

## Test It Immediately

```bash
# In Claude Code, try this:
"Read docs/SPICE_Product_Decisions.md and explain the Phase 1 vs Phase 2 fund structure"

# Or this:
"Based on docs/SPICE_Technical_Requirements_v4.md, what oracle architecture should we use?"

# Or this:
"According to docs/SPICE_Macro_Thesis_v2.md, what is The Great Collision?"
```

**It will work.** Claude Code can read all your docs now.

## What Changed from v1

**v1 problem:** Tried to give Claude Code `.docx` files (binary format) - couldn't read them

**v2 solution:** Realized the files were already plain text! Just renamed them to `.md` so Claude Code recognizes them as markdown.

## Your Complete Workflow Now

1. **Copy files** as shown above
2. **Launch:** `claude` in project directory
3. **Ask anything:** Claude Code has full context from CLAUDE.md AND can read all docs
4. **Make changes:** Direct file editing, no batch scripts
5. **Deploy:** `git add . && git commit -m "..." && git push`

## Example Conversations

```bash
# Strategic question
"Based on all the docs, what's the biggest legal risk we face?"

# Technical implementation  
"Read the vault architecture in Technical_Requirements_v4.md and implement the deposit function"

# Product design
"According to Product_Decisions.md, why did we choose Bitcoin denomination?"

# Asset selection
"Read Investment_Strategy_v4.md and explain why we include AI infrastructure in the basket"
```

## Files Claude Code Can Reference

- **All 8 docs in `/docs`** - full strategic context
- **CLAUDE.md** - quick reference and workflow patterns  
- **Your actual codebase** - every `.jsx`, `.css`, `.js` file in the project
- **package.json** - dependencies and scripts
- **Git history** - what changed and why

## The Key Difference

**With Claude.ai (me):**
- I can search Project Knowledge
- But I can't see your actual code files
- You copy-paste between us

**With Claude Code:**
- It can read all the docs directly from `/docs`
- It can see your actual codebase  
- It can edit files, run commands, commit to Git
- Single source of truth

## Next Steps

1. Copy files to your project (commands above)
2. Launch `claude`
3. Try: `"Read docs/SPICE_Project_Brief_v1.md and summarize the project"`
4. Confirm it works
5. Start building!

---

**Problem solved.** Your docs are readable. Claude Code is ready.
