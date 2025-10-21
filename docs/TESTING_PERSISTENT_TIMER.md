# Persistent Timer Testing Documentation

## Overview
This document outlines comprehensive testing scenarios for the persistent timer feature across tabs, including localStorage persistence, BroadcastChannel synchronization, navigation protection, visual indicators, and session recovery.

## Test Environment Setup
- **Browser**: Chrome/Edge/Firefox (BroadcastChannel support required)
- **OS**: Windows/macOS/Linux
- **Network**: Online and offline scenarios
- **Tabs**: Multiple browser tabs/windows

---

## Test Scenarios

### 1. Computer Sleep/Wake with Running Timer ⏰

**Objective**: Verify timer continues accurately after computer sleep or hibernate

**Steps**:
1. Start a 10-minute timer on `/timer` page
2. Wait for timer to run for 2-3 minutes
3. Close laptop lid or manually put computer to sleep
4. Wait 2-5 minutes while computer is asleep
5. Wake computer and return to browser

**Expected Results**:
- ✅ Timer automatically detects time jump (>2 seconds)
- ✅ Timer recalculates elapsed time from `startedAt` timestamp
- ✅ Timer adjusts `timeLeft` to correct remaining time
- ✅ If timer should have completed during sleep, it shows completion
- ✅ Document title updates with correct countdown
- ✅ No console errors

**Validation Checks**:
```javascript
// Check localStorage for correct state
const state = JSON.parse(localStorage.getItem('ss-study-timer-state'));
console.log('Time left:', state.timeLeft);
console.log('Started at:', new Date(state.startedAt));
console.log('Current time:', new Date());
```

---

### 2. Multiple Tabs Open Simultaneously 🗂️

**Objective**: Verify timer synchronizes correctly across multiple tabs

**Steps**:
1. Open Tab A and navigate to `/timer`
2. Start a 5-minute timer in Tab A
3. Open Tab B and navigate to `/dashboard` (should see FloatingTimerBadge)
4. Open Tab C and navigate to `/timer` (should see running timer)
5. In Tab A: Pause the timer
6. In Tab C: Resume the timer
7. In Tab B: Click FloatingTimerBadge to navigate to timer
8. In Tab A: Stop the timer

**Expected Results**:
- ✅ All tabs show consistent timer state (running/paused/stopped)
- ✅ FloatingTimerBadge appears on all non-timer pages (Tab B)
- ✅ FloatingTimerBadge hidden on timer page (Tabs A, C)
- ✅ Pause action in Tab A syncs to Tabs B and C immediately
- ✅ Resume action in Tab C syncs to Tabs A and B immediately
- ✅ Stop action in Tab A clears timer in all tabs
- ✅ localStorage cleared when timer stopped
- ✅ No duplicate timers running

**BroadcastChannel Messages**:
```javascript
// Expected message types across tabs:
// - TIMER_STARTED (from Tab A)
// - TIMER_PAUSED (from Tab A)
// - TIMER_RESUMED (from Tab C)
// - TIMER_STOPPED (from Tab A)
```

---

### 3. Browser Crash Recovery 💥

**Objective**: Verify timer recovers after unexpected browser crash or force quit

**Steps**:
1. Start a 15-minute timer on `/timer` page
2. Wait for 3-4 minutes
3. Force quit browser (Task Manager > End Task on Windows, or Force Quit on macOS)
4. Reopen browser and navigate to `/timer` page

**Expected Results**:
- ✅ SessionRecoveryModal appears automatically
- ✅ Modal displays correct session information:
  - Timer type (🍅 Pomodoro / ⏱️ Timer / ⏲️ Stopwatch)
  - State badge (Running/Paused with color coding)
  - Correct time remaining
  - Progress bar with accurate percentage
- ✅ Click "Resume Session" button recovers timer
- ✅ Timer continues from correct time
- ✅ Click "Discard" button clears saved state
- ✅ Modal closes after action

**Recovery Modal Verification**:
```javascript
// Check modal props
const savedState = JSON.parse(localStorage.getItem('ss-study-timer-state'));
console.log('Session ID:', savedState.sessionId);
console.log('Time left:', savedState.timeLeft);
console.log('State:', savedState.state); // 'running' or 'paused'
```

---

### 4. Manual Time Change Detection ⏱️

**Objective**: Verify timer handles system clock changes

**Steps**:
1. Start a 10-minute timer
2. Wait for 2 minutes
3. Manually change system clock forward by 5 minutes
4. Return to browser tab with timer

