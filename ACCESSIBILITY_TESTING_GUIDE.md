# Manual Accessibility Testing Guide
## Deployment Notification Generator Portal

This guide provides step-by-step instructions for manual accessibility testing using screen readers, keyboard navigation, and browser features.

---

## Test Setup

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+)
- Application running at: `http://localhost:5173`
- Optional: Screen reader (NVDA for Windows, VoiceOver for macOS, JAWS for Windows)

### Starting the Application
```bash
cd /path/to/deployment-notification-generator
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## Test 1: Keyboard Navigation

### 1.1 Basic Tab Navigation

**Objective:** Verify all interactive elements are keyboard accessible in logical order.

**Test Steps:**
1. Load the application
2. Press `Tab` repeatedly and verify the focus moves through:
   - [ ] Application Selector dropdown
   - [ ] Change Number input
   - [ ] Release Version input
   - [ ] Environment dropdown
   - [ ] Deployment Date picker
   - [ ] Start Time picker
   - [ ] End Time picker
   - [ ] Outage Yes/No radio buttons
   - [ ] (If Outage=Yes) Outage Start Date/Time pickers
   - [ ] (If Outage=Yes) Outage End Date/Time pickers
   - [ ] Change Items section (inputs and buttons)
   - [ ] Impact Items section (inputs and buttons)
   - [ ] Contact Name input
   - [ ] Contact Email input
   - [ ] Contact Phone input
   - [ ] Theme selector (Light/Dark radio buttons)
   - [ ] Reset button
   - [ ] Remove button (if form count > 1)
   - [ ] Add Form button (if form count < 5)
   - [ ] Generate Outputs button

3. Verify no keyboard trap (can always press Tab to move forward)
4. Press `Shift+Tab` to navigate backward through same elements

**Expected Result:** All interactive elements are reachable via keyboard in logical reading order.

### 1.2 Dropdown/Select Navigation

**Objective:** Verify keyboard interaction with dropdown controls.

**Test Steps:**
1. Tab to Application Selector dropdown
2. Press `Enter` or `Space` to open dropdown
3. Use `Arrow Down` to move through options
4. Press `Enter` or `Space` to select an option
5. Verify dropdown closes and value is selected

**Repeat for:**
- [ ] Environment dropdown
- [ ] Any other dropdown/select controls

**Expected Result:** Dropdowns fully controllable via keyboard.

### 1.3 Button Activation

**Objective:** Verify buttons respond to keyboard activation.

**Test Steps:**
1. Tab to "Add Form" button
2. Press `Enter` to activate
3. Verify a new form is added
4. Tab to "Reset" button
5. Press `Enter` to activate
6. Verify reset confirmation dialog opens
7. Press `Enter` to confirm or `Escape` to cancel

**Repeat for:**
- [ ] Add Form button
- [ ] Remove button
- [ ] Reset button
- [ ] Generate Outputs button

**Expected Result:** All buttons activate via `Enter` key.

### 1.4 Radio Button Navigation

**Objective:** Verify radio button keyboard interaction.

**Test Steps:**
1. Tab to Theme Selector radio group
2. Verify focus is on currently selected option
3. Press `Arrow Right` or `Arrow Down` to move to next option
4. Verify new option becomes selected
5. Press `Arrow Left` or `Arrow Up` to move back
6. Verify previously selected option becomes selected

**Expected Result:** Radio buttons navigate and select via arrow keys.

### 1.5 Date Picker Navigation

**Objective:** Verify date picker keyboard accessibility.

**Test Steps:**
1. Tab to Deployment Date picker
2. Press `Enter` or `Space` to open date picker
3. Use `Arrow Keys` to navigate dates
4. Press `Enter` to select date
5. Verify picker closes and date is selected

**Expected Result:** Date pickers fully functional via keyboard.

### 1.6 Dialog Keyboard Interaction

**Objective:** Verify dialog focus trapping and keyboard commands.

**Test Steps:**
1. Click "Reset" button to open reset confirmation dialog
2. Verify focus moves into dialog (typically first button or title)
3. Press `Tab` to navigate between dialog buttons
4. Verify `Tab` cycles through dialog buttons only (not background elements)
5. Press `Enter` on "Confirm" button to accept reset
6. Verify focus returns to Reset button (or appropriate location)

**Repeat for:** [ ] Reset confirmation dialog

**Expected Result:** Dialog traps focus, requires keyboard action to close, and returns focus properly.

---

## Test 2: Focus Indicators

### 2.1 Focus Visibility

**Objective:** Verify focus is clearly visible on all elements.

**Test Steps:**
1. Load application
2. Press `Tab` and observe focus indicator
3. Move through multiple elements and verify:
   - [ ] Focus indicator is clearly visible
   - [ ] Focus indicator has sufficient contrast against background
   - [ ] Focus indicator is consistently styled
   - [ ] Focus indicator position is logical (around the element)

4. Focus on different element types:
   - [ ] Text inputs
   - [ ] Dropdown selects
   - [ ] Buttons
   - [ ] Radio buttons/Checkboxes
   - [ ] Expandable elements

**Expected Result:** Clear, visible focus indicator on all interactive elements (typically 2px blue outline).

### 2.2 Focus Position Accuracy

**Objective:** Verify focus indicator accurately shows which element is focused.

**Test Steps:**
1. Tab through form fields
2. For each focused element:
   - [ ] Verify focus indicator clearly surrounds the focused element
   - [ ] Verify focus is not on adjacent elements
   - [ ] Verify multiple elements don't show focus simultaneously

**Expected Result:** Focus indicator precisely marks the active element.

---

## Test 3: Browser Zoom

### 3.1 Zoom to 200%

**Objective:** Verify application is fully accessible and usable at 200% zoom.

**Test Steps:**
1. Load application at normal zoom (100%)
2. Browser menu → Zoom → 200% (or press Ctrl/Cmd + Shift + +)
3. Verify:
   - [ ] All content is readable (text size increased)
   - [ ] No horizontal scrolling needed for primary content
   - [ ] Form labels remain associated with inputs
   - [ ] Buttons and inputs maintain adequate size
   - [ ] Dropdown menus function and display correctly
   - [ ] All interactive elements remain accessible
   - [ ] Focus indicators remain visible

4. Test keyboard navigation at 200% zoom:
   - [ ] Tab moves focus to visible elements
   - [ ] All form sections remain reachable

5. Test common interactions:
   - [ ] Open and select from a dropdown
   - [ ] Fill a text input
   - [ ] Click (or keyboard activate) a button

**Expected Result:** Full functionality maintained at 200% zoom.

### 3.2 Zoom to 400%

**Objective:** Verify application remains functional at extreme zoom.

**Test Steps:**
1. Browser menu → Zoom → 400% (or press Ctrl/Cmd + Shift + + multiple times)
2. Verify:
   - [ ] Content is readable but in single-column layout
   - [ ] No critical content is hidden or inaccessible
   - [ ] Scrolling allows access to all content
   - [ ] Focus indicators remain visible and accurate
   - [ ] All form sections are individually accessible

3. Test keyboard navigation at 400% zoom:
   - [ ] Tab still navigates to all elements (requires scrolling to see some)
   - [ ] No elements trapped off-screen

4. Test specific elements:
   - [ ] Can still interact with dropdowns
   - [ ] Can still fill text inputs
   - [ ] Can still activate buttons
   - [ ] Date pickers function correctly

**Expected Result:** All content and functionality accessible at 400% zoom (with vertical scrolling).

### 3.3 Return to Normal Zoom

**Test Steps:**
1. Browser menu → Zoom → Reset (or press Ctrl/Cmd + 0)
2. Verify application returns to normal appearance

---

## Test 4: High Contrast Mode

### 4.1 Enable High Contrast (Windows)

**Objective:** Verify application displays correctly in Windows High Contrast Mode.

**Test Steps (Windows):**
1. Settings → Ease of Access → Display → Turn on high contrast
2. Select a high contrast theme:
   - [ ] Test with "High Contrast #1"
   - [ ] Test with "High Contrast #2"
   - [ ] Test with "High Contrast Black"
   - [ ] Test with "High Contrast White"

3. For each theme, verify:
   - [ ] Text is readable and clearly visible
   - [ ] Background provides sufficient contrast
   - [ ] Form labels clearly associated with inputs
   - [ ] Error indicators remain visible (not just by color)
   - [ ] Focus indicators visible and distinguishable
   - [ ] Buttons and interactive elements clearly defined
   - [ ] Expandable sections clearly marked

**Expected Result:** Clear visibility and full functionality in all high contrast themes.

### 4.2 Disable High Contrast

**Test Steps:**
1. Settings → Ease of Access → Display → Turn off high contrast
2. Verify application returns to normal display

**Note:** Mac users: High Contrast testing equivalent can be performed via System Preferences → Accessibility → Display → Increase Contrast, though Windows High Contrast is more extreme.

---

## Test 5: Screen Reader Testing (NVDA on Windows)

### 5.1 Setup NVDA

**Objective:** Test application with NVDA screen reader.

**Prerequisites:**
- Windows 10 or 11
- NVDA installed (free from https://www.nvaccess.org/)
- Firefox or Chrome browser

**Test Steps:**
1. Start NVDA
2. Open browser and navigate to `http://localhost:5173`
3. NVDA will begin reading page content

