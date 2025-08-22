# Restoration Guide

## Overview
This guide provides instructions for restoring files from the cleanup backup if needed.

## Quick Restoration Commands

### Restore All Files
```bash
# Navigate to project root
cd /Users/peak/Documents/GitHub/carmen

# Restore legacy routes
cp -r backup_cleanup_20250822_131714/legacy_routes/* app/

# Restore old structures
cp -r backup_cleanup_20250822_131714/old_structures/app_lib app/lib
cp -r backup_cleanup_20250822_131714/old_structures/app_components app/components
cp -r backup_cleanup_20250822_131714/old_structures/app_data app/data

# Restore previous backups
cp -r backup_cleanup_20250822_131714/previous_backups/_backup .
cp -r backup_cleanup_20250822_131714/previous_backups/docs_backup docs/backup

# Restore development context
cp -r backup_cleanup_20250822_131714/development_context/memory-bank .

# Restore duplicates
cp backup_cleanup_20250822_131714/duplicates/next.config.mjs .
```

### Selective Restoration

#### Restore Only Legacy Routes
```bash
cp -r backup_cleanup_20250822_131714/legacy_routes/inventory app/
cp -r backup_cleanup_20250822_131714/legacy_routes/pr-approval app/
cp -r backup_cleanup_20250822_131714/legacy_routes/stock-take app/
cp -r backup_cleanup_20250822_131714/legacy_routes/receiving app/
cp -r backup_cleanup_20250822_131714/legacy_routes/spot-check app/
```

#### Restore Only Old Structures
```bash
cp -r backup_cleanup_20250822_131714/old_structures/app_lib app/lib
cp -r backup_cleanup_20250822_131714/old_structures/app_components app/components
cp -r backup_cleanup_20250822_131714/old_structures/app_data app/data
```

#### Restore Only Previous Backups
```bash
cp -r backup_cleanup_20250822_131714/previous_backups/_backup .
cp -r backup_cleanup_20250822_131714/previous_backups/docs_backup docs/backup
```

## Verification After Restoration

1. **Check Build**:
   ```bash
   npm run build
   ```

2. **Run Tests**:
   ```bash
   npm run test
   npm run test:run
   ```

3. **Type Check**:
   ```bash
   npm run checktypes
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Common Restoration Scenarios

### Scenario 1: Application Won't Build
**Likely Cause**: Missing utility functions or types
**Solution**: Restore old structures
```bash
cp -r backup_cleanup_20250822_131714/old_structures/app_lib app/lib
```

### Scenario 2: Route Not Found Errors
**Likely Cause**: Some code still references legacy routes
**Solution**: Restore specific legacy route
```bash
cp -r backup_cleanup_20250822_131714/legacy_routes/[specific-route] app/
```

### Scenario 3: Import Errors
**Likely Cause**: Components or data files missing
**Solution**: Restore old structures
```bash
cp -r backup_cleanup_20250822_131714/old_structures/app_components app/components
cp -r backup_cleanup_20250822_131714/old_structures/app_data app/data
```

## Git Operations After Restoration

If you restore files, you'll need to handle git:

```bash
# Check what was restored
git status

# Add restored files
git add .

# Commit the restoration
git commit -m "restore: bring back files from cleanup backup

Restored from backup_cleanup_20250822_131714 due to [reason]"
```

## Emergency Full Rollback

If you need to completely undo the cleanup:

1. **Reset to pre-cleanup commit**:
   ```bash
   git log --oneline | head -10  # Find the commit before cleanup
   git reset --hard [commit-hash-before-cleanup]
   ```

2. **Or use backup restoration**:
   ```bash
   # Remove current backup directory to avoid conflicts
   rm -rf backup_cleanup_20250822_131714
   
   # Checkout the cleanup commit to get the backup
   git checkout [cleanup-commit-hash]
   
   # Copy backup to safe location
   cp -r backup_cleanup_20250822_131714 ~/Desktop/
   
   # Reset to pre-cleanup
   git reset --hard [commit-hash-before-cleanup]
   
   # Restore from backup
   cd ~/Desktop/backup_cleanup_20250822_131714
   [Run restoration commands]
   ```

## Testing After Restoration

Run this checklist after any restoration:

- [ ] `npm install` (if package.json was affected)
- [ ] `npm run build` (successful build)
- [ ] `npm run test` (all tests pass)
- [ ] `npm run checktypes` (no type errors)
- [ ] `npm run lint` (no linting errors)
- [ ] `npm run dev` (development server starts)
- [ ] Manual testing of key workflows

## Support

If you need help with restoration:
1. Check the MANIFEST.md for details about what was moved
2. Review this guide for appropriate restoration commands
3. Test thoroughly after any restoration
4. Document any issues for future reference

## Cleanup After Successful Restoration

If you restore files and they work correctly:
1. Consider if the cleanup was too aggressive
2. Update the orphan analysis to exclude restored files
3. Document why certain files needed to be restored
4. Adjust future cleanup procedures accordingly

---
*Generated on August 22, 2025*