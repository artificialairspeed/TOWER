# Accessibility Quick Reference Guide
## For Developers and QA

**Application:** Deployment Notification Generator Portal
**Compliance Target:** WCAG 2.1 Level AA
**Last Updated:** 2025-01-22

---

## Quick Testing Checklist

### Keyboard Navigation (2 minutes)
- [ ] Tab through all form fields - should navigate in logical order
- [ ] Shift+Tab - should navigate backward
- [ ] Enter on buttons - should activate
- [ ] Space on radio buttons/checkboxes - should toggle
- [ ] Arrow keys in dropdowns - should move through options
- [ ] Escape on dialogs - should close dialog

**Expected:** All features fully controllable via keyboard, no mouse needed.

### Focus Indicators (1 minute)
- [ ] Tab to any element
- [ ] Verify visible blue outline (or custom indicator)
- [ ] Check that outline clearly marks the focused element
- [ ] Check outline is not removed or hidden

**Expected:** Clear, visible focus indicator on every element.

### Zoom Testing (3 minutes)
- [ ] Press Ctrl++ (Cmd++ on Mac) repeatedly to zoom to 200%
- [ ] Verify no horizontal scrolling needed
- [ ] Verify all content readable
- [ ] Zoom to 400% (press Ctrl++ multiple more times)
- [ ] Verify content reflows to single column
- [ ] Verify keyboard still works
- [ ] Reset zoom with Ctrl+0 (Cmd+0 on Mac)

**Expected:** Full functionality at all zoom levels.

### Screen Reader (5 minutes - requires NVDA/JAWS/VoiceOver)
- [ ] Enable screen reader
- [ ] Navigate with Tab key
- [ ] Verify field labels announced
- [ ] Verify error messages announced
- [ ] Verify button labels announced
- [ ] Submit form with missing field
- [ ] Verify error alert announced immediately

**Expected:** All content clearly announced, errors immediately apparent.

### Color Contrast (1 minute)
- [ ] Open browser DevTools (F12)
- [ ] Click Accessibility panel
- [ ] Select text elements
- [ ] Check contrast ratio shown
- [ ] Verify 4.5:1 for normal text, 3:1 for UI components

**Expected:** All contrast ratios meet requirements.

### High Contrast Mode (Windows, 2 minutes)
- [ ] Settings → Ease of Access → Display → Turn on high contrast
- [ ] Select different high contrast theme
- [ ] Verify text readable
- [ ] Verify buttons distinguishable
- [ ] Verify focus indicators visible
- [ ] Turn off high contrast

**Expected:** Full functionality in all contrast modes.

---

## Common Accessibility Issues to Avoid

### ❌ DON'T
- Remove focus indicators with `outline: none` without replacing them
- Use color alone to indicate state or error
- Create keyboard-only traps
- Forget to label form inputs
- Use placeholder text as label
- Forget to escape user input (causes XSS and breaks accessibility)
- Create elements that require mouse precision
- Use `<div>` for buttons instead of `<button>`
- Forget to close dialogs properly
- Hide content with `display: none` if it should be accessible

### ✅ DO
- Provide visible focus indicators on all interactive elements
- Use both color and text/icon for status indication
- Keep tab order logical
- Always label form inputs with `<label>` or `aria-label`
- Use semantic HTML (`<button>`, `<input>`, etc.)
- Escape user content before rendering
- Make all functionality keyboard accessible
- Use native elements and let them handle accessibility
- Manage focus in modals and dialogs
- Hide content semantically (if truly not needed)

---

## ARIA Quick Reference

### Most Used ARIA Attributes

