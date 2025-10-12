# Lint Error Inventory & Remediation Plan

**Generated:** 2025-10-12
**Status:** In Progress - Phase 2.1 Complete

## 📊 Summary

### Before ESLint Config Update:
- **Total Problems:** 655
- **Errors:** 470
- **Warnings:** 185

### After ESLint Config Update:
- **Total Problems:** 307 (-348, 53% reduction!)
- **Errors:** 142 (-328, 70% reduction!)
- **Warnings:** 165 (-20, 11% reduction!)

## 🎯 What Was Fixed

### 1. Added Global Declarations
```javascript
globals: {
  cy: 'readonly',           // Cypress commands
  Cypress: 'readonly',      // Cypress API
  describe: 'readonly',     // Test framework
  it: 'readonly',
  expect: 'readonly',
  // ... and more test globals
}
```

**Impact:** Fixed ~353 `no-undef` errors for `cy` and `Cypress` in test files.

### 2. Added Override Rules for Legacy Code
```javascript
overrides: [
  {
    files: ['automation/**/*.js', 'tools/**/*.js', 'backups/**/*.js', 'assets/products/**/*.js'],
    rules: {
      'no-useless-escape': 'warn',     // Downgrade to warning
      'no-unused-vars': 'warn',
      'no-inner-declarations': 'warn'
    }
  }
]
```

**Impact:** Downgraded 68 `no-useless-escape` errors to warnings in legacy scripts.

## 📋 Remaining Issues (307 total)

### Critical Errors (142 total)

#### 1. React Hooks Violations (~15 errors)
**Type:** `react-hooks/rules-of-hooks`
**Example:**
```javascript
// __tests__/components/ui/AuthButtons.test.js:22
error: React Hook "useRouter" cannot be called inside a callback
```

**Impact:** HIGH - These are real bugs that will cause runtime errors
**Priority:** CRITICAL - Must fix before production
**Effort:** 2-4 hours

**Affected Files:**
- `__tests__/components/ui/AuthButtons.test.js`
- `__tests__/pages/login.test.js`

**Fix Strategy:**
```javascript
// ❌ WRONG - Hook in callback
const handleClick = () => {
  const router = useRouter(); // ERROR!
  router.push('/login');
};

// ✅ CORRECT - Hook at top level
const router = useRouter();
const handleClick = () => {
  router.push('/login');
};
```

#### 2. Next.js Link Usage (~40 errors)
**Type:** `no-html-link-for-pages`
**Example:**
```javascript
error: Do not use an `<a>` element to navigate to `/about`. Use `<Link />` from `next/link` instead
```

**Impact:** MEDIUM - Performance issue, not functional bug
**Priority:** HIGH - Should fix for better performance
**Effort:** 1-2 hours (can be automated)

**Fix Strategy:**
```javascript
// ❌ WRONG
<a href="/about">About</a>

// ✅ CORRECT
import Link from 'next/link';
<Link href="/about">About</Link>
```

#### 3. Switch Case Declarations (~17 errors)
**Type:** `no-case-declarations`
**Example:**
```javascript
case 'START':
  const action = 'start'; // ERROR!
  break;
```

**Impact:** LOW - Works but not best practice
**Priority:** MEDIUM
**Effort:** 30 minutes

**Fix Strategy:**
```javascript
// ✅ CORRECT - Add braces
case 'START': {
  const action = 'start';
  break;
}
```

#### 4. Duplicate Keys (~2 errors)
**Type:** `no-dupe-keys`
**Priority:** CRITICAL - Can cause unexpected behavior
**Effort:** 5 minutes

#### 5. Module Variable Assignment (~2 errors)
**Type:** `no-assign-module-variable`
**Priority:** CRITICAL - Will fail in strict mode
**Effort:** 10 minutes

### Warnings (165 total)

#### 1. Unused Variables (~120 warnings)
**Type:** `no-unused-vars`
**Example:**
```javascript
warning: 'navigation' is assigned a value but never used
```

**Impact:** LOW - Code cleanliness
**Priority:** LOW
**Effort:** 1-2 hours (can be partially automated)

**Fix Strategy:**
- Remove if truly unused
- Prefix with `_` if intentionally unused (e.g., `_navigation`)
- Add to destructuring ignore pattern

#### 2. Next.js Image Usage (~10 warnings)
**Type:** `@next/next/no-img-element`
**Priority:** LOW - Performance optimization
**Effort:** 30 minutes

#### 3. Accessibility Issues (~5 warnings)
**Type:** `jsx-a11y/alt-text`
**Priority:** MEDIUM - Accessibility important
**Effort:** 15 minutes

## 🎯 Remediation Phases

### Phase 2.2: Critical Error Fixes (4-6 hours)
**Target:** Fix all critical errors that could cause runtime failures

- [ ] Fix React hooks violations (15 errors) - 2-4 hours
- [ ] Fix duplicate keys (2 errors) - 5 min
- [ ] Fix module variable assignments (2 errors) - 10 min
- [ ] Fix no-case-declarations (17 errors) - 30 min

**Goal:** Reduce errors from 142 to ~108

### Phase 2.3: Performance & Best Practices (2-3 hours)
**Target:** Fix issues that impact performance or best practices

- [ ] Convert `<a>` to `<Link>` (40 errors) - 1-2 hours
- [ ] Fix useless escape characters (remaining) - 30 min
- [ ] Fix accessibility issues (5 warnings) - 15 min

**Goal:** Reduce errors from 108 to <70

### Phase 2.4: Code Cleanup (Optional, 2-3 hours)
**Target:** Clean up warnings for better code quality

- [ ] Remove unused variables - 1-2 hours
- [ ] Convert `<img>` to Next.js `<Image>` - 30 min
- [ ] Clean up test files - 30 min

**Goal:** Reduce warnings from 165 to <50

## 📈 Success Metrics

### Minimum Viable (for production):
- ✅ 0 critical errors (hooks, dupe keys, module assignments)
- ✅ <100 total errors
- ✅ Build succeeds: `npm run build`
- ✅ Tests pass: `npm test`

### Ideal State:
- ✅ <50 total errors
- ✅ <50 warnings
- ✅ All core app files (pages/, components/, hooks/) have 0 errors
- ✅ CI/CD passes lint check

## 🛠️ Tools & Commands

### Run Lint
```bash
npm run lint                    # Run with --fix
npm run lint -- --no-fix        # Run without auto-fix
npm run lint -- --quiet         # Errors only
```

### Count Errors
```bash
npm run lint 2>&1 | grep "✖" | tail -1
```

### Find Specific Error Type
```bash
npm run lint 2>&1 | grep "react-hooks/rules-of-hooks"
```

### Fix Automatically (safe rules only)
```bash
npx eslint . --ext .js --fix
```

## 📝 Notes

- Automation scripts in `automation/`, `tools/`, `backups/` have relaxed rules
- Core application files have stricter enforcement
- Some errors in Cypress tests are expected during development
- Full cleanup not required before Phase 3 (CI/CD), but must pass before production

---

**Last Updated:** 2025-10-12
**Next Review:** After Phase 2.2 completion
**Document Owner:** DevOps Team
