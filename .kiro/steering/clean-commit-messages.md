---
inclusion: always
---

# Clean Commit Messages - Hearth App

## 🚨 CRITICAL RULE: Only Reference What's Being Committed

**NEVER mention files, changes, or removals that aren't part of the current commit!**

### ❌ WRONG - What NOT to mention:
- Files that were removed during development but never committed
- Previous versions or iterations that were replaced
- Development/debugging code that was cleaned up
- Temporary files that were created and deleted
- Work-in-progress changes that were discarded
- "Removed X" when X was never in the repository

### ✅ CORRECT - What TO mention:
- **Only files being added or modified in this commit**
- **Only changes that are actually in the diff**
- **Only features/functionality being introduced**
- **Only improvements to existing committed code**

## 🎯 Implementation Pattern

### Before Writing Commit Message:
1. **Check git status** - What files are actually staged?
2. **Review git diff** - What changes are actually being committed?
3. **Focus on additions** - What new value is being added?
4. **Ignore development history** - Don't mention the journey, just the destination

### Commit Message Structure:
```
type(scope): brief description of what's being added/changed

- Focus on what this commit introduces
- Mention only files that are in the staged changes
- Describe the value being added to the repository
- Avoid referencing anything that was never committed

Files created/modified:
- path/to/actual/staged/file.ext
```

## 🔧 Examples

### ✅ GOOD: Clean Addition
```
feat(scripts): Add HomeBox import system with intelligent image matching

- Create comprehensive import solution for HomeBox to Hearth migration
- Implement intelligent name matching with fuzzy fallback
- Add automatic image compression and base64 conversion
- Include organized script structure for future extensibility

Files created:
- scripts/README.md
- scripts/homebox-import/homebox_import.py
- scripts/homebox-import/homebox_image_importer.py
- scripts/homebox-import/requirements.txt
- scripts/homebox-import/README.md
```

### ❌ BAD: Mentioning Uncommitted History
```
feat(scripts): Replace web scraper with API approach and remove debugging tools

- Remove web scraper components (never committed)
- Delete development files (never committed)  
- Replace original importer with enhanced version (development history)
- Clean up temporary files (development artifacts)

Files removed: (❌ Don't mention files that were never committed!)
- scripts/debug_tool.py
- scripts/web_scraper.py
```

## 🚨 When This Rule Was Broken

### Recent Example
- **Issue**: Commit message mentioned "removing web scraper components" and "deleting development files"
- **Problem**: These files were never committed to the repository
- **Impact**: Confusing commit history that references non-existent changes
- **Fix**: Focus only on what's being added/modified in the actual commit

## 🎯 Best Practices

### Focus on Value Added
- **What does this commit enable?**
- **What new functionality is available?**
- **What problems does this solve?**
- **What files are actually being committed?**

### Avoid Development Noise
- Don't mention refactoring that happened during development
- Don't reference files that were created and deleted in the same session
- Don't explain the development process or iterations
- Don't mention "cleaning up" unless cleanup files are actually being committed

### Verify Before Committing
```bash
# Always check what's actually being committed:
git status
git diff --cached
git diff --name-only --cached
```

## 🔄 Workflow Summary

1. **Complete the work** - Finish the feature/fix
2. **Stage only final files** - `git add` only what should be committed
3. **Review staged changes** - `git diff --cached`
4. **Write commit message** - Focus only on staged changes
5. **Verify accuracy** - Does the message match the actual diff?

## 📝 Commit Message Checklist

Before finalizing any commit message, ask:

- [ ] Does every file mentioned actually exist in `git diff --cached`?
- [ ] Am I only describing changes that are in the staged diff?
- [ ] Am I focusing on value added rather than development process?
- [ ] Would someone reading this commit message understand what's being introduced?
- [ ] Am I avoiding references to files/changes that were never committed?

**Remember: A commit message should describe what the repository gains, not what happened during development!**

## 🎯 Success Metrics

### Quality Gates
- **Every file mentioned** exists in the staged changes
- **Every change described** is visible in the diff
- **Focus on additions** rather than development history
- **Clear value proposition** for what's being committed

### User Benefits
- **Clean commit history** without confusing references
- **Accurate documentation** of what each commit actually contains
- **Easy code review** with commit messages that match the diff
- **Better git archaeology** when investigating changes later

---

**Status**: ✅ CRITICAL COMMIT RULE  
**Enforcement**: MANDATORY for all commits  
**Last Updated**: December 28, 2025