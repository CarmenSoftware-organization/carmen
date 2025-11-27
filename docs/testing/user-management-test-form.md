# User Management Module - Test Execution Form

## Test Information
**Test Date**: ________________  
**Tester Name**: ________________  
**Environment**: ________________  
**Build Version**: ________________  

## Test Environment Checklist
- [ ] Chrome Browser Version: ________
- [ ] Firefox Browser Version: ________
- [ ] Safari Browser Version: ________
- [ ] Test Email Server Available
- [ ] Test Data Loaded
- [ ] Admin Access Confirmed

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## TC-01: User Creation
**Test Case ID**: UM_TC_01  
**Priority**: High  
**Execution Time**: _______

### Test Steps
| # | Step Description | Expected Result | Actual Result | Status | Notes |
|---|-----------------|-----------------|---------------|---------|-------|
| 1 | Login as admin | Login successful | | | |
| 2 | Navigate to User Management | Page loads correctly | | | |
| 3 | Click "Create New User" | Form opens | | | |
| 4 | Enter email: test.user@carmen.com | Field accepts input | | | |
| 5 | Enter name: Test User | Field accepts input | | | |
| 6 | Select Business Unit: F&B Operations | Selection successful | | | |
| 7 | Select Department: Kitchen | Selection successful | | | |
| 8 | Select Role: Staff | Selection successful | | | |
| 9 | Click Save | User created | | | |
| 10 | Check email notification | Email received | | | |

**Defects Found**: ________________  
**Screenshots**: ________________  
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

---

## TC-02: Role Assignment
**Test Case ID**: UM_TC_02  
**Priority**: High  
**Execution Time**: _______

### Test Steps
| # | Step Description | Expected Result | Actual Result | Status | Notes |
|---|-----------------|-----------------|---------------|---------|-------|
| 1 | Select existing user | User selected | | | |
| 2 | Click "Edit Roles" | Role editor opens | | | |
| 3 | Add role "Supervisor" | Role added | | | |
| 4 | Remove role "Staff" | Role removed | | | |
| 5 | Save changes | Changes saved | | | |
| 6 | Verify permissions | Permissions updated | | | |
| 7 | Check notifications | Notification sent | | | |

**Defects Found**: ________________  
**Screenshots**: ________________  
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

---

## TC-03: User Profile Editing
**Test Case ID**: UM_TC_03  
**Priority**: Medium  
**Execution Time**: _______

### Test Steps
| # | Step Description | Expected Result | Actual Result | Status | Notes |
|---|-----------------|-----------------|---------------|---------|-------|
| 1 | Select user profile | Profile loaded | | | |
| 2 | Click "Edit Profile" | Edit mode active | | | |
| 3 | Update contact number | Number updated | | | |
| 4 | Change department | Department changed | | | |
| 5 | Update reporting manager | Manager updated | | | |
| 6 | Save changes | Changes saved | | | |
| 7 | Verify audit trail | Audit log updated | | | |

**Defects Found**: ________________  
**Screenshots**: ________________  
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

---

## TC-04: User Deactivation
**Test Case ID**: UM_TC_04  
**Priority**: High  
**Execution Time**: _______

### Test Steps
| # | Step Description | Expected Result | Actual Result | Status | Notes |
|---|-----------------|-----------------|---------------|---------|-------|
| 1 | Select active user | User selected | | | |
| 2 | Click "Deactivate User" | Confirmation prompt | | | |
| 3 | Enter deactivation reason | Reason recorded | | | |
| 4 | Confirm deactivation | User deactivated | | | |
| 5 | Verify access removal | Access revoked | | | |
| 6 | Check notifications | Notifications sent | | | |

**Defects Found**: ________________  
**Screenshots**: ________________  
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

---

## TC-05: Permission Validation
**Test Case ID**: UM_TC_05  
**Priority**: Critical  
**Execution Time**: _______

### Test Steps
| # | Step Description | Expected Result | Actual Result | Status | Notes |
|---|-----------------|-----------------|---------------|---------|-------|
| 1 | Login as test user | Login successful | | | |
| 2 | Access authorized page | Access granted | | | |
| 3 | Access unauthorized page | Access denied | | | |
| 4 | Test restricted function | Function blocked | | | |
| 5 | Verify error messages | Messages correct | | | |
| 6 | Check access logs | Attempts logged | | | |

**Defects Found**: ________________  
**Screenshots**: ________________  
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

---

## Error Scenario Testing

### TC-07: Validation Testing
**Test Case ID**: UM_TC_07  
**Priority**: High  
**Execution Time**: _______

| Test Case | Input | Expected Error | Actual Result | Status |
|-----------|-------|----------------|---------------|---------|
| Invalid Email | user@.com | Format error | | |
| Duplicate Email | existing@carmen.com | Duplicate error | | |
| Missing Name | [empty] | Required field | | |
| Invalid Phone | abc-123 | Format error | | |
| Special Chars | User#$% | Invalid chars | | |

**Defects Found**: ________________  
**Screenshots**: ________________  
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

---

## Performance Testing Results

### TC-10: Performance Validation
**Test Case ID**: UM_TC_10  
**Priority**: Medium  
**Execution Time**: _______

| Test Area | Expected Time | Actual Time | Status | Notes |
|-----------|---------------|-------------|---------|-------|
| User List Load (100 users) | < 2 sec | | | |
| Bulk Update (50 users) | < 5 sec | | | |
| Search Response | < 1 sec | | | |
| Filter Application | < 1 sec | | | |
| Report Generation | < 3 sec | | | |

**Performance Issues**: ________________  
**Screenshots**: ________________  
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

---

## Test Summary

### Issues Found
| Issue ID | Severity | Description | Status |
|----------|----------|-------------|---------|
| | | | |
| | | | |
| | | | |

### Test Coverage
Total Test Cases: _____  
Passed: _____  
Failed: _____  
Blocked: _____  
Not Executed: _____  

### Notes and Observations
```
[Add any additional notes, observations, or concerns here]




```

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | | | |
| Test Lead | | | |
| QA Manager | | | |
| Business Analyst | | | | 