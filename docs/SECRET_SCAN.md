# Git history secret scan (manual review)

**Scan date:** 2026-07-22  
**Status:** Phase 1 release candidate is undergoing final verification.

## How to re-run locally

```bash
# Search for historically committed database credentials (redacted patterns)
git log --all -p -G '<REDACTED_DB_PASSWORD>|<REDACTED_SUPABASE_HOST>' -- '*.js'

# Ensure no .env files were committed
git log --all --name-only -- '*.env' ':!*.example'

# Optional scanners (if installed)
# gitleaks detect --source . -v
# trufflehog git file://. --only-verified
```

Replace `<REDACTED_DB_PASSWORD>` and `<REDACTED_SUPABASE_HOST>` with patterns from your own rotation records. Do not commit those values to the repository.

## Findings

| Item | Status on current branch tip | Action |
|------|------------------------------|--------|
| Hardcoded database password in early `backend/index.js` | **Removed** from current tree | Treat as **compromised** if it was ever deployed; rotate Supabase password |
| Hardcoded Supabase pooler host/user in early commits | **Removed** from current tree | Confirm Render uses environment variables only |
| `backend/.env` | **Gitignored** — not tracked | Keep gitignored |
| Test passwords in `backend/tests/` | Present (test-only values) | Acceptable in test code only |
| Seed dev password in `prisma/seed.ts` | Present (documented dev-only value) | Do not reuse in production |
| `docker-compose.yml` dev credentials | Local-only `taskuser` / `taskpass` | Acceptable for local development |

## Recommendation

1. Any credential that appeared in git history must be treated as **compromised** and **rotated** before production release.
2. Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` on Render if there is any doubt they were exposed.
3. Do **not** rewrite public git history without team agreement; document rotation instead.
4. Re-run this scan before tagging `v1-platform-hosted`.

**Rotation status:** Not verified as part of automated CI. A human maintainer must confirm rotation separately.

## Sign-off

- [ ] Secret scan reviewed by: _______________
- [ ] Historically exposed credentials rotated: Yes / No / N/A
