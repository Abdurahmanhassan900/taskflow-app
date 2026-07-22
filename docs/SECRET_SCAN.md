# Git history secret scan (manual review)

**Scan date:** 2026-07-22  
**Revision reviewed:** Phase 1 release candidate (pre-`v1-platform-hosted`)

## How to re-run locally

```bash
# Hardcoded Supabase-style credentials (removed from current branch tip)
git log --all -p -G 'DevSecOps21|postgres\\.cwlrardjyfxneexevlmm' -- '*.js'

# Ensure no .env files were committed
git log --all --name-only -- '*.env' ':!*.example'

# TruffleHog or gitleaks (if installed)
# gitleaks detect --source . -v
```

## Findings

| Item | Status on current branch tip | Action |
|---|---|---|
| `DevSecOps21` in `backend/index.js` | **Removed** in Prisma/JWT branches | Rotate Supabase password if this value was ever used in production |
| Hardcoded `postgres.cwlrardjyfxneexevlmm` user | **Removed** from current `index.js` | Confirm Render uses env vars only |
| `backend/.env` | **Gitignored** — not in tree | Keep gitignored |
| Test passwords in `backend/tests/` | Present (`Password1!`) | Test-only; acceptable |
| Seed dev password in `prisma/seed.ts` | Present (`local-dev-only-change-me`) | Dev-only; document in README |
| `docker-compose.yml` dev creds | `taskuser`/`taskpass` | Local dev only |

## Recommendation

1. **Rotate** Supabase database password if `DevSecOps21` or similar ever appeared in a deployed environment.
2. **Rotate** `JWT_SECRET` and `JWT_REFRESH_SECRET` on Render if there is any doubt they were exposed.
3. **Do not** rewrite public git history without team agreement; document rotation instead.
4. Re-run this scan before tagging `v1-platform-hosted`.

## Sign-off

- [ ] Secret scan reviewed by: _______________
- [ ] Production secrets rotated if needed: Yes / No / N/A