### 5.2 Page Title and Structure

**Objective:** Verify page structure is properly announced.

**Test Steps:**
1. Press `R` to read entire page (or use NVDA + Right Arrow to navigate)
2. Listen for:
   - [ ] Page title: "TOWER — Takeoff Notifications for Technology Deployments"
   - [ ] Navigation landmarks (if present)
   - [ ] Form structure and section headings
   - [ ] "Deployment Information" section heading
   - [ ] "Contact Information" section heading
   - [ ] Other form section headings

3. Verify:
   - [ ] Content is announced in logical reading order
   - [ ] Section headings are clearly identified
   - [ ] No repeated or skipped content

**Expected Result:** Page structure clearly communicated through headings and landmarks.

### 5.3 Form Field Navigation

**Objective:** Verify form fields are properly announced.

**Test Steps:**
1. Press `Tab` or `F` to navigate to first form field
2. NVDA should announce:
   - [ ] Field type (e.g., "Application Selector, combo box")
   - [ ] Field label (e.g., "Select application")
   - [ ] Current value (if any)
   - [ ] Required indicator (if applicable)

3. Move to each field type:
   - [ ] Text input: Should announce "edit text"
   - [ ] Dropdown: Should announce "combo box"
   - [ ] Date picker: Should announce "date picker" or similar
   - [ ] Button: Should announce "button"
   - [ ] Radio button: Should announce "radio button"