| Attribute | Usage | Example |
|-----------|-------|---------|
| `aria-label` | Describe element purpose | `<button aria-label="Close dialog">×</button>` |
| `aria-labelledby` | Link to heading | `<section aria-labelledby="section-title">` |
| `aria-describedby` | Link to description | `<input aria-describedby="help-text">` |
| `aria-invalid` | Mark error state | `<input aria-invalid={hasError}>` |
| `aria-live` | Announce updates | `<div aria-live="polite">Status: {status}</div>` |
| `role="alert"` | Urgent announcement | `<Alert role="alert">Error message</Alert>` |
| `role="status"` | Non-urgent status | `<div role="status">Saved</div>` |
| `aria-expanded` | Show expand/collapse | `<button aria-expanded={isOpen}>Show/Hide</button>` |

---

## Component Accessibility Patterns

### Form Input Pattern
```typescript
<TextField
  label="Email Address"
  value={email}
  onChange={handleChange}
  error={!!emailError}
  helperText={emailError}
  slotProps={{
    htmlInput: {
      'aria-label': 'Email address',
      'aria-describedby': emailError ? 'email-error' : 'email-help',
      'aria-invalid': !!emailError
    }
  }}
/>
{emailError && (
  <Alert severity="error" role="alert">
    {emailError}
  </Alert>
)}
```

### Button Pattern
```typescript
<Button
  onClick={handleClick}
  aria-label="Remove item"
  // If icon-only, aria-label is required
>
  Delete
</Button>
```

### Expandable Content Pattern
```typescript
<Box
  role="button"
  tabIndex={0}
  onClick={toggleExpanded}
  onKeyDown={(e) => e.key === 'Enter' && toggleExpanded()}
  aria-expanded={isExpanded}
  aria-label="Expand/collapse section"
>
  {isExpanded ? <ExpandLess /> : <ExpandMore />}
</Box>
```

### Alert/Status Pattern
```typescript
// Urgent - use assertive
<Alert role="alert" aria-live="assertive">
  Error message
</Alert>

// Non-urgent - use polite
<Alert role="status" aria-live="polite">
  Info message
</Alert>
```

---

## Screen Reader Testing Commands

### NVDA (Windows)
- **Start:** Ctrl + Alt + N
- **Quit:** Insert + Q
- **Read All:** Insert + Down Arrow
- **Next Element:** Arrow Down
- **Previous Element:** Arrow Up
- **Focus Mode:** Insert + Space
- **Browse Mode:** Escape

### VoiceOver (macOS)
- **Start:** Cmd + F5 (or System Preferences)
- **Stop:** Cmd + F5
- **Read All:** VO + A (VO = Control + Option)
- **Next Element:** VO + Right Arrow
- **Previous Element:** VO + Left Arrow
- **Rotor:** VO + U (for quick navigation)

### JAWS (Windows - Commercial)
- **Start:** Windows Key + J
- **Stop:** Insert + Q
- **Read All:** Insert + Down Arrow
- **Heading List:** H
- **Form Fields:** F

---

## Testing Tools and Resources

### Browser DevTools
- **Chrome:** DevTools → Elements → Accessibility panel
- **Firefox:** Inspector → Accessibility tab
- **Safari:** Develop menu → Accessibility

### Automated Testing
- **axe DevTools:** Browser extension for accessibility audits
- **Wave:** Web accessibility evaluation tool
- **Lighthouse:** Chrome DevTools accessibility audit

### Color Contrast
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Accessible Colors:** https://accessible-colors.com/

### WCAG Reference
- **WCAG 2.1 Quick Reference:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/

---

## Accessibility by Component

### ApplicationSelector
**Accessible:** ✅
- Has aria-label
- Error messages displayed in alert
- Keyboard navigable
- Disabled when empty

**Testing:**
- Tab to dropdown
- Press Enter to open
- Use arrow keys to navigate
- Press Enter to select

### DeploymentInfoSection
**Accessible:** ✅
- All fields have labels and descriptions
- Required fields marked
- Validation errors announced

**Testing:**
- Tab through all three fields
- Verify labels announced
- Leave field empty, verify error shown

### ScheduleSection
**Accessible:** ✅
- Date/time pickers keyboard accessible
- Validation errors announced
- Clear field descriptions

**Testing:**
- Tab to date picker
- Use arrow keys to select date
- Verify error for invalid time range

