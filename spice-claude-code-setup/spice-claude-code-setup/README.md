# SPICE [ZPC] - Claude Code Setup Package

## What's in This Package

This package contains everything you need to transition the SPICE project to Claude Code:

```
spice-claude-code-setup/
├── CLAUDE.md                           # Main configuration file (put in project root)
├── README.md                           # This file
└── docs/                               # All strategic documents (reference material)
    ├── SPICE_Project_Brief_v1.docx
    ├── SPICE_Pitch_v1.docx
    ├── SPICE_Product_Decisions.docx
    ├── SPICE_Macro_Thesis_v2.docx
    ├── SPICE_Investment_Strategy_v4.docx
    ├── SPICE_Legal_Architecture_v1.docx
    ├── SPICE_Technical_Requirements_v4.docx
    ├── SPICECode.txt
    └── CLAUDE.md (duplicate for reference)
```

## Setup Instructions

### 1. Copy Files to Your Project

```bash
# Navigate to your project directory
cd C:\Users\user\OneDrive\Documents\Crypto\spice-dashboard

# Create docs directory if it doesn't exist
mkdir docs

# Copy CLAUDE.md to project root
copy path\to\spice-claude-code-setup\CLAUDE.md .

# Copy all docs to docs directory
copy path\to\spice-claude-code-setup\docs\* docs\
```

### 2. Install Claude Code

If you haven't already:

```bash
npm install -g @anthropic-ai/claude-code
```

### 3. Launch Claude Code

Navigate to your project and start Claude Code:

```bash
cd C:\Users\user\OneDrive\Documents\Crypto\spice-dashboard
claude
```

### 4. Initialize (Optional but Recommended)

Let Claude Code analyze your project and enhance the CLAUDE.md:

```bash
/init
```

This will:
- Analyze your codebase
- Review existing documentation
- Suggest improvements to CLAUDE.md
- You can accept/reject suggestions

### 5. Test It Out

Try some commands:

```bash
# Ask about the project
"What is the current architecture of the SPICE vault?"

# Request code changes
"Update the Dashboard to show vault statistics without requiring wallet connection"

# Git operations
"Commit these changes with message 'Add public vault stats to dashboard'"

# File operations  
"Show me all the React components we have"
```

## Key Differences from Claude.ai

### What Claude Code CAN Do (that I can't):

1. **Direct file access** - No more batch scripts, it reads/writes directly
2. **Run Git commands** - Proper version control workflow
3. **Execute commands** - npm, build tools, deployment
4. **See your actual codebase** - Knows what files exist and their current state
5. **Incremental changes** - Edit specific functions without recreating entire files

### What Stays the Same:

- Full context from CLAUDE.md (same knowledge as claude.ai Project)
- Document generation capabilities
- Code generation quality
- Strategic thinking and planning

### Workflow Changes:

**Before (Claude.ai):**
1. Claude generates files
2. Claude packages as .zip with batch script
3. You extract and run script
4. Close VS Code tabs, reopen
5. Manually commit to Git

**After (Claude Code):**
1. You: "Update the dashboard to show X"
2. Claude Code: *directly edits files*
3. Claude Code: *runs npm run dev to test*
4. You: Review changes, approve
5. Claude Code: *commits to Git with message*
6. Claude Code: *pushes to GitHub*

## Tips for Using Claude Code

### 1. Be Specific About Scope

```bash
# Good
"Add a new MetricsCard component to Dashboard showing total vault TVL"

# Too vague  
"Make the dashboard better"
```

### 2. Use Slash Commands

```bash
/init          # Re-analyze project
/help          # See all commands
/git status    # Check git state
/commit        # Commit changes
```

### 3. Review Before Approving

Claude Code will show you what it plans to do before executing. Read it!

### 4. Leverage the Docs

```bash
"Based on SPICE_Technical_Requirements_v4.docx, what oracle architecture should we implement?"
```

The `/docs` directory is your knowledge base - Claude Code can reference any of these documents.

### 5. Iterate Incrementally

```bash
# First pass
"Add vault stats to dashboard"

# Review output, then refine
"Make the stats cards responsive and match our white theme"

# Continue refining
"Add error handling for when the blockchain call fails"
```

## Common Tasks

### Making UI Changes

```bash
"Update the Home component to use our white theme (#FFFFFF bg, #000000 text)"
```

### Adding Features

```bash
"Add a new route /about with information about the SPICE thesis"
```

### Debugging

```bash
"The Collision page iframe isn't loading. Help me debug it."
```

### Deployment

```bash
"Build and deploy to Vercel production"
```

### Documentation

```bash
"Create a technical architecture doc based on our current smart contracts"
```

## Troubleshooting

### "Claude doesn't know about my recent changes"

Claude Code reads files in real-time, but if something seems off:

```bash
/init  # Re-analyze the project
```

### "Permission denied" errors

Claude Code needs your approval for certain actions. It will ask first.

### "I want to go back to Claude.ai for planning"

That's fine! Use Claude.ai for strategy/planning, then bring the output to Claude Code for implementation. Just remember they don't share context - you'll need to copy/paste between them.

## Need to Switch Back to Claude.ai?

No problem. The CLAUDE.md file won't interfere with anything - it's just a markdown file. Your workflow with me stays exactly the same.

## Next Steps

1. Copy files as shown above
2. Run `claude` in your project directory
3. Try: `"Explain the current vault architecture"`
4. Try: `"Show me what components need updating for the white theme"`
5. Get comfortable with the interface

## Questions?

The `/docs` folder has all your strategic documents. CLAUDE.md has all the technical context. Claude Code can reference both.

**Try asking Claude Code:**
- "What's our current deployment workflow?"
- "What are the key design decisions from Product_Decisions.docx?"
- "Help me understand the two-phase fund structure"

---

**Good luck!** You're about to have a single-source-of-truth development environment with no more copy-paste between Claudes.
