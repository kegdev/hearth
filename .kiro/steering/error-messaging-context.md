---
inclusion: always
---

# Error Messaging Context - Hearth App

## 🚨 CRITICAL UX RULE: Empty States vs Real Errors

**NEVER show error messages for empty data states!**

### ❌ WRONG - What NOT to do:
- "Failed to fetch items" when user has no items
- "Failed to fetch containers" when user has no containers  
- "Unable to load your items" when containers/items arrays are empty
- Any error message when the API call succeeds but returns empty results

### ✅ CORRECT - What TO do:
- Show **positive, encouraging empty state messages**
- Only show error messages for **actual network/API failures**
- Distinguish between `[]` (empty success) and `throw error` (actual failure)

## 🎯 Implementation Pattern

```typescript
// CORRECT pattern for service calls
try {
  const items = await getItems(userId);
  // items = [] is SUCCESS, not an error!
  setItems(items);
  setError(''); // Clear any previous errors
  
  // Handle empty state in UI with positive messaging
} catch (actualError) {
  // Only catch real failures (network, auth, etc.)
  setError('Unable to connect. Please check your connection.');
}
```

## 📝 Approved Empty State Messages

### Containers Page (No Containers)
```
🎉 Welcome to Your Inventory!
You're all set up! Let's create your first container to start organizing your items.
```

### Items Page (No Items)
```
🎯 Great! Your Containers Are Ready
Now let's add some items to your containers and start building your inventory!
```

### Container Detail (No Items)
```
✨ Perfect! Your Container is Ready
Time to add some items to "Container Name"!
```

## 🔧 Error Message Guidelines

### Real Network Errors Only
- "Unable to connect to your inventory. Please check your internet connection."
- "Something went wrong. Please try again."
- "Unable to save changes. Please check your connection."

### Never Use These for Empty States
- ❌ "Failed to fetch"
- ❌ "Unable to load"  
- ❌ "Error loading"
- ❌ "No data found" (this sounds like an error)

## 🎨 UX Principles
1. **Empty = Opportunity** (not failure)
2. **Positive Language** ("Ready!", "Perfect!", "Great!")
3. **Clear Next Steps** (what can user do now?)
4. **Encouraging Tone** (make users feel good about using the app)

## 🚨 When This Rule Was Broken
- **Issue**: Error messages showing on containers/items pages for empty states
- **Impact**: Users think the app is broken when it's working perfectly
- **Fix**: Always check if it's empty data (success) vs actual error (failure)

**Remember: An empty array `[]` is a successful response, not an error!**