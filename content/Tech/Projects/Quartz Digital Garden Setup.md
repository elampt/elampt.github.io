
This documents how my digital garden at [elampt.github.io](https://elampt.github.io) works - from Obsidian notes to published website.

## What is Quartz?

**Quartz** is a static site generator designed specifically for publishing Obsidian notes as a website. It transforms markdown files into a beautiful, interlinked website with features like:
- Backlinks & graph view
- Full-text search
- Wikilinks support (`[[link]]`)
- Tags, table of contents
- Dark/light mode

## Project Structure

```
quartz/
├── content/                 ← OBSIDIAN VAULT (markdown notes)
│   ├── .obsidian/          ← Obsidian settings (ignored during build)
│   ├── Better Tomorrow/
│   ├── Books/
│   ├── Tech/
│   ├── private/            ← Ignored (won't be published)
│   └── index.md            ← Homepage
├── quartz/                  ← Quartz engine (don't modify)
├── quartz.config.ts         ← Site configuration (title, theme, plugins)
├── quartz.layout.ts         ← Page layout configuration
└── public/                  ← Generated HTML (built output)
```

## The Flow: Obsidian → GitHub → Website

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│   OBSIDIAN      │     │   LOCAL QUARTZ   │     │   GITHUB REPO      │     │   GITHUB PAGES      │
│   (Your notes)  │ ──► │   (This folder)  │ ──► │   (v4 branch)      │ ──► │   elampt.github.io  │
└─────────────────┘     └──────────────────┘     └────────────────────┘     └─────────────────────┘
     Edit .md              npx quartz sync         Push triggers             Static HTML served
     files here            commits & pushes        GitHub Actions
```

### Step-by-step

1. **Write notes in Obsidian**
   - The `content/` folder IS the Obsidian vault
   - Any `.md` file created/edited here becomes a page

2. **Run `npx quartz sync`**
   - Commits all changes to git
   - Pushes to GitHub repo

3. **GitHub Actions triggers**
   - Detects push to `v4` branch
   - Runs `npx quartz build` on GitHub's servers
   - Converts all markdown → HTML in `public/` folder

4. **GitHub Pages deploys**
   - Uploads the `public/` folder
   - Serves it at **https://elampt.github.io/**

## Key Configuration

Configuration is in `quartz.config.ts`:

| Setting | Value | What it does |
|---------|-------|--------------|
| `pageTitle` | "Elambharathi Thangavel" | Site title |
| `ignorePatterns` | `["private", "templates", ".obsidian"]` | Files/folders that won't be published |
| `enablePopovers` | `true` | Hover previews on links |
| `ObsidianFlavoredMarkdown` | enabled | Supports `[[wikilinks]]`, callouts, etc. |

## Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Obsidian vault | `content/` folder | Write notes |
| Quartz engine | `quartz/` folder | Transforms markdown → HTML |
| Config | `quartz.config.ts` | Customize site appearance |
| Sync command | `npx quartz sync` | Commit + push + backup |
| CI/CD | `.github/workflows/deploy.yml` | Auto-build on GitHub |
| Live site | https://elampt.github.io/ | Published website |

## Notes

- The `private/` folder and `.obsidian/` settings are safely ignored and never published
- The GitHub repo moved from `first-blog-publish` to `elampt.github.io`