4. When field has error:
   - [ ] Error message should be announced
   - [ ] `aria-invalid="true"` should be communicated

**Expected Result:** Each field type is correctly identified and described.

### 5.4 Interactive Elements

**Objective:** Verify buttons and interactive elements are properly announced.

**Test Steps:**
1. Navigate to "Add Form" button using `Tab`
2. NVDA should announce: "Add Form button"
3. Press `Enter` to activate
4. NVDA should announce: "Form added" or similar announcement
5. Navigate to "Reset" button
6. NVDA should announce: "Reset button"
7. Press `Enter`
8. NVDA should announce: Reset confirmation dialog opening and title

9. Test other interactive elements:
   - [ ] Remove button (when available)
   - [ ] Generate Outputs button
   - [ ] Theme selector buttons

**Expected Result:** Buttons clearly identified and actions announced.

### 5.5 Error Notifications

**Objective:** Verify error messages are properly announced.

**Test Steps:**
1. Try to submit form with missing required fields
2. NVDA should announce:
   - [ ] "Validation failed" (alert announcement)
   - [ ] Each specific field error
   - [ ] Error message content

3. Verify:
   - [ ] Errors announced immediately (not delayed)
   - [ ] Error messages are clear and actionable
   - [ ] Focus moves to error area (or announcement occurs)

**Expected Result:** Validation errors clearly communicated to screen reader user.

### 5.6 Dynamic Content Updates

**Objective:** Verify live updates are announced.

**Test Steps:**
1. Add an Impact Item
2. Verify NVDA announces the new item count
3. Reach maximum items (100)
4. Verify NVDA announces: "Maximum 100 impact items reached"
5. Remove an item
6. Verify NVDA announces updated count