### OutageSection
**Accessible:** ✅
- Radio buttons properly labeled
- Conditional fields accessible
- Validation errors announced

**Testing:**
- Tab to Yes/No option
- Use arrow keys to switch
- Toggle to Yes and verify outage fields appear
- Toggle back to No and verify fields disappear

### ChangeItemsSection
**Accessible:** ✅
- Item count announced via live region
- Remove buttons have descriptive labels
- Add/Remove disabled states clear

**Testing:**
- Add item, verify count announced
- Tab to remove button, verify label includes item content
- Remove item, verify count updated

### ImpactSection
**Accessible:** ✅
- Item count announced
- Maximum capacity warning announced
- Remove buttons labeled
- Disabled states clear

**Testing:**
- Add multiple items
- Add 100th item - verify "maximum reached" warning
- Try to add 101st - should be disabled

### ContactSection
**Accessible:** ✅
- Format validation errors clear
- Field descriptions provided
- Error messages specific and actionable

**Testing:**
- Enter invalid email - verify error message
- Enter invalid phone - verify error message
- Leave field empty - verify required error

### ValidationErrorSummary
**Accessible:** ✅
- Alert immediately announced
- All errors listed
- Field-specific error messages

**Testing:**
- Try to generate with errors
- Verify alert announced immediately
- Verify all errors listed with specific fields

---

## Accessibility Acceptance Criteria

### Before Marking Task Complete:
- [ ] All form inputs keyboard navigable via Tab
- [ ] All buttons activatable via Enter
- [ ] No keyboard traps (can Tab backward and forward)
- [ ] All interactive elements have visible focus indicators
- [ ] Errors announced via ARIA live regions
- [ ] Error messages clearly identify field and problem
- [ ] At least one ARIA label or description on each input
- [ ] Semantic HTML used (headings, lists, sections)
- [ ] Color contrast meets 4.5:1 for text, 3:1 for UI
- [ ] Works at 200% zoom
- [ ] Works with High Contrast Mode
- [ ] No fixed widths that break layout at zoom

### Automated Checks:
```bash
# Run tests
npm test

# Check linting (includes accessibility rules)
npm run lint

# Manual accessibility check with browser
npm run dev
# Then open DevTools → Accessibility panel
```

---

## Reporting Accessibility Issues

### Issue Template
```
Title: [Component] - [Accessibility Barrier]

Type: [Keyboard/Screen Reader/Color Contrast/Focus/Zoom/Other]

Description:
[What is not accessible]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [etc]

Expected Behavior:
[What should happen]

Actual Behavior:
[What currently happens]

Affected Users:
[Screen reader users / Keyboard only / Low vision / etc]

Browser/Version:
[Chrome 120 / Firefox 121 / Safari 17 / etc]

Screenshots/Recording:
[If applicable]
```

---

## Continuous Improvement

### Monthly
- [ ] Run automated accessibility audit (axe, Wave)
- [ ] Review any new issues reported

### Quarterly
- [ ] Test on multiple browsers
- [ ] Test with actual screen reader
- [ ] Test zoom functionality
- [ ] Review WCAG updates

### Annually
- [ ] Full accessibility audit by external expert
- [ ] User testing with disabled users
- [ ] Update accessibility documentation

---

## Key Contacts

**Accessibility Questions:** [Development Lead]
**Bug Reports:** [Project GitHub Issues]
**User Feedback:** [feedback@example.com]

---

## Quick Links

- [Full Accessibility Report](./ACCESSIBILITY_TEST_REPORT.md)
- [WCAG 2.1 Compliance Checklist](./WCAG_21_COMPLIANCE_CHECKLIST.md)
- [Features Summary](./ACCESSIBILITY_FEATURES_SUMMARY.md)
- [Testing Guide](./ACCESSIBILITY_TESTING_GUIDE.md)

---

**Remember:** Accessibility is not a feature - it's a requirement! Test regularly and include users with disabilities in your testing.

