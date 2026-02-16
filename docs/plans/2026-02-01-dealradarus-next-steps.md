# DealRadarUS Next Steps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove legacy Next.js artifacts, set up GitHub Pages deployment, and document Cloudflare DNS setup for DealRadarUS.

**Architecture:** Keep a minimal Hugo-only repository (content + theme + config), deploy via GitHub Actions to GitHub Pages, and serve the apex domain via Cloudflare DNS with www redirect.

**Tech Stack:** Hugo v0.155.1, GitHub Actions (Pages), Cloudflare DNS

---

### Task 1: Identify keep vs delete inventory

**Files:**

- Review: root directory listing and Hugo-required paths

**Step 1: Confirm keep list**

Keep only Hugo essentials:

- `archetypes/`, `content/`, `layouts/`, `static/`, `themes/`, `hugo.toml`, `README.md`, `.gitignore`, `.github/` (new workflow), `docs/plans/`

**Step 2: Confirm delete list**

Everything else is legacy (Next.js, scripts, reports, logs, build output, automation, tests).

### Task 2: Remove legacy files and directories

**Files:**

- Delete: legacy directories (node_modules, .next, external-api, scripts, automation, tests, etc.)
- Delete: legacy files (vercel.json, netlify.toml, old reports, logs)

**Step 1: Delete legacy directories**

Run:

```bash
rm -rf node_modules .next nextjs-backup hugo-site public resources .vercel .vercel.backup __tests__ tests cypress coverage automation scripts external-api database dist logs backup backups ai hooks contexts utils tools monitoring reports media data blog config secrets
```

**Step 2: Delete legacy files**

Run:

```bash
rm -f vercel.json netlify.toml robots.txt sitemap.xml sitemap-index.xml build-complete.js test-new-schema.cjs test-railway-integration.cjs jest.config.cjs cypress.config.cjs
```

**Step 3: Prune legacy docs**

Keep only `docs/plans/` and remove other legacy docs subfolders.

### Task 3: Add GitHub Pages deployment workflow

**Files:**

- Create: `.github/workflows/deploy-pages.yml`

**Step 1: Add workflow**

Create a workflow that:

- installs Hugo v0.155.1 (extended)
- runs `hugo --gc --minify`
- uploads `public/` as Pages artifact
- deploys to GitHub Pages

### Task 4: Add CNAME and update .gitignore

**Files:**

- Create: `static/CNAME`
- Modify: `.gitignore`

**Step 1: Add CNAME**

`static/CNAME` should contain:

```
dealradarus.com
```

**Step 2: Update .gitignore**

Add Hugo build outputs and repo noise:

- `public/`, `resources/`, `.hugo_build.lock`, `.sisyphus/`
- Keep existing secret patterns

### Task 5: Update README for GitHub Pages + Cloudflare

**Files:**

- Modify: `README.md`

**Step 1: Replace Netlify/Vercel sections**

Add GitHub Pages instructions:

- Enable Pages: Settings → Pages → Deploy from GitHub Actions
- Workflow runs on push to `main`

Add Cloudflare DNS steps for apex canonical:

- A records for `dealradarus.com`
- CNAME for `www` to `dealradarus.com`
- Optional AAAA records

### Task 6: Verification

**Step 1: Build**

Run:

```bash
hugo --gc --minify
```

Expected: build succeeds and outputs to `public/`

**Step 2: Confirm output files**

Ensure:

- `public/CNAME` exists
- `public/robots.txt` generated from template

### Task 7: Commit

**Step 1: Commit changes**

```bash
git add -A
git commit -m "chore: clean repo and add GitHub Pages deploy"
```

---
