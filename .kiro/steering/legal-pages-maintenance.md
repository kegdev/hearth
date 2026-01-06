---
inclusion: always
---

# Legal Pages Maintenance - Hearth App

## 🚨 CRITICAL RULE: Keep Legal Pages Current

**ALWAYS update legal pages when adding new features or making significant changes!**

### ❌ WRONG - What NOT to do:
- Deploy new features without updating Terms of Service
- Add data collection without updating Privacy Policy
- Change contact information without updating Contact page
- Release new versions without updating About page
- Ignore legal page maintenance during feature development

### ✅ CORRECT - What TO do:
- **Review legal pages** for every new feature
- **Update Terms of Service** when functionality changes
- **Update Privacy Policy** when data handling changes
- **Update About page** with new features and version info
- **Update Contact page** when support processes change

## 🎯 Legal Page Update Triggers

### When to Update Terms of Service
- **New Features**: Any new functionality that users interact with
- **Data Changes**: New data collection, storage, or sharing
- **User Permissions**: Changes to user roles or access levels
- **Service Changes**: Modifications to how the service works
- **Policy Changes**: Updates to acceptable use or limitations

### When to Update Privacy Policy
- **Data Collection**: New types of data being collected
- **Data Usage**: Changes in how data is processed or used
- **Third-Party Services**: New integrations or service providers
- **Data Sharing**: Changes to sharing practices or permissions
- **User Rights**: Updates to user control or data rights

### When to Update About Page
- **New Features**: Major feature additions or improvements
- **Version Updates**: New version releases with significant changes
- **Technology Changes**: Updates to tech stack or architecture
- **Performance Improvements**: Notable performance or optimization updates
- **User Benefits**: New capabilities or user value propositions

### When to Update Contact Page
- **Support Changes**: New support channels or processes
- **Contact Information**: Email addresses or contact methods
- **FAQ Updates**: New frequently asked questions
- **Feature Questions**: Support for new features in FAQ section

## 🔧 Specific Update Requirements

### Terms of Service Updates Required For:
- **Container Sharing**: ✅ Already covered - sharing permissions and responsibilities
- **Global Search**: ✅ Already covered - data access and search functionality
- **Image Optimization**: ✅ Already covered - data processing and storage
- **QR Code Generation**: ✅ Already covered - QR code usage and printing
- **User Registration**: ✅ Already covered - approval process and account management

### Privacy Policy Updates Required For:
- **New Data Types**: Any new user data being collected
- **Analytics Changes**: New tracking or analytics implementations
- **Cookie Updates**: Changes to browser storage or tracking
- **Third-Party Integrations**: New external services or APIs
- **Data Retention**: Changes to how long data is kept

### About Page Updates Required For:
- **Feature Additions**: New major features or capabilities
- **Version Releases**: Significant version updates (1.3.0, 1.4.0, etc.)
- **Performance Metrics**: Updated Lighthouse scores or performance data
- **Technology Updates**: Major framework or dependency updates
- **User Statistics**: Updated user counts or usage metrics

## 📝 Update Checklist Template

### Before Each Deployment:
- [ ] **Review Terms of Service** - Does it cover all current features?
- [ ] **Review Privacy Policy** - Does it cover all data practices?
- [ ] **Review About Page** - Are features and version info current?
- [ ] **Review Contact Page** - Is support information accurate?
- [ ] **Update "Last Updated" dates** on modified pages
- [ ] **Test all legal page links** in navbar and footer
- [ ] **Verify mobile responsiveness** of updated content

### For Major Feature Releases:
- [ ] **Add feature to Terms of Service** if it affects user agreements
- [ ] **Add data handling to Privacy Policy** if it involves new data
- [ ] **Add feature description to About Page** with benefits and use cases
- [ ] **Add feature support to Contact FAQ** if users might have questions
- [ ] **Update version number** in About page and contact page
- [ ] **Update feature lists** and capabilities descriptions

## 🎯 Specific Page Maintenance

### Terms of Service (src/pages/TermsOfServicePage.tsx)
```typescript
// Always update "Last Updated" date when making changes
<p className="text-muted mb-4">
  <strong>Last Updated:</strong> [CURRENT_DATE]
</p>

// Add new features to Section 2 "Description of Service"
// Add new data practices to Section 5 "User Content and Data"
// Add new sharing features to Section 7 "Container Sharing"
```

