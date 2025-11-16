# Frontend Testing Guide - Dynamic Discovery Hub

## Current Status
✅ Dev server running on http://localhost:3000  
✅ framer-motion installed  
✅ lucide-react installed  
✅ Backend running on http://localhost:5000  
✅ ML service running on http://localhost:5001  

---

## Test Plan

### Step 1: Open in Browser
Visit: **http://localhost:3000**

You should see the **old homepage** (not changed yet). This is normal - the new components are created but not yet active.

---

### Step 2: Test New Homepage
To activate the new enhanced homepage for testing, we have two options:

**Option A: Temporary Test (No Permanent Changes)**
1. Open new file: `src/app/(main)/page-new.tsx`
2. Copy all content
3. Open current file: `src/app/(main)/page.tsx`
4. Replace content with the new version
5. Save (Ctrl+S)
6. Browser auto-refreshes

**Option B: Use Temporary Route**
1. Go to: `http://localhost:3000/page-new` (if configured)

Choose **Option A** for full testing.

---

### Step 3: Visual Test Checklist

#### Homepage (`page-new.tsx`)
- [ ] Hero section displays with background image
- [ ] "Surprise Me!" button visible and clickable
- [ ] Gradient text "Favorite Meal" shows correctly
- [ ] Search bar responsive
- [ ] Filter tabs (All, Trending, Nearby) functional
- [ ] Canteen grid loads and displays cards
- [ ] Cards have hover effects (lift up, scale)
- [ ] Loading spinner animates smoothly
- [ ] No console errors

**Test Actions:**
1. Click "Surprise Me!" → Should show modal with random canteen
2. Type in search → Results should filter
3. Click filter tabs → List should change
4. Hover over canteen card → Should lift up with scale effect
5. Close surprise modal → Should disappear smoothly

#### Expected Animations
- Hero text fades in
- Canteen cards stagger in sequence
- Cards lift on hover with smooth transition
- Surprise modal appears with scale animation
- Search updates in real-time

---

### Step 4: Test Navbar (Optional)
To test new navbar, edit `src/components/layouts/navbar.tsx`:
1. Copy content from `src/components/layouts/navbar-new.tsx`
2. Paste into `src/components/layouts/navbar.tsx`
3. Save

**Test:**
- [ ] Navbar displays correctly
- [ ] Logo shows gradient text
- [ ] Navigation links work
- [ ] Mobile menu icon appears on small screens
- [ ] User profile dropdown functional (if logged in)
- [ ] Smooth animations on interactions

---

### Step 5: Test Recommendations (Requires Login)
To test new RecommendationsSection, edit:
1. Copy content from `src/components/RecommendationsSection-new.tsx`
2. Paste into `src/components/RecommendationsSection.tsx`
3. Save

**Login:**
1. Click "Login" in navbar
2. Use credentials: `alice@test.com` / `password123`
3. Homepage should show recommendations
4. Verify:
   - [ ] AI Recommendations section shows
   - [ ] Cards display with match percentage
   - [ ] Horizontal scroll works
   - [ ] Cards animate on load
   - [ ] Hover effects smooth
   - [ ] Reason badges display

---

## Detailed Testing Scenarios

### Scenario 1: Fresh Visitor (No Login)
```
1. Visit http://localhost:3000
2. See hero section with animation
3. Click "Surprise Me!" button
   Expected: Modal shows random canteen with "View Menu" and "Skip" buttons
4. Click "View Menu" 
   Expected: Navigate to canteen page
5. Go back to homepage
6. Search for canteen name
   Expected: Real-time filtering works
7. Click "Trending" filter
   Expected: List sorts by rating
8. Click "All" filter
   Expected: Shows all canteens
9. Hover over canteen card
   Expected: Card lifts up, image scales, button highlights
10. Click heart icon on card
    Expected: Heart fills with red color
```

### Scenario 2: Logged In User
```
1. Login with alice@test.com / password123
2. Homepage shows recommendations section at top
3. Cards in recommendations section:
   - Show dish image
   - Show "XX% match" badge
   - Show recommendation reason in box
   - Cards animate smoothly
4. Scroll recommendations horizontally
   Expected: Smooth scrolling, no jank
5. Hover over recommendation card
   Expected: Card lifts, image scales
6. Click recommendation
   Expected: Navigate to canteen
```

### Scenario 3: Mobile Experience
```
1. Resize browser to 375px width (mobile size)
2. Hero section still visible
3. "Surprise Me!" button responsive
4. Search bar spans full width
5. Canteen grid shows 1 column
6. Navbar hamburger menu appears
7. Click hamburger menu
   Expected: Menu slides in from left
8. Click nav link
   Expected: Menu slides out, navigate to page
```

