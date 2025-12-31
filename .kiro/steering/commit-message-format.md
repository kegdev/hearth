# Commit Message Format - Hearth App

## 🚨 CRITICAL RULE: Focus on Value, Not File Lists

**NEVER list files created/modified/deleted in commit messages - Git already shows this information!**

### ❌ WRONG - What NOT to include:
- File lists at the end of commit messages
- "Files created:", "Files modified:", "Files deleted:" sections
- Redundant information that Git already provides
- File paths that add no additional context
- Directory structures in commit messages

### ✅ CORRECT - What TO focus on:
- **What value was added** - Focus on functionality and improvements
- **What problems were solved** - Explain the why behind changes
- **What features were implemented** - Describe user-facing improvements
- **What technical improvements were made** - Architecture, performance, etc.

## 🎯 Improved Commit Message Structure

### Clean Format
```
type(scope): brief description of what was accomplished

- Focus on what this commit enables or improves
- Describe the value added to the project
- Explain any important technical decisions
- Note any breaking changes or requirements
- Keep it concise but informative
```

### Examples

#### ✅ GOOD: Value-Focused Commit
```
feat(ui): Add interactive tag cloud with precise filtering

- Create visual tag cloud with usage-based sizing on homepage
- Implement click-to-filter navigation with exact tag ID matching
- Add intelligent text contrast for accessibility compliance
- Include hover effects and smooth animations for better UX
- Support both search and tag filtering with clear state management
```

#### ❌ BAD: File-List Heavy Commit
```
feat(ui): Add interactive tag cloud with precise filtering

- Create visual tag cloud with usage-based sizing on homepage
- Implement click-to-filter navigation with exact tag ID matching
- Add intelligent text contrast for accessibility compliance

Files created:
- src/components/TagCloud.tsx
- .kiro/steering/frontend-styling-best-practices.md

Files modified:
- src/pages/HomePage.tsx
- src/pages/ItemsPage.tsx
- src/components/InventoryStats.tsx
```

## 🔧 Commit Message Best Practices

### Focus Areas
1. **User Impact** - How does this improve the user experience?
2. **Technical Value** - What architectural or performance improvements?
3. **Problem Solving** - What issues or limitations were addressed?
4. **Feature Completeness** - What new capabilities are now available?

### Content Guidelines
- **Be descriptive** - Explain what was accomplished, not just what was changed
- **Use present tense** - "Add feature" not "Added feature"
- **Include context** - Why was this change needed?
- **Highlight key improvements** - What's the most important aspect?
- **Note any requirements** - Dependencies, setup steps, breaking changes

### Scope Guidelines
- **ui** - User interface components and interactions
- **feat** - New features and functionality
- **fix** - Bug fixes and issue resolution
- **perf** - Performance improvements and optimizations
- **docs** - Documentation and steering file updates
- **refactor** - Code restructuring without functional changes
- **style** - Code formatting and styling improvements
- **test** - Testing infrastructure and test additions

## 🎨 Advanced Commit Patterns

### Multi-Component Features
```
feat(inventory): Implement comprehensive search and filtering system

- Add real-time search across items, containers, tags, and categories
- Implement intelligent pagination with 24 items per page for performance
- Include browser-native lazy loading for images
- Add URL parameter support for deep linking and navigation
- Optimize for offline usage with client-side filtering
```

### Bug Fixes with Context
```
fix(ui): Resolve tag color display issues in tag cloud

- Replace Bootstrap Badge with custom span to prevent CSS conflicts
- Add luminance-based text color calculation for accessibility
- Ensure custom tag colors display correctly without framework interference
- Maintain all interactive functionality and hover effects
```

### Documentation and Guidelines
```
docs(steering): Establish frontend styling best practices

- Create comprehensive CSS guidelines prohibiting !important declarations
- Document proper Bootstrap integration and override strategies
- Include semantic HTML and theme-aware styling requirements
- Provide practical examples and code review checklist
- Establish quality gates for maintainable styling patterns
```

### Performance Improvements
```
perf(cache): Optimize account authorization with extended TTL and session validation

- Extend cache TTL from 30 minutes to 2 hours for account status
- Add session-based validation to prevent repeated authorization checks
- Implement instant loading for approved users with background validation
- Reduce load times from 4-10 seconds to sub-second performance
```

## 🚨 Why File Lists Are Redundant

### Git Already Provides This Information
- `git show --name-only` - Shows files changed in any commit
- `git diff --name-only` - Shows files in current changes
- GitHub/GitLab UI - Displays file changes visually
- IDE integrations - Show file changes in commit views

### Focus on Value Instead
- **What can users do now** that they couldn't before?
- **What problems are solved** by this commit?
- **What technical debt was addressed** or improvements made?
- **What architectural decisions** were implemented?

### Commit Message Real Estate
- Limited space should focus on **why** and **what value**
- File paths add noise without context
- Reviewers can see file changes in the diff
- Future developers care about **intent** more than **location**

## 🔍 Code Review Benefits

### Cleaner Commit History
- Focus on functionality and value
- Easier to understand project evolution
- Better git archaeology for future debugging
- More meaningful commit browsing experience

### Better Documentation
- Commit messages become feature documentation
- Clear understanding of what each commit accomplishes
- Easier to write release notes from commit history
- Better context for code reviewers

## 🎯 Success Metrics

### Quality Gates
- **Zero file lists** in commit messages
- **Clear value proposition** for every commit
- **Descriptive functionality** explanations
- **Proper scope and type** usage

### Improved Workflow
- **Faster code review** - Focus on what matters
- **Better git history** - Meaningful commit browsing
- **Cleaner documentation** - Commits tell the story
- **Reduced noise** - No redundant information

## 🔄 Migration from Old Format

### Update Existing Patterns
- Remove "Files created/modified/deleted" sections
- Expand on functionality and value descriptions
- Add more context about why changes were made
- Focus on user and technical benefits

### New Commit Template
```
type(scope): brief description

- Primary value or feature added
- Key technical improvements or decisions
- Important context or problem solved
- Any breaking changes or requirements
```

---

**Remember: Git shows you the files - your commit message should tell you why those changes matter!**

**Status**: ✅ CRITICAL COMMIT RULE  
**Enforcement**: MANDATORY for all commits  
**Last Updated**: December 30, 2025