### Privacy Policy (src/pages/PrivacyPolicyPage.tsx)
```typescript
// Always update "Last Updated" date when making changes
<p className="text-muted mb-4">
  <strong>Last Updated:</strong> [CURRENT_DATE]
</p>

// Add new data types to Section 1 "Information We Collect"
// Add new usage to Section 2 "How We Use Your Information"
// Add new services to Section 3.2 "Service Providers"
```

### About Page (src/pages/AboutPage.tsx)
```typescript
// Update version in Section "Version History"
<Badge bg="primary">v[NEW_VERSION]</Badge> <strong>Current Version</strong>
<ul>
  <li>[New feature descriptions]</li>
  <li>[Performance improvements]</li>
  <li>[User experience enhancements]</li>
</ul>

// Update feature lists in "Key Features" section
// Update performance metrics if significantly changed
```

### Contact Page (src/pages/ContactPage.tsx)
```typescript
// Update version number in Application Information
<p><strong>Version:</strong> [CURRENT_VERSION]</p>

// Add new features to FAQ section
<div className="mb-3">
  <h4>[New Feature Question]</h4>
  <p>[Clear explanation of how the feature works]</p>
</div>
```

## 🚨 Common Mistakes to Avoid

### Don't Forget These Updates:
- **Date stamps** - Always update "Last Updated" dates
- **Version numbers** - Keep version info current across all pages
- **Feature descriptions** - Ensure all current features are documented
- **Contact information** - Verify all email addresses and links work
- **Cross-references** - Update links between legal pages when content changes

### Red Flags in Legal Pages:
- Outdated "Last Updated" dates (more than 6 months old)
- Missing features in Terms of Service or About page
- Incorrect version numbers or outdated technology info
- Broken links or incorrect contact information
- Privacy Policy that doesn't match current data practices

## 🔄 Maintenance Schedule

### With Every Feature Release:
1. **Review all legal pages** for relevance to new features
2. **Update applicable sections** with new functionality
3. **Update version numbers** and last updated dates
4. **Test all links and navigation** to legal pages
5. **Verify mobile display** of updated content

### Monthly Review:
- Check for any missed updates from recent deployments
- Verify all contact information is still accurate
- Review FAQ section for new common questions
- Update any outdated technology or performance information

### Quarterly Deep Review:
- Complete review of all legal content for accuracy
- Update any changed business practices or policies
- Review and update FAQ based on actual user questions
- Verify compliance with any new legal requirements

## 📊 Success Metrics

### Legal Page Quality Gates:
- **Currency**: All pages updated within 30 days of related changes
- **Accuracy**: All features and practices accurately documented
- **Completeness**: No missing features or data practices
- **Accessibility**: All legal pages mobile-friendly and readable
- **Navigation**: All legal pages easily accessible from navbar and footer

### Maintenance Indicators:
- **Last Updated dates** are current (within 3 months)
- **Version numbers** match current application version
- **Feature lists** include all major functionality
- **Contact information** is accurate and responsive
- **Links and navigation** work correctly across all devices

## 🎯 Implementation Reminders

### Before Every Commit with New Features:
```bash
# Check if legal pages need updates
echo "Does this feature require legal page updates?"
echo "- Terms of Service: New user functionality?"
echo "- Privacy Policy: New data collection/usage?"
echo "- About Page: Major feature worth highlighting?"
echo "- Contact Page: New FAQ needed?"
```

### Before Every Deployment:
```bash
# Verify legal page currency
echo "Legal page maintenance checklist:"
echo "- [ ] Terms updated for new features"
echo "- [ ] Privacy updated for data changes"  
echo "- [ ] About updated with version info"
echo "- [ ] Contact updated with support info"
echo "- [ ] All 'Last Updated' dates current"
```

---

**Remember: Legal pages are not "set it and forget it" - they require ongoing maintenance to stay accurate and compliant!**

**Status**: ✅ CRITICAL MAINTENANCE RULE  
**Enforcement**: MANDATORY for all feature releases  
**Last Updated**: January 3, 2026