**Expected Result:** Dynamic updates announced via live regions.

### 5.7 Exit NVDA

**Test Steps:**
1. Press `Insert + Q` to quit NVDA
2. Verify NVDA announces "Quitting NVDA"

---

## Test 6: Screen Reader Testing (VoiceOver on macOS)

### 6.1 Setup VoiceOver

**Objective:** Test application with VoiceOver (built-in Mac screen reader).

**Prerequisites:**
- macOS 10.14+
- Safari or Chrome browser

**Test Steps:**
1. System Preferences → Accessibility → VoiceOver
2. Enable VoiceOver (or press Command + F5)
3. VoiceOver will start announcing screen content
4. Open browser and navigate to `http://localhost:5173`

### 6.2 Navigation and Announcement

**Objective:** Verify VoiceOver announces content correctly.

**Test Steps:**
1. VoiceOver will begin announcing page content
2. Use `VO + Right Arrow` (VO = Control + Option) to navigate
3. Listen for:
   - [ ] Page title and content
   - [ ] Form structure and headings
   - [ ] Field labels and descriptions
   - [ ] Button labels

4. Use `VO + U` to open rotor (easy navigation)
5. Use rotor to navigate:
   - [ ] Headings
   - [ ] Form controls
   - [ ] Buttons
   - [ ] Links (if any)

**Expected Result:** All content accessible via VoiceOver navigation.

### 6.3 Form Interaction

**Objective:** Verify form interaction with VoiceOver.

**Test Steps:**
1. Press `Tab` to navigate to first form field
2. VoiceOver announces field information
3. Type in text field
4. Use arrow keys in combo box to select options
5. Press `Space` to toggle radio buttons
6. Navigate through date picker

**Expected Result:** All form interactions work with VoiceOver.

### 6.4 Exit VoiceOver

**Test Steps:**
1. Command + F5 to disable VoiceOver
2. Or System Preferences → Accessibility → VoiceOver → disable

---

## Test 7: Color Contrast Verification

### 7.1 Browser DevTools Inspection

**Objective:** Verify color contrast ratios meet WCAG standards.

**Test Steps:**
1. Open browser Developer Tools (F12)
2. Use Accessibility Inspector:
   - Chrome: Elements → Accessibility panel
   - Firefox: Inspector → Accessibility tab

3. Select elements and check:
   - [ ] Text color vs. background color
   - [ ] Reported contrast ratio
   - [ ] WCAG level pass/fail

4. Verify minimum ratios:
   - [ ] Normal text: 4.5:1 ✓
   - [ ] Large text (18pt+): 3:1 ✓
   - [ ] UI components: 3:1 ✓

### 7.2 Common Elements to Check

**Text Elements:**
- [ ] Primary text (input labels)
- [ ] Help text (below inputs)
- [ ] Error text (red color)
- [ ] Button text

**Component Elements:**
- [ ] Button background/text
- [ ] Input border (active and inactive)
- [ ] Focus indicator
- [ ] Disabled button

**Expected Result:** All text meets 4.5:1 ratio, UI components meet 3:1 ratio.

---

## Test 8: Validation and Error Handling

### 8.1 Required Fields

**Objective:** Verify error messages for missing required fields.

**Test Steps:**
1. Load application
2. Try to submit form without filling any fields
3. Click "Generate Outputs" button
4. Verify error messages appear for:
   - [ ] Application selection
   - [ ] Change Number
   - [ ] Release Version
   - [ ] Environment
   - [ ] Deployment Date
   - [ ] Start Time
   - [ ] End Time
   - [ ] Contact Name
   - [ ] Contact Email
   - [ ] Contact Phone
   - [ ] At least one Change Item
   - [ ] At least one Impact Item

5. Verify:
   - [ ] Error messages adjacent to fields
   - [ ] Error text clearly indicates what's wrong
   - [ ] All entered data is preserved

**Expected Result:** Clear error messages for all missing required fields.

### 8.2 Format Validation

**Objective:** Verify format validation errors.

**Test Steps:**
1. Fill all required fields
2. Enter invalid email format:
   - [ ] "notanemail" → error
   - [ ] "user@" → error
   - [ ] "user@domain" → error
   - [ ] "user@domain.com" → valid

