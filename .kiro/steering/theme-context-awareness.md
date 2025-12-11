# Theme Context Awareness - Hearth App

## 🎨 CRITICAL UI RULE: Always Consider Dark/Light Mode

**NEVER use hardcoded colors without considering theme switching!**

### ❌ WRONG - What NOT to do:
- Hardcoded light colors: `backgroundColor: '#f8f9fa'`, `color: '#212529'`
- Fixed text colors that don't adapt to theme
- Inline styles that override Bootstrap's theme-aware classes
- Assuming light mode when styling components

### ✅ CORRECT - What TO do:
- Use **Bootstrap theme-aware classes** that adapt automatically
- Leverage CSS custom properties that change with theme
- Test components in both light and dark modes
- Use semantic color classes instead of specific hex values

## 🎯 Implementation Pattern

### Use Bootstrap Theme Classes
```tsx
// ✅ GOOD - Adapts to theme automatically
<div className="bg-light text-dark border rounded p-3">
  {content}
</div>

// ❌ BAD - Fixed colors, breaks in dark mode
<div style={{ backgroundColor: '#f8f9fa', color: '#212529' }}>
  {content}
</div>
```

### Theme-Aware Color Classes
```tsx
// ✅ Background colors that adapt
className="bg-light"        // Light background in light mode, dark in dark mode
className="bg-secondary"    // Secondary theme color
className="bg-body"         // Body background color

// ✅ Text colors that adapt  
className="text-body"       // Primary text color
className="text-muted"      // Muted text color
className="text-secondary"  // Secondary text color

// ✅ Border colors that adapt
className="border"          // Default border color
className="border-secondary" // Secondary border color
```

## 🔧 Hearth App Theme System

### Current Theme Implementation
- **Theme Store**: `src/store/themeStore.ts` manages dark/light mode
- **Theme Toggle**: Available in navbar for users
- **Bootstrap Integration**: Uses Bootstrap's built-in dark mode support
- **Persistence**: Theme preference saved to localStorage

### Approved Color Patterns

#### Backgrounds
```tsx
// ✅ Content backgrounds
className="bg-body"           // Main content background
className="bg-light"          // Subtle highlight background  
className="bg-secondary"      // Secondary content background

// ✅ Interactive backgrounds
className="bg-primary"        // Primary action backgrounds
className="bg-success"        // Success state backgrounds
className="bg-warning"        // Warning state backgrounds
```

#### Text Colors
```tsx
// ✅ Text hierarchy
className="text-body"         // Primary text
className="text-muted"        // Secondary/helper text
className="text-secondary"    // Less important text

// ✅ Semantic text colors
className="text-success"      // Success messages
className="text-danger"       // Error messages  
className="text-warning"      // Warning messages
```

#### Borders
```tsx
// ✅ Border styles
className="border"            // Default border
className="border-light"      // Subtle borders
className="border-secondary"  // Secondary borders
```

## 🚨 When This Rule Was Broken
- **Issue**: Admin modal reason field used hardcoded light colors
- **Impact**: Text invisible or hard to read in dark mode
- **Fix**: Use Bootstrap theme classes instead of inline styles

## 🎨 Testing Requirements

### Before Committing UI Changes:
1. **Test in light mode** - Verify readability and contrast
2. **Test in dark mode** - Ensure colors adapt properly  
3. **Check contrast ratios** - Ensure accessibility compliance
4. **Verify interactive states** - Hover, focus, active states work in both themes

### Theme Testing Checklist:
- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode  
- [ ] Text is readable with sufficient contrast in both modes
- [ ] Interactive elements (buttons, links) work in both modes
- [ ] No hardcoded colors that break theme switching
- [ ] Uses semantic Bootstrap classes where possible

## 📝 Approved Patterns

### ✅ SAFE: Theme-aware modal content
```tsx
<div className="mb-3">
  <strong>Question Label</strong>
  <div className="border rounded p-3 mt-2 bg-light">
    <div className="text-body">
      {userResponse || (
        <span className="text-muted fst-italic">No response provided</span>
      )}
    </div>
  </div>
</div>
```

### ✅ SAFE: Theme-aware cards
```tsx
<Card className="bg-body border">
  <Card.Header className="bg-light border-bottom">
    <h5 className="text-body mb-0">Title</h5>
  </Card.Header>
  <Card.Body>
    <p className="text-body">Content</p>
    <small className="text-muted">Helper text</small>
  </Card.Body>
</Card>
```

### ❌ RISKY: Hardcoded colors
```tsx
// Don't do this - breaks in dark mode
<div style={{ 
  backgroundColor: '#ffffff', 
  color: '#000000',
  borderColor: '#dee2e6' 
}}>
  Content
</div>
```

## 🎯 Success Metrics

### Quality Gates
- **Zero hardcoded colors** - All colors use Bootstrap classes
- **Theme compatibility** - Works perfectly in both light and dark modes
- **Accessibility compliance** - Meets contrast ratio requirements
- **Consistent styling** - Follows app-wide theme patterns

### Best Practices
- **Bootstrap first** - Use Bootstrap classes before custom styles
- **Semantic colors** - Use meaning-based color classes (success, warning, etc.)
- **Test both themes** - Always verify in light and dark modes
- **Accessibility focus** - Ensure sufficient contrast in all themes

## 🔄 Workflow Summary

1. **Design component** - Plan using Bootstrap theme classes
2. **Implement with Bootstrap** - Use semantic color classes
3. **Test light mode** - Verify appearance and functionality
4. **Test dark mode** - Switch theme and verify again
5. **Check accessibility** - Ensure contrast ratios are met
6. **Review for hardcoded colors** - Remove any fixed color values

**Remember: A good UI component works beautifully in both light and dark themes!**