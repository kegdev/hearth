# Commit Suggestion Workflow - Hearth App

## 🚨 CRITICAL WORKFLOW RULE: Always Suggest Commits

**ALWAYS suggest a commit message when completing work!**

### ✅ REQUIRED - When to suggest commits:
- After completing any feature implementation
- After fixing bugs or issues
- After updating configuration files
- After adding new functionality
- After refactoring or optimization
- After updating documentation
- After any file modifications that represent completed work

### 🎯 Implementation Pattern

**End every completed task with:**
```
## 📝 Ready to Commit

Here's a commit message for your changes:

```
[commit message here]
```

This captures [brief description of what was accomplished].
```

## 🔧 Commit Message Guidelines

### Structure
```
type(scope): brief description

- Detailed bullet points of changes
- Include file paths when relevant
- Mention breaking changes if any
- Note any setup requirements

Files modified:
- path/to/file1.ext
- path/to/file2.ext
```

### Commit Types
- **feat**: New features or functionality
- **fix**: Bug fixes
- **refactor**: Code refactoring without functional changes
- **docs**: Documentation updates
- **style**: Code style/formatting changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **config**: Configuration changes
- **security**: Security improvements

### Examples

#### ✅ GOOD: Feature Addition
```
feat(inventory): Add test data seeding system for demo purposes

- Create testDataSeeder utility with kitchen storage container and 8 sample items
- Add test data management section to admin dashboard
- Include realistic product details, pricing, and warranty information
- Prevent duplicate test data creation with validation
- Add loading states and success notifications

Files modified:
- src/utils/testDataSeeder.ts
- src/pages/AdminDashboardPage.tsx
```

#### ✅ GOOD: Bug Fix
```
fix(auth): Resolve admin link visibility issue with environment variables

- Replace hardcoded admin email with VITE_ADMIN_EMAIL environment variable
- Update Firestore rules to use profile-based admin validation
- Add admin email to GitHub Actions build environment

Files modified:
- src/components/Navbar.tsx
- src/utils/initializeAdmin.ts
- firestore.rules
```

#### ✅ GOOD: Configuration Update
```
config(deployment): Add admin email secret to GitHub Actions workflow

- Include VITE_ADMIN_EMAIL in build environment variables
- Enable secure admin configuration via repository secrets

Files modified:
- .github/workflows/deploy.yml
```

## 🎨 Commit Message Best Practices

### Content Guidelines
- **Be specific** - Explain what changed and why
- **Use present tense** - "Add feature" not "Added feature"
- **Include context** - Mention the problem being solved
- **List files** - Help reviewers understand scope
- **Note requirements** - Mention any setup needed

### Scope Guidelines
- **inventory** - Container and item management
- **auth** - Authentication and authorization
- **admin** - Admin dashboard and user management
- **ui** - User interface components
- **config** - Configuration and deployment
- **test** - Testing infrastructure
- **docs** - Documentation updates

## 🚨 When This Rule Should Apply

### ✅ ALWAYS suggest commits for:
- Completed feature implementations
- Bug fixes that resolve issues
- Configuration changes
- New utility functions or services
- UI improvements or additions
- Security enhancements
- Performance optimizations

### ❌ DON'T suggest commits for:
- Incomplete work in progress
- Exploratory code that will be changed
- Temporary debugging code
- Work that needs user input before completion

## 🎯 Success Metrics

### Quality Gates
- **Every completed task** ends with a commit suggestion
- **Commit messages** are descriptive and actionable
- **File lists** help users understand scope
- **Setup requirements** are clearly noted

### User Benefits
- **Clear progress tracking** - Know when work is complete
- **Easy version control** - Ready-to-use commit messages
- **Better documentation** - Detailed change descriptions
- **Reduced friction** - No need to write commit messages from scratch

## 🔄 Workflow Summary

1. **Complete the requested work** - Implement features, fix bugs, etc.
2. **Verify everything works** - Test changes and ensure quality
3. **Summarize what was done** - List key changes and improvements
4. **Suggest commit message** - Provide ready-to-use commit text
5. **Include file list** - Show what files were modified
6. **Note any requirements** - Mention setup steps if needed

**Remember: A good commit message helps users track progress and understand changes!**