**Expected Results**:
- ✅ Timer detects time jump (>2 seconds)
- ✅ Timer recalculates based on `startedAt` timestamp
- ✅ Timer shows correct remaining time (or completes if time exceeded)
- ✅ No infinite loops or crashes

**Note**: This scenario is handled by the same time jump detection as computer sleep.

---

### 5. Tab Switching with Running Timer 🔄

**Objective**: Verify timer persists when switching between tabs

**Steps**:
1. Open `/timer` page in Tab A
2. Start a 5-minute timer
3. Switch to Tab B with `/dashboard` page
4. Wait 1-2 minutes (observe FloatingTimerBadge updates)
5. Switch back to Tab A

**Expected Results**:
- ✅ Timer continues running in Tab A
- ✅ Time displayed is accurate (not reset)
- ✅ FloatingTimerBadge in Tab B updates every second
- ✅ FloatingTimerBadge shows correct time remaining
- ✅ No timer cancellation or state loss
- ✅ Document title shows countdown in both tabs

**Visual Indicators**:
- Tab A: Document title shows "MM:SS - SS.Study Timer"
- Tab B: Document title shows "MM:SS - SS.Study Timer" + FloatingTimerBadge visible

---

### 6. Page Refresh with Active Timer 🔃

**Objective**: Verify timer recovers after page refresh

**Steps**:
1. Start a 10-minute timer
2. Wait for 3-4 minutes
3. Press F5 or Ctrl+R (Cmd+R on macOS) to refresh page
4. Confirm refresh in browser warning dialog

**Expected Results**:
- ✅ Browser shows beforeunload warning: "You have an active study timer. Leaving this page will pause it. Continue?"
- ✅ After refresh, SessionRecoveryModal appears
- ✅ Modal shows correct session state (paused due to refresh)
- ✅ Click "Resume Session" reloads page and restarts timer
- ✅ Timer shows correct time remaining
- ✅ No data loss

**localStorage State After Refresh**:
```javascript
const state = JSON.parse(localStorage.getItem('ss-study-timer-state'));
console.log('State after refresh:', state.state); // Should be 'paused'
console.log('Time left:', state.timeLeft);
```

---

### 7. Network Disconnection Handling 📡

**Objective**: Verify timer continues working offline

**Steps**:
1. Start a 5-minute timer
2. Disconnect network (turn off Wi-Fi or disable network adapter)
3. Wait 2-3 minutes with timer running
4. Pause and resume timer while offline
5. Reconnect network
6. Let timer complete

**Expected Results**:
- ✅ Timer continues running offline (localStorage persistence)
- ✅ Pause/resume actions work offline
- ✅ Time calculation remains accurate
- ✅ Timer completion works offline
- ✅ After reconnection, session can be saved to database
- ✅ No network-related errors in console

**Note**: Timer logic is client-side and doesn't require network. Database save happens on completion when online.

---

### 8. Session Recovery Modal Interaction 🎭

**Objective**: Verify SessionRecoveryModal works correctly in all scenarios

**Test 8.1: Running Timer Recovery**
1. Start a timer, wait 2 minutes
2. Close browser tab (not browser)
3. Reopen tab and navigate to `/timer`
4. **Expected**: Modal shows "Running" badge (green), "Resume Session" button

**Test 8.2: Paused Timer Recovery**
1. Start a timer, wait 2 minutes
2. Pause the timer
3. Close browser
4. Reopen browser and navigate to `/timer`
5. **Expected**: Modal shows "Paused" badge (yellow), "Continue Session" button

**Test 8.3: Discard Session**
1. Start a timer
2. Close browser
3. Reopen and see recovery modal
4. Click "Discard" button
5. **Expected**: Modal closes, localStorage cleared, timer reset to idle

**Test 8.4: 24-Hour Expiry**
1. Start a timer
2. Manually edit localStorage `startedAt` to be 25 hours ago:
   ```javascript
   const state = JSON.parse(localStorage.getItem('ss-study-timer-state'));
   state.startedAt = Date.now() - (25 * 60 * 60 * 1000);
   localStorage.setItem('ss-study-timer-state', JSON.stringify(state));
   ```
3. Refresh page
4. **Expected**: No recovery modal (state too old), localStorage cleared

---

### 9. Navigation Protection 🚫

**Objective**: Verify navigation is blocked when timer is running

