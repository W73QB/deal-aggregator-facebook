# Manual Testing Guide - UI/UX Phase 1-3 Implementation

**Created:** 2025-10-03
**Phase:** Post-Deployment Manual QA
**Status:** REQUIRES DEPLOYMENT

---

## ⚠️ Prerequisites

**The following tests CANNOT be performed locally** and require deployment to staging/production:

1. **Authentication System** - Favorites/Save functionality requires `/api/auth` backend
2. **Live API Endpoints** - Newsletter and favorites need working API endpoints
3. **Browser DevTools** - Mobile responsive testing requires browser environment
4. **Screen Reader Tools** - Accessibility testing needs macOS VoiceOver or similar

---

## 📋 Test Checklist

### ✅ Phase 1: Accessibility & Basic Functionality

#### 1.1 CategoryIcon Accessibility
- [ ] **Inspect Element** on any category icon
- [ ] Verify `aria-hidden="true"` attribute exists
- [ ] Verify `focusable="false"` attribute exists
- [ ] **Expected:** Icons are hidden from screen readers (decorative only)

**Location:** All pages with category icons (HomePage, DealsPage, etc.)
**Files:** `components/icons/CategoryIcon.js:27`

#### 1.2 Shop Deal Button - With Affiliate URL
- [ ] Navigate to `/deals` page
- [ ] Find a deal with affiliate link (check console if needed)
- [ ] Click **"🛒 Shop Deal"** button
- [ ] **Expected:** Opens affiliate URL in new tab
- [ ] **Expected:** URL has proper UTM parameters and tracking
- [ ] Right-click button → Inspect → Verify `rel="nofollow sponsored noopener noreferrer"`

**Location:** DealsPage
**Files:** `components/pages/DealsPage.js:323-332`

#### 1.3 Shop Deal Button - Without Affiliate URL
- [ ] Find a deal WITHOUT affiliate link (or modify data for testing)
- [ ] **Expected:** Button shows "🛒 Coming Soon"
- [ ] **Expected:** Button is disabled (grayed out, not clickable)
- [ ] Inspect button → Verify `disabled` attribute and `.disabled` class
- [ ] **Expected:** CSS applies `opacity: 0.5`, `cursor: not-allowed`

**Location:** DealsPage
**Files:** `components/pages/DealsPage.js:333-341`, `css/styles.css:376-381`

#### 1.4 HomePage View Deal Button
- [ ] Navigate to `/` (homepage)
- [ ] Scroll to "Featured Deals" section
- [ ] Click **"View Deal"** button on a deal
- [ ] **Expected:**
   - If deal has affiliateUrl → Opens in new tab
   - If no affiliateUrl → Redirects to `/deals` page
- [ ] Verify both scenarios work correctly

**Location:** HomePage
**Files:** `components/pages/HomePage.js:34-48`

---

### ✅ Phase 2: Newsletter Integration

#### 2.1 Newsletter Form - HomePage
- [ ] Navigate to `/` (homepage)
- [ ] Scroll to "Never Miss a Deal!" section
- [ ] Enter **invalid email** (e.g., "test")
- [ ] Click "Get Deal Alerts"
- [ ] **Expected:** Shows error message "Please enter a valid email address"
- [ ] Enter **valid email** (e.g., "test@example.com")
- [ ] Click "Get Deal Alerts"
- [ ] **Expected:**
   - Button shows "Subscribing..." with disabled state
   - Success message appears (green background)
   - Email input clears
- [ ] **Test error case:** Disconnect internet → Try submitting
   - **Expected:** Error message appears (red background)

**Location:** HomePage section#newsletter
**Files:** `components/pages/HomePage.js:102-132`, `hooks/useNewsletter.js`

#### 2.2 Newsletter Form - DealsPage
- [ ] Navigate to `/deals` page
- [ ] Scroll to bottom "Deal Alert CTA" section
- [ ] Perform same tests as 2.1 above
- [ ] **Expected:** Same behavior (uses same hook)
- [ ] Verify CSS styling matches HomePage

**Location:** DealsPage .deal-alert-cta
**Files:** `components/pages/DealsPage.js:370-400`

#### 2.3 Newsletter Form - Layout Footer
- [ ] On ANY page, scroll to footer
- [ ] Find newsletter form in footer
- [ ] Perform same tests as 2.1 above
- [ ] **Expected:** Same behavior (refactored to use hook)
- [ ] This was previously working, verify refactor didn't break it

**Location:** Layout footer
**Files:** `components/Layout.js:14-21, 278+`

