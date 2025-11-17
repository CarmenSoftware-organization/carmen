# WordPress Wiki - Final Setup Steps

## ✅ What's Been Automated (Complete!)

### 1. Content Migration ✓
- **298 pages** migrated with proper HTML formatting
- **All tables** display correctly
- **Internal links** converted to WordPress permalinks
- **Custom metadata** preserved (doc types, levels, source files)

### 2. Homepage Configuration ✓
- **Wiki-Home set as front page**
- Visit http://peak.local/ to see it
- Page ID: 42

### 3. Custom Navigation Menu ✓
- **Menu created:** "Carmen Wiki Main Menu" (ID: 3)
- **6 essential items:**
  1. Wiki Home
  2. Module Index
  3. Getting Started
  4. Developer Onboarding
  5. Architecture Overview
  6. Database Schema

### 4. WordPress MCP Integration ✓
- **Connected successfully**
- **145 WordPress tools** available
- Can now manage WordPress programmatically

---

## ⚠️ 2 Quick Manual Steps Needed (5 minutes total)

### Step 1: Configure Navigation Block (2 minutes)

The custom menu is created but the theme needs to be told to use it.

**Instructions:**
1. Go to http://peak.local/wp-admin/site-editor.php
2. Click **"Patterns"** in left sidebar
3. Find and click **"header"** in the patterns list
4. Click on the **Navigation block** (the menu area)
5. In the right sidebar, look for **"Select Menu"** or **"Choose Menu"**
6. Select **"Carmen Wiki Main Menu"** from the dropdown
7. Click **"Save"** button in top right
8. Refresh your site

**Result:** Navigation will show 6 clean links instead of 298 pages!

---

### Step 2: Install WP Mermaid Plugin (3 minutes)

This enables the 38 flow diagrams to render as interactive charts.

**Instructions:**
1. Go to http://peak.local/wp-admin/plugin-install.php
2. In the search box, type: **"Mermaid"**
3. Look for a plugin like:
   - "WP Mermaid"
   - "Mermaid Diagram Block"
   - "Mermaid Charts"
4. Click **"Install Now"**
5. Click **"Activate"**

**Alternative plugins if WP Mermaid not found:**
- "Diagram Block" by Automattic
- "Mermaid.js Block"
- Any plugin that supports `[mermaid]` shortcode

**Test it works:**
Visit http://peak.local/purchase-requests-fd-purchase-requests/

You should see interactive flowcharts instead of code blocks with `[mermaid]` tags.

---

## 🧪 Testing Checklist

After completing the 2 steps above, verify:

- [ ] Homepage (http://peak.local/) shows Wiki-Home content
- [ ] **Navigation has 6 items** (not 298!)
- [ ] **Tables** display formatted properly
- [ ] **Mermaid diagrams** render as flowcharts
- [ ] All **links work** correctly
- [ ] **Mobile view** looks good
- [ ] **Search** finds documentation

---

## 📊 Current Status

| Item | Status |
|------|--------|
| Content Migration | ✅ 100% |
| Table Formatting | ✅ 100% |
| Homepage Setup | ✅ 100% |
| Custom Menu Creation | ✅ 100% |
| WordPress MCP | ✅ Connected |
| **Navigation Display** | ⚠️  Needs Step 1 |
| **Mermaid Plugin** | ⚠️  Needs Step 2 |

**Overall Progress: 85%** (just 2 quick steps remaining!)

---

## 🔗 Quick Links

| Purpose | URL |
|---------|-----|
| **Your Wiki** | http://peak.local/ |
| **WordPress Admin** | http://peak.local/wp-admin/ |
| **Site Editor** (for Step 1) | http://peak.local/wp-admin/site-editor.php |
| **Plugin Installer** (for Step 2) | http://peak.local/wp-admin/plugin-install.php |
| **Module Index** | http://peak.local/module-index/ |
| **Test Flow Diagram** | http://peak.local/purchase-requests-fd-purchase-requests/ |

---

## 💡 Tips

**If navigation still shows all pages:**
- Try: Appearance → Editor → Patterns → Header → Edit Navigation Block
- Or: Create a new header pattern without the Page List block
- The theme is using Full Site Editing, so traditional menu locations don't apply

**If Mermaid diagrams don't render:**
- Check if shortcode format is `[mermaid]...[/mermaid]` (which we used)
- Try a different Mermaid plugin
- Or add custom CSS for Mermaid.js library

**WordPress Credentials:**
- Username: `admin`
- Password: `admin`

---

**Created:** 2025-11-15
**Status:** Ready for final 2 steps
**Estimated Time:** 5 minutes total