**Test 9.1: Browser Back/Forward Buttons**
1. Navigate to `/timer` from `/dashboard`
2. Start a timer
3. Press browser back button
4. **Expected**: Confirmation dialog appears, navigation blocked until confirmed

**Test 9.2: Closing Tab**
1. Start a timer
2. Click X to close tab or Ctrl+W (Cmd+W on macOS)
3. **Expected**: Browser beforeunload warning appears

**Test 9.3: Internal Navigation**
1. Start a timer
2. Try clicking navigation links (e.g., Dashboard, Sessions)
3. **Expected**: Navigation prevented with confirmation dialog

---

### 10. Visual Indicators 👁️

**Objective**: Verify all visual indicators work correctly

**Test 10.1: Document Title**
1. Start a 5-minute timer
2. Switch to another tab
3. **Expected**: Timer tab title shows "MM:SS - SS.Study Timer"
4. Stop timer
5. **Expected**: Title resets to "SS.Study"

**Test 10.2: FloatingTimerBadge**
1. Start a timer on `/timer` page
2. Navigate to `/dashboard`
3. **Expected**: 
   - FloatingTimerBadge visible in bottom-right corner
   - Shows green background (running)
   - Displays correct time remaining
   - Shows timer type emoji (🍅/⏱️/⏲️)
   - Updates every second
4. Return to `/timer` page
5. **Expected**: FloatingTimerBadge hidden on timer page

**Test 10.3: Progress Bar**
1. Start a 5-minute timer
2. **Expected**: Progress bar starts at 100%, decreases over time
3. Pause timer
4. **Expected**: Progress bar stops at current percentage
5. Resume timer
6. **Expected**: Progress bar continues decreasing

---

## Automated Testing Commands

### Check localStorage State
```javascript
// In browser console
const state = JSON.parse(localStorage.getItem('ss-study-timer-state'));
console.table(state);
```

### Clear Saved State Manually
```javascript
localStorage.removeItem('ss-study-timer-state');
```

### Simulate Time Jump (for testing)
```javascript
// Manually edit startedAt to simulate sleep
const state = JSON.parse(localStorage.getItem('ss-study-timer-state'));
state.startedAt = Date.now() - (10 * 60 * 1000); // 10 minutes ago
localStorage.setItem('ss-study-timer-state', JSON.stringify(state));
```

---

## Known Limitations

1. **BroadcastChannel Support**: Requires modern browser (Chrome 54+, Edge 79+, Firefox 38+)
2. **Private/Incognito Mode**: localStorage persists only during session
3. **Safari Support**: BroadcastChannel not supported in Safari < 15.4
4. **24-Hour Limit**: Saved timer states expire after 24 hours

---

## Success Criteria

All tests pass if:
- ✅ Timer persists across tab switches
- ✅ Timer recovers after page refresh
- ✅ Timer recovers after browser crash
- ✅ Timer syncs across multiple tabs
- ✅ Timer handles computer sleep/wake correctly
- ✅ SessionRecoveryModal works for all scenarios
- ✅ Navigation protection prevents accidental timer loss
- ✅ Visual indicators (title, badge) work correctly
- ✅ No console errors during any test
- ✅ localStorage cleaned up properly on timer completion

---

## Testing Checklist

- [ ] Test 1: Computer sleep/wake (10 min test)
- [ ] Test 2: Multiple tabs (5 min test)
- [ ] Test 3: Browser crash recovery (5 min test)
- [ ] Test 4: Manual time change (3 min test)
- [ ] Test 5: Tab switching (3 min test)
- [ ] Test 6: Page refresh (5 min test)
- [ ] Test 7: Network disconnection (5 min test)
- [ ] Test 8: Session recovery modal (10 min test)
- [ ] Test 9: Navigation protection (5 min test)
- [ ] Test 10: Visual indicators (5 min test)

**Total Testing Time**: ~56 minutes

---

## Bug Reporting Template

If issues are found, report using this template:

```markdown
### Bug: [Brief Description]

**Scenario**: [Which test scenario]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
**Actual Result**:
**Screenshots**: [If applicable]
**Console Errors**: [Copy/paste errors]
**localStorage State**: [Copy/paste state]
**Browser**: [Chrome/Edge/Firefox version]
**OS**: [Windows/macOS/Linux]
```

---

## Next Steps After Testing

1. ✅ Mark all tests as complete
2. ✅ Document any bugs found
3. ✅ Fix critical issues
4. ✅ Update documentation with findings
5. ✅ Deploy to production when all tests pass
