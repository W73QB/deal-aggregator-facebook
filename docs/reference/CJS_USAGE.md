# CommonJS (.cjs) Usage Documentation

## Overview

This project uses a **hybrid module system**: ESM (ES Modules) for frontend and modern code, CommonJS (.cjs) for backend and automation scripts.

## Why CommonJS for Backend?

### Primary Reasons

1. **Express Ecosystem Compatibility**: Many Express middleware packages are built for CommonJS
2. **Legacy Dependencies**: Core backend dependencies (bcrypt, pg, winston) work better with CJS
3. **Synchronous Requires**: Some database connection and config loading patterns require synchronous imports
4. **Testing Infrastructure**: Jest and testing utilities have better CJS support
5. **Stable Production**: CJS is more stable for Node.js server environments

## File Inventory

### Server Files (CJS Required)
- `server/app.cjs` - Main Express server
- `server/test/e2e-launcher.cjs` - E2E test launcher

### Automation Scripts (CJS for Node.js execution)
- `automation/viral-distribution-engine.cjs`
- `automation/daily-automation-master.cjs`
- `automation/complete-automation-master.cjs`
- `automation/facebook-compliance-system.cjs`
- `automation/smart-content-generator.cjs`
- `automation/advanced-blog-engine.cjs`

### Configuration Files (CJS Convention)
- `.eslintrc.cjs` - ESLint requires CJS config in ESM projects
- `cypress.config.cjs` - Cypress configuration

### Content Templates (CJS for require() usage)
- `content/email-newsletter-templates.cjs`
- `content/facebook-post-templates.cjs`

### Monitoring (CJS for production stability)
- `monitoring/error-tracker.cjs`

### Utilities (Legacy)
- `test-new-schema.cjs` - Database schema testing

## Migration Strategy

### Keep as CJS
- Server files (server/)
- Automation scripts (automation/)
- Configuration files (*.config.cjs)
- Monitoring scripts (monitoring/)

### Consider ESM Migration (Future)
- Content templates (content/*.cjs) → Could become .js with ESM exports
- Test utilities → When Jest adds better ESM support

### Already ESM
- All frontend code (pages/, components/, lib/)
- Next.js configuration (next.config.js)
- Modern utilities and helpers

## Best Practices

1. **Use .cjs extension explicitly** for CommonJS files in an ESM project
2. **Use .js for ESM** (default in package.json type: "module")
3. **Avoid mixing** ESM and CJS in the same module
4. **Document reasons** for using CJS in file headers

## Future Considerations

- **External API project** (`external-api/`) already uses full ESM
- When Express ecosystem fully supports ESM, consider migrating server/
- Monitor Jest ESM support for testing migration
