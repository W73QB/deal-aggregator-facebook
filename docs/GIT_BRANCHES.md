# Git Branches Documentation

## Active Branches

### `main`
- **Purpose**: Production deployment branch
- **Status**: Active, deployed to Vercel
- **Last Updated**: 2025-10-08
- **Notes**: Primary branch for production deployments

### `vercel-routing-repro`
- **Purpose**: Investigation and reproduction of Vercel routing issues
- **Status**: Active development
- **Created**: 2025-10-08
- **Notes**: Working branch for debugging Vercel deployment and routing problems
- **Related Docs**:
  - `docs/VERCEL-ROUTING-ISSUE.md`
  - `docs/VERCEL-SUPPORT-TICKET.md`

## Branch Cleanup History

### Deleted on 2025-10-09
Removed 9 stale branches (2+ months old, merged to main):
- `chore/prep-refactor`
- `feat/config-loader`
- `feat/facebook-api-refactor`
- `feat/file-processor-utilities`
- `feat/dom-utils`
- `feat/social-sync-facebook-now`
- `feature/vercel-url-fix`
- `hotfix/remove-cicd-debugline`
- `legal-pages-test`

Additionally removed during earlier cleanup:
- 5 staging backup branches (staging-backup-2025100*)
- `backup-before-static-deploy`
- `nextjs-migration`, `nextjs-migration-backup`
- `feature/week1-cleanups-tracking`
- `feature/week1-performance-audit-config`

## Branch Naming Convention

Going forward, use these prefixes:
- `feat/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

## Notes

- Delete feature branches after merging to main
- Don't create backup branches (use git tags instead)
- Keep branch names descriptive and concise
