# Firebase Deployment Context - Hearth App

## 🔧 Firebase CLI Preference

**User prefers manual Firebase rule deployment via Firebase Console**

### ❌ DON'T suggest:
- Installing Firebase CLI (`npm install -g firebase-tools`)
- Using `firebase deploy --only firestore:rules` commands
- Any CLI-based Firebase deployment instructions

### ✅ DO suggest instead:
- Copy rules content to Firebase Console manually
- Navigate to Firebase Console → Firestore Database → Rules
- Paste updated rules and click "Publish"
- Mention that rules need to be deployed but user handles it manually

## 📝 Approved Firebase Rule Update Instructions

When Firestore rules are updated:

```
The Firestore rules have been updated in your local firestore.rules file. 

To deploy them:
1. Go to Firebase Console → Firestore Database → Rules
2. Copy the content from your firestore.rules file
3. Paste it in the console and click "Publish"

The rules include validation for [specific changes made].
```

## 🎯 User Workflow
- User manages Firebase deployments manually via web console
- Kiro provides rule updates in local files
- User handles the deployment step independently
- No need to suggest CLI installation or usage

**Remember: User is comfortable with manual Firebase Console deployment!**