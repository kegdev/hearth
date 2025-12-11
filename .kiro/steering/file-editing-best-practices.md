# File Editing Best Practices - Hearth App

## 🚨 CRITICAL RULE: Avoid strReplace Failures

**NEVER attempt strReplace without being 100% certain of exact text match!**

### ❌ WRONG - What causes failures:
- Copying text from memory or assumptions
- Not accounting for exact whitespace, tabs, line endings
- Using text that may have changed since last read
- Matching across large blocks with potential variations
- Special characters, unicode, or encoding differences

### ✅ CORRECT - What TO do instead:

#### 1. **Read Before Replace** (Always)
```
1. readFile to see current exact content
2. Copy EXACT text including all whitespace
3. Use strReplace with precise match
4. If uncertain, use smaller chunks or fsWrite
```

#### 2. **Alternative Approaches When Uncertain**
- **Small files (<100 lines)**: Use `fsWrite` to rewrite entire file
- **Large files**: Use `readFile` with line ranges, then replace small sections
- **Complex changes**: Break into multiple small `strReplace` operations
- **Uncertain matches**: Use `grepSearch` to find exact text first

#### 3. **Safe Replacement Strategy**
```
Step 1: readFile (get current state)
Step 2: Identify EXACT text to replace (copy/paste from output)
Step 3: strReplace with minimal, precise match
Step 4: If fails, fall back to fsWrite or smaller chunks
```

#### 4. **When to Use fsWrite Instead**
- File is small (<200 lines)
- Making multiple changes to same file
- Text matching is uncertain
- File structure is changing significantly
- Previous strReplace attempts failed

## 🎯 Implementation Pattern

### For Small Files (Preferred)
```typescript
// Read current content
readFile('path/to/file.md')
// Rewrite entire file with changes
fsWrite('path/to/file.md', newContent)
```

### For Large Files (When necessary)
```typescript
// Read specific section first
readFile('path/to/file.md', start_line: 50, end_line: 60)
// Replace only small, exact matches
strReplace(oldStr: "exact text from output", newStr: "new text")
```

### For Complex Changes
```typescript
// Break into multiple small operations
strReplace(oldStr: "line 1 exact text", newStr: "new line 1")
strReplace(oldStr: "line 2 exact text", newStr: "new line 2")
// Rather than one large block
```

## 🔧 Error Prevention Rules

### Before Every strReplace:
1. **Verify exact text** - Copy directly from readFile output
2. **Check whitespace** - Tabs vs spaces, line endings
3. **Minimize scope** - Replace smallest possible text block
4. **Have fallback** - Be ready to use fsWrite if strReplace fails

### When strReplace Fails:
1. **Don't retry** with similar text - it will fail again
2. **Read file again** - Content may have changed
3. **Use fsWrite** - Rewrite entire file with changes
4. **Break into smaller** - Replace line by line if needed

## 📝 Approved Patterns

### ✅ SAFE: Small file rewrite
```
readFile('config.json')
// Make changes to content
fsWrite('config.json', updatedContent)
```

### ✅ SAFE: Precise small replacement
```
readFile('file.md', start_line: 10, end_line: 15)
// Copy EXACT text from output
strReplace(oldStr: "exact line from output", newStr: "new content")
```

### ❌ RISKY: Large block replacement
```
strReplace(oldStr: "large multi-line block...", newStr: "...")
// High chance of whitespace/formatting mismatch
```

### ❌ RISKY: Memory-based replacement
```
strReplace(oldStr: "text I think is there", newStr: "...")
// Without reading file first
```

## 🎯 Success Metrics

### Quality Gates
- **Zero strReplace failures** - Always succeed on first try
- **Efficient editing** - Use appropriate tool for file size
- **Reliable updates** - No broken file states
- **Fast execution** - Minimize read/write operations

### Best Practices
- **Read first, replace second** - Always verify current state
- **Small precise changes** - Minimize replacement scope
- **Fallback ready** - Have fsWrite as backup plan
- **Test approach** - Use safest method for situation

## 🔄 Workflow Summary

1. **Assess file size** - Small (<200 lines) = fsWrite, Large = strReplace
2. **Read current state** - Always know exact content
3. **Plan changes** - Identify minimal replacement scope
4. **Execute safely** - Use precise matches or full rewrites
5. **Verify success** - Confirm changes applied correctly

**Remember: It's better to rewrite a small file than fail at text replacement!**