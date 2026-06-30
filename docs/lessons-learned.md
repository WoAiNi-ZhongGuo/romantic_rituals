# Project Lessons Learned

## Quick Index

| Type | Issue | Checklist |
|---|---|---|
| Deploy | SPA subpath blank page | Set base + BrowserRouter basename |
| Deploy | GH Actions env protection rule | Omit environment field |
| Deploy | PAT lacks workflow scope | Add workflow scope to token |
| Code | Same concept two implementations | Keep utilities in one place |
| Process | Local vs production mismatch | Test with vite preview first |

---

## 1. SPA Blank Page on Subpath

Symptom: HTML/JS/CSS load fine, page stays white.

Root cause:
- Vite base default ./ needs absolute path like /project-name/ for GitPages subpath
- React Router BrowserRouter needs basename prop to strip subpath prefix

Fix:
```
// vite.config.ts
base: process.env.VITE_BASE_PATH || "/project-name/"
// App.tsx
<BrowserRouter basename="/project-name">
```

Checklist:
- [ ] Build output HTML uses absolute paths starting with subpath
- [ ] Local vite preview at localhost:4173/subpath/

---

## 2. GH Actions Deployment Rejected

Symptom: Branch not allowed to deploy to github-pages.

Root cause: Git auto-creates github-pages environment when selecting Actions as Pages source. Default branch policy denies all.

Fix: Remove environment from workflow.

Checklist:
- [ ] Workflow omits environment or env has branch whitelist

---

## 3. PAT Missing Workflow Scope

Symptom: Cannot push workflow file changes.

Root cause: Modifying .github/workflows/ needs separate workflow scope.

Fix: Create token with both repo/contents and workflow permissions upfront.

---

## 4. Same Concept Two Implementations

Symptom: CLI script and runtime function produce different results.

Root cause: pnpm hash script used hex encoding, auth.ts used a different custom hash.

Fix: Keep one canonical implementation shared by CLI and runtime.

Checklist:
- [ ] CLI tools and runtime call the same function
- [ ] Tests assert known input-output pairs

---

## 5. Local vs Production Mismatch

This is the meta-cause behind all issues above.

Prevention:
- Run pnpm build && pnpm preview before deploying
- Open DevTools Network tab (verify 200 on all assets)
- Open DevTools Console (verify no errors)
- Test in incognito window to bypass cache
- Walk through full user flow on production URL after deploy

---

## Pre-Deploy Checklist

- [ ] Confirm deploy platform URL structure (root vs subpath)
- [ ] Set framework base path and router basename accordingly
- [ ] PAT includes workflow scope if workflow files exist
- [ ] Verify GH Actions environment protection rules
- [ ] All env-specific logic uses one implementation
- [ ] env values match GitHub Secrets
- [ ] env is in gitignore
- [ ] Build and preview locally before push
- [ ] Check Network + Console tabs after local preview
- [ ] Test in incognito window to bypass cache
- [ ] After deploy verify all assets load on production URL