3. Enter invalid phone format:
   - [ ] "5551234567" → error
   - [ ] "(555) 123-4567" → valid
   - [ ] "(555)123-4567" → error

4. Verify:
   - [ ] Error messages appear adjacent to fields
   - [ ] User can correct and resubmit
   - [ ] Other valid data is not lost

**Expected Result:** Format validation clearly communicated.

### 8.3 Business Logic Validation

**Objective:** Verify business rule validation.

**Test Steps:**
1. Set Start Time to 22:00 and End Time to 20:00 (end before start)
2. Try to generate outputs
3. Verify error: "End Time must be later than Start Time"

4. Set Outage Start to later than Outage End
5. Try to generate outputs
6. Verify error about outage time ordering

**Expected Result:** Business logic errors clearly communicated.

---

## Test 9: Accessibility Features Audit

### 9.1 Quick Accessibility Check

**Objective:** Overall accessibility verification.

**Checklist:**
- [ ] Page title present and descriptive
- [ ] All form inputs have associated labels
- [ ] All buttons have descriptive text or aria-labels
- [ ] Error messages associated with form fields
- [ ] Placeholder text not used as label (labels present)
- [ ] Focus indicators visible on all interactive elements
- [ ] Color not sole means of conveying information
- [ ] Form structure logical and navigable
- [ ] No keyboard traps
- [ ] All functionality available via keyboard
- [ ] Dynamic content updates announced
- [ ] Sufficient color contrast throughout

**Expected Result:** All items checked and verified.

### 9.2 Edge Case Testing

**Objective:** Test less common scenarios.

**Test Steps:**
1. Fill form with long text:
   - [ ] 500-character release version
   - [ ] 255-character contact name
   - [ ] Multiple impact items (50+)
   - [ ] Multiple change items (100+)

2. Verify:
   - [ ] Layout doesn't break
   - [ ] Still keyboard navigable
   - [ ] Focus indicators still visible
   - [ ] Tab order still logical

3. Add maximum forms (5)
4. Verify:
   - [ ] Multiple forms remain separately navigable
   - [ ] Focus can move between forms
   - [ ] Each form is independently operable

**Expected Result:** All edge cases handled accessibly.

---

## Test Documentation

### Recording Results

For each test section, document:
1. **Date and Time:** When testing occurred
2. **Browser:** Browser name and version
3. **Screen Reader:** If used, name and version
4. **Results:** PASS / FAIL / PARTIAL
5. **Notes:** Any observations or issues
6. **Screenshots:** Optional - capture issues

### Example Template

```
Test 1.1: Basic Tab Navigation
Date: [DATE]
Browser: Chrome 120
Screen Reader: None
Result: PASS
Notes: All elements accessible via Tab, no keyboard traps detected
Issues: None
```

---

## Accessibility Issues Reporting

If accessibility issues are found:

1. **Document the Issue:**
   - Specific component or feature affected
   - Type of issue (keyboard, screen reader, color, etc.)
   - Steps to reproduce
   - Expected vs. actual behavior
   - Affected users (screen reader, keyboard-only, etc.)

2. **Severity Classification:**
   - **Critical:** Complete blocker to usage
   - **Major:** Significant difficulty using feature
   - **Minor:** Minor inconvenience, workaround available
   - **Info:** Suggestion for improvement

3. **Report Format:**
   ```
   Title: [Component] - [Issue Type]
   Severity: [Critical/Major/Minor/Info]
   Affected Users: [Screen reader users/Keyboard users/etc]
   Steps to Reproduce: [Step-by-step]
   Expected: [What should happen]
   Actual: [What currently happens]
   Screenshots: [If applicable]
   ```

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [NVDA Documentation](https://www.nvaccess.org/documentation/)
- [VoiceOver Basics](https://www.apple.com/voiceover/getting-started/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Testing Sign-Off

**Tester Name:** [Your Name]
**Date:** [Testing Date]
**Overall Result:** [PASS / FAIL / PARTIAL]

**Summary:** [Brief description of testing results]

**Issues Found:** [Number and severity]

**Recommendation:** [Ready for production / Needs fixes / etc]

**Signature:** _________________________ **Date:** _________

