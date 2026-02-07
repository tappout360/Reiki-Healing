# Quick Test Script

## 🚀 Before Testing

### 1. Clear Browser Storage
Open http://localhost:4000, press F12, then paste:
```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```

## ✅ Test Checklist

### Test 1: Home Page
- [ ] Navigation shows "LOG IN" button (not user name)
- [ ] "Start Your Journey" button visible in hero
- [ ] No modals appear on load
- [ ] No console errors

### Test 2: New Signup Flow
- [ ] Click "Start Your Journey"
- [ ] Page scrolls down smoothly
- [ ] See animated background with gold particles
- [ ] Progress sidebar appears on LEFT with 7 emoji icons
- [ ] Current step is highlighted in gold

### Test 3: Complete Registration
Fill out each step:
1. **Welcome** → Click "Begin"
2. **Personal** → Name: `Tester` | Username: `tester` | Email: `test@test.com`
3. **Security** → Password: `test123` | Confirm: `test123`
4. **Account** → Click "Seeker 🌙"
5. **Subscription** → Click "Free Seeker"
6. **Personalize** → Skip (optional)
7. **Review** → Click "Complete Registration"

### Test 4: After Signup
- [ ] Success toast appears
- [ ] Page scrolls to inline dashboard
- [ ] Dashboard shows your name "Tester"
- [ ] Navigation shows "✨ Tester's Sanctuary" (not LOG IN)
- [ ] Logout button appears

### Test 5: Separate LOGIN
- [ ] Click logout button
- [ ] Click "LOG IN" in navigation
- [ ] Modal appears (NOT the 7-step signup)
- [ ] Enter: `tester` / `test123`
- [ ] Logs in successfully
- [ ] Shows dashboard again

## 🐛 If You Still See Old System

Run this nuclear clear:
```javascript
// F12 Console
localStorage.clear();
sessionStorage.clear();
indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name)));
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
location.reload(true);
```

## 📊 Report Format

Reply with:
- ✅ Test 1: PASSED
- ✅ Test 2: PASSED
- ❌ Test 3: FAILED - [describe what happened]
- etc.