### Scenario 4: Animation Performance
```
1. Open DevTools (F12)
2. Go to Performance tab
3. Record page load
4. Stop recording
5. Check FPS should be ~60
6. No dropped frames during animations
7. Hover cards multiple times
   Expected: All animations smooth, no stutter
```

---

## Console Testing

1. Open DevTools: **F12**
2. Click **Console** tab
3. Look for:
   - ❌ Red errors - **BAD** (fix before deploying)
   - ⚠️ Yellow warnings - OK (usually library warnings)
   - ✅ Blue logs - Good (debug info)

**Expected Console Output:**
- Next.js hydration messages (normal)
- No fetch errors
- No animation errors
- No React warnings

---

## Network Testing

1. Open DevTools: **F12**
2. Click **Network** tab
3. Reload page
4. Check:
   - All requests complete (green 200 status)
   - No failed requests (red)
   - Images load properly
   - API calls to backend succeed

**Expected:**
- /api/canteens → 200 OK
- /api/dishes/... → 200 OK
- All CSS/JS files → 200 OK

---

## Responsive Testing

Test on different screen sizes:

### Mobile (375px)
- [ ] Hero section visible
- [ ] All text readable
- [ ] Buttons clickable (min 44px)
- [ ] Search bar full width
- [ ] Hamburger menu works
- [ ] Cards stack in 1 column
- [ ] No horizontal scroll

### Tablet (768px)
- [ ] Layout centers properly
- [ ] Cards show 2 per row
- [ ] Navbar desktop version
- [ ] All features accessible

### Desktop (1920px)
- [ ] Hero section spans full width
- [ ] Cards show 3 per row
- [ ] Spacing looks proportional
- [ ] No text overflow

---

## Performance Checklist

- [ ] Page loads < 3 seconds
- [ ] Animations 60fps (no jank)
- [ ] Smooth scrolling
- [ ] No layout shifts (CLS)
- [ ] Images optimized
- [ ] Network tab shows small files
- [ ] No memory leaks

---

## Issue Tracking

If you find issues, note:
1. **What happened** (describe the problem)
2. **Expected behavior** (what should happen)
3. **Steps to reproduce** (how to cause it)
4. **Screenshots** (if visual issue)
5. **Console errors** (if any)

Example:
```
Issue: Surprise Me button text color wrong
Expected: White text
Actual: Black text
Steps: Click Surprise Me button on homepage
Console: No errors
```

---

## Decision Checklist

After testing, decide:

- [ ] Homepage animations look good?
- [ ] Search/filters working?
- [ ] Cards look professional?
- [ ] No console errors?
- [ ] Mobile looks good?
- [ ] Performance acceptable?
- [ ] Ready to deploy?

**If YES to all:** Proceed to Step 5 in DEPLOY_NEW_FRONTEND.md  
**If NO to any:** Check FRONTEND_IMPLEMENTATION.md troubleshooting section

---

## Quick Rollback

If anything breaks during testing:

```powershell
# Stop dev server: Ctrl+C

# Restore original files
cp src/app/(main)/page.tsx.backup src/app/(main)/page.tsx
cp src/components/layouts/navbar.tsx.backup src/components/layouts/navbar.tsx
cp src/components/RecommendationsSection.tsx.backup src/components/RecommendationsSection.tsx

# Restart
npm run dev
```

---

## Browser DevTools Tips

### Check Animations
1. F12 → Console
2. Type: `document.documentElement.style.animationPlayState = 'paused'`
3. Inspect individual animations frame by frame

### Slow Down Animations
1. F12 → More Tools → Rendering
2. Check "Slow down animations"
3. Watch animations at 1/4 speed

### Check Performance
1. F12 → Performance tab
2. Click record (red circle)
3. Interact with page
4. Click stop
5. Analyze FPS and frame times

### Check Network
1. F12 → Network tab
2. Reload page
3. Look for:
   - Red items (failed requests)
   - Large file sizes
   - Slow response times

---

## Testing Timeline

| Step | Time |
|------|------|
| Setup & verify | 1 min |
| Test homepage | 3 min |
| Test navbar (optional) | 2 min |
| Test recommendations | 2 min |
| Test mobile | 2 min |
| Test performance | 2 min |
| **Total** | **~12 min** |

---

## Notes

- **Don't edit files permanently yet** - we're just testing
- **Keep backup files** - you created .backup files automatically
- **Check console often** - errors usually appear there first
- **Test on real mobile** - if possible, not just browser resize
- **Test different logins** - try with/without recommendations

---

**Ready to test?** Start with Step 1 above! 🚀
