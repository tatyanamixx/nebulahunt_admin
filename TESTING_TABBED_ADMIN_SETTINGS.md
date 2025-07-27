# 🧪 Testing Guide: Admin Settings with Tabs

## 🚀 How to Access

1. **Login to the admin panel** with your credentials
2. **Navigate to** `Admin Settings (Tabs)` in the sidebar
3. **URL**: `http://localhost:3000/admin-settings-tabs`

## 📋 Test Scenarios

### 👤 Account Info Tab

-   [ ] Verify user information is displayed correctly
-   [ ] Check 2FA status shows correctly
-   [ ] Verify account statistics are accurate

### 🔐 2FA Security Tab

-   [ ] **Setup 2FA**:
    -   Click "Setup 2FA" button
    -   Verify QR code appears
    -   Test "Copy" button for secret key
    -   Scan QR code with Google Authenticator
    -   Enter 6-digit code and complete setup
-   [ ] **Get QR Code** (when 2FA is enabled):
    -   Click "Get QR Code" button
    -   Verify QR code and secret key are displayed
    -   Test copy functionality
-   [ ] **Disable 2FA**:
    -   Click "Disable 2FA" button
    -   Confirm the action
    -   Verify 2FA is disabled

### 🔑 Password Tab

-   [ ] **Password Information**:
    -   Verify password status is displayed
    -   Check last changed date
    -   Verify expiration date (if applicable)
-   [ ] **Change Password**:
    -   Click "Change Password" button
    -   Enter current password
    -   Enter new password (test with Cyrillic characters - should show error)
    -   Confirm new password
    -   Test show/hide password toggles
    -   Submit form and verify success

### 👥 Invitations Tab

-   [ ] **Send Invitation**:
    -   Click "Send New Invitation" button
    -   Fill in email, name, and role
    -   Submit form and verify success message
-   [ ] **View Invitations**:
    -   Check if invitations list is displayed
    -   Verify status indicators (PENDING, ACCEPTED, EXPIRED)
    -   Test "Refresh List" button
-   [ ] **Invitation Details**:
    -   Verify expiration dates are formatted correctly
    -   Check creation dates are displayed

## 🎯 General UI/UX Testing

### Tab Navigation

-   [ ] Click between all tabs
-   [ ] Verify active tab is highlighted
-   [ ] Check tab icons are displayed correctly
-   [ ] Test responsive design on mobile

### Messages and Feedback

-   [ ] Test success messages appear and auto-dismiss
-   [ ] Test error messages are displayed correctly
-   [ ] Verify loading states during API calls

### Responsive Design

-   [ ] Test on desktop (large screen)
-   [ ] Test on tablet (medium screen)
-   [ ] Test on mobile (small screen)
-   [ ] Verify all buttons and forms are accessible

## 🔧 Technical Testing

### API Integration

-   [ ] Verify all API calls work correctly
-   [ ] Test error handling for failed requests
-   [ ] Check loading states during requests

### State Management

-   [ ] Verify state persists when switching tabs
-   [ ] Test form state resets after successful submission
-   [ ] Check 2FA state updates correctly

### Browser Compatibility

-   [ ] Test in Chrome
-   [ ] Test in Firefox
-   [ ] Test in Safari
-   [ ] Test in Edge

## 🐛 Known Issues to Check

1. **QR Code Generation**: Verify QR codes are generated correctly
2. **Date Formatting**: Check all dates are displayed in correct format
3. **Password Validation**: Test Cyrillic character detection
4. **Form Validation**: Verify all required fields work correctly
5. **Accessibility**: Test with screen readers and keyboard navigation

## 📝 Feedback Template

If you find any issues, please report them with:

```
**Issue**: [Brief description]
**Steps to Reproduce**: [Step-by-step instructions]
**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]
**Browser**: [Browser and version]
**Screen Size**: [Desktop/Tablet/Mobile]
**Screenshot**: [If applicable]
```

## 🎉 Success Criteria

The new tabbed interface is successful if:

-   ✅ All functionality from the original AdminSettings works
-   ✅ UI is more organized and easier to navigate
-   ✅ All tabs load and function correctly
-   ✅ No console errors or warnings
-   ✅ Responsive design works on all screen sizes
-   ✅ Accessibility standards are met

---

**Happy Testing! 🚀**