#### 2.4 Newsletter Message Styling
- [ ] Trigger success message
- [ ] Inspect message element
- [ ] **Expected CSS:**
   - `.newsletter-message.success` - Green bg (#d4edda), green text (#28a745)
   - Border: 1px solid #c3e6cb
   - Padding: 0.5rem 1rem, border-radius: 4px
- [ ] Trigger error message
- [ ] **Expected CSS:**
   - `.newsletter-message.error` - Red bg (#f8d7da), red text (#dc3545)
   - Border: 1px solid #f5c6cb

**Files:** `css/styles.css:1499-1516`

---

### ✅ Phase 3: Favorites/Save Functionality

⚠️ **CRITICAL:** These tests require authentication system to be working!

#### 3.1 Save Button - Logged Out State

**Prerequisites:** User is NOT logged in (clear session/cookies)

- [ ] Navigate to `/deals` page
- [ ] Hover over **"🤍 Save"** button on any deal
- [ ] **Expected:** Tooltip shows "Please log in to save favorites"
- [ ] Click **"🤍 Save"** button
- [ ] **Expected:**
   - Button tries to call `toggleFavorite()`
   - `useFavorites` hook detects `!isAuthenticated`
   - Error alert appears at top: "⚠️ Please log in to manage favorites"
   - Alert has yellow background (`.favorites-error` styling)
- [ ] Verify error alert has `role="alert"` and `aria-live="polite"`

**Location:** DealsPage
**Files:** `components/pages/DealsPage.js:278-286, 342-354`, `hooks/useFavorites.js:17-21`

#### 3.2 Save Button - Logged In State

**Prerequisites:** User is logged in with valid session

- [ ] Navigate to `/deals` page
- [ ] Click **"🤍 Save"** button on a deal
- [ ] **Expected:**
   - Button shows loading state (disabled)
   - API call to `POST /api/deals/{dealId}/favorite`
   - Button changes to **"❤️ Saved"** (green background)
   - CSS class `.deal-button.secondary.active` applied
   - Background: #28a745 (green)
- [ ] Hover over saved button
- [ ] **Expected:** Darker green on hover (#218838)
- [ ] Click **"❤️ Saved"** button again (unsave)
- [ ] **Expected:**
   - API call to `DELETE /api/deals/{dealId}/favorite`
   - Button changes back to **"🤍 Save"** (original style)
   - Green background removed

**Files:** `components/pages/DealsPage.js:125-141, 342-354`, `css/styles.css:1519-1528`

#### 3.3 Save Button - Error Handling

**Test Scenario 1:** Network Error
- [ ] Open DevTools → Network tab → Set to "Offline"
- [ ] Try to save a deal
- [ ] **Expected:**
   - Error alert appears: "⚠️ Network error. Please try again."
   - Button returns to original state
   - No state change persisted

**Test Scenario 2:** API Error (500)
- [ ] Mock API to return 500 error
- [ ] Try to save a deal
- [ ] **Expected:**
   - Error alert shows API error message
   - Button returns to original state

**Test Scenario 3:** Authentication Expired
- [ ] Clear auth token mid-session
- [ ] Try to save a deal
- [ ] **Expected:** Error message about authentication

**Files:** `hooks/useFavorites.js:51-57`

#### 3.4 Favorites State Persistence
- [ ] Save 3-5 deals
- [ ] Refresh page (F5)
- [ ] **Expected:** Saved deals still show **"❤️ Saved"** state
- [ ] This requires `/api/deals/favorites` endpoint to return user's favorites
- [ ] Verify `getFavorites()` is called on component mount (if implemented)

#### 3.5 Save Button Accessibility
- [ ] Use keyboard only (no mouse)
- [ ] Tab to **"🤍 Save"** button
- [ ] **Expected:** Button receives focus indicator
- [ ] Press Enter
- [ ] **Expected:** Same behavior as clicking
- [ ] Screen reader test:
   - Enable VoiceOver (Cmd+F5 on macOS)
   - Tab to Save button
   - **Expected:** Reads "Save [deal title] to favorites" or "Remove [deal title] from favorites"
   - **Expected:** Reads "button, dimmed" when disabled

**Files:** `components/pages/DealsPage.js:346-350` (aria-label)

---

### ✅ Mobile Responsive Testing

#### 4.1 Mobile Layout - 375px (iPhone SE)
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
- [ ] Select "iPhone SE" (375px width)
- [ ] Navigate through all pages: `/`, `/deals`
- [ ] **Expected:**
   - No horizontal scrolling
   - All text readable (not cut off)
   - Buttons fully clickable (not overlapping)
   - Images scale properly
   - Newsletter forms stack vertically
   - Deal cards stack in single column

#### 4.2 Tablet Layout - 768px (iPad)
- [ ] Set device to iPad (768px width)
- [ ] **Expected:**
   - Deal cards show 2 columns
   - Filters layout adapts
   - All buttons accessible

#### 4.3 Desktop Layout - 1920px
- [ ] Set viewport to 1920x1080
- [ ] **Expected:**
   - Deal cards show 3-4 columns
   - Max-width container keeps content readable
   - No excessive whitespace

**Files:** `css/styles.css` (media queries), `components/pages/HomePage.module.css`

---

### ✅ Screen Reader Accessibility

**Tool:** macOS VoiceOver (Cmd+F5) or NVDA (Windows)

#### 5.1 Tab Navigation Order
- [ ] Start at top of `/deals` page
- [ ] Press Tab repeatedly
- [ ] **Expected order:**
   1. Header navigation links
   2. Category filter buttons
   3. Sort/filter dropdowns
   4. First deal's Shop Deal button
   5. First deal's Save button
   6. Second deal's Shop Deal button
   7. Second deal's Save button
   8. ... (continue through all deals)
   9. Newsletter email input
   10. Newsletter submit button
   11. Footer links

#### 5.2 Screen Reader Announcements
- [ ] Tab to **Shop Deal** button
- [ ] **Expected:** "Shop [Deal Title] at [Store], link, button"
- [ ] Tab to **Coming Soon** button
- [ ] **Expected:** "Link coming soon, button, dimmed"
- [ ] Tab to **Save** button
- [ ] **Expected:** "Save [Deal Title] to favorites, button"
- [ ] After saving, re-focus button
- [ ] **Expected:** "Remove [Deal Title] from favorites, button"

#### 5.3 Live Region Announcements
- [ ] Submit newsletter form (success)
- [ ] **Expected:** VoiceOver announces "Successfully subscribed!" (via aria-live="polite")
- [ ] Try to save deal while logged out
- [ ] **Expected:** VoiceOver announces error message (via aria-live="polite" on .favorites-error)

#### 5.4 Decorative Elements Hidden
- [ ] Tab through page with VoiceOver
- [ ] **Expected:** Category icons are NOT announced (aria-hidden="true")
- [ ] **Expected:** Only meaningful content is announced

---

## 🔧 Testing Tools Needed

### Browser DevTools
- Chrome DevTools (F12)
- Device Toolbar (Ctrl+Shift+M)
- Network Tab (for testing offline/errors)
- Elements Inspector (for verifying attributes)

### Screen Readers
- **macOS:** VoiceOver (Cmd+F5, built-in)
- **Windows:** NVDA (free) or JAWS (paid)
- **Chrome Extension:** ChromeVox (basic testing)

### API Testing
- Postman or curl (for manual API testing)
- Browser DevTools Console (for checking API calls)

---

## 📊 Testing Checklist Summary

| Category | Total Tests | Auth Required | Tools Required |
|----------|------------|---------------|----------------|
| Phase 1: Accessibility | 4 | No | Browser |
| Phase 2: Newsletter | 4 | No | Browser + API |
| Phase 3: Favorites | 5 | **YES** | Browser + Auth + API |
| Mobile Responsive | 3 | No | DevTools |
| Screen Reader | 4 | No | VoiceOver/NVDA |
| **TOTAL** | **20** | 5/20 | Various |

---

## 🚀 Deployment Requirements

Before manual testing can begin, ensure:

1. ✅ Code deployed to staging/production
2. ✅ `/api/newsletter` endpoint working (Phase 2)
3. ✅ `/api/auth` endpoint working (Phase 3)
4. ✅ `/api/deals/{id}/favorite` endpoint working (Phase 3)
5. ✅ `/api/deals/favorites` endpoint working (Phase 3)
6. ✅ Database tables for favorites exist
7. ✅ User authentication flow working (login/logout)

---

## 🐛 Known Limitations

### Cannot Test Locally:
1. **Favorites functionality** - Requires AuthContext with actual backend authentication
2. **Newsletter API** - Requires `/api/newsletter` endpoint with email service
3. **Mobile responsive** - Needs browser DevTools or real devices
4. **Screen reader** - Requires assistive technology software

### Can Test Now (Already Verified):
1. ✅ Build passes (`npm run build`)
2. ✅ All imports correct
3. ✅ CSS classes exist
4. ✅ Component structure valid
5. ✅ aria-attributes in code
6. ✅ No syntax errors

---

## 📝 Testing Notes Template

Use this template when performing manual tests:

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Environment:** [Staging/Production URL]
**Browser:** [Chrome 120, Safari 17, etc.]
**Auth Status:** [Logged In/Out]

### Test Results:

#### Phase 1.1: CategoryIcon Accessibility
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any observations]
- Screenshot: [If applicable]

#### Phase 2.1: Newsletter - HomePage
- Status: ✅ PASS / ❌ FAIL
- Invalid email test: [Result]
- Valid email test: [Result]
- Error handling: [Result]
- Notes: [Any observations]

[Continue for all tests...]

### Issues Found:
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]
   - Screenshot: [...]

### Summary:
- Total Tests: 20
- Passed: X
- Failed: Y
- Blocked: Z (auth not ready, etc.)
- Coverage: X%
```

---

## ✅ Sign-Off Criteria

Manual testing is COMPLETE when:

- [ ] All 20 tests executed
- [ ] Pass rate ≥ 95% (19/20 passing)
- [ ] No critical bugs found
- [ ] All accessibility tests pass
- [ ] Mobile responsive on 3+ device sizes
- [ ] Screen reader testing complete
- [ ] Documentation updated with findings

---

**END OF MANUAL TESTING GUIDE**

*Generated by Phase 4C automated process*
*Last updated: 2025-10-03 15:30*
