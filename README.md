# 🏠 Hearth - Home Inventory Management

A modern Progressive Web Application for organizing and managing your home inventory with QR code integration, built with React and Firebase.

![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.2.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple)
![OAuth Verified](https://img.shields.io/badge/Google%20OAuth-Verified-green)

## 🎯 Overview

Hearth is a comprehensive home inventory management system that helps you catalog, organize, and track your belongings. With QR code generation, photo storage, and intuitive categorization, you'll never lose track of your items again.

### ✨ Key Features

- **📦 Container Management** - Organize items by location (rooms, boxes, shelves)
- **🤝 Container Sharing** - Share containers with other users with granular permissions
- **📝 Item Cataloging** - Detailed item records with photos and descriptions
- **🏷️ Smart Tagging** - Flexible tagging system with auto-suggestions
- **📱 QR Code Integration** - Generate and print QR codes for physical containers
- **🔍 Advanced Search** - Find items quickly across your entire inventory
- **📊 Value Tracking** - Monitor purchase prices and current values
- **🌙 Dark Mode** - Beautiful light and dark themes
- **📱 PWA Support** - Install as a native app with offline functionality
- **🔐 User Management** - Secure user approval system with admin controls

## 🚀 Live Demo

Visit the live application at: **[https://hearth.keg.dev](https://hearth.keg.dev)**

*Note: New users require admin approval for access.*

### 📋 Legal & Privacy
- **[Privacy Policy](https://hearth.keg.dev/privacy-policy)** - Comprehensive data handling and Google OAuth compliance
- **[Terms of Service](https://hearth.keg.dev/terms-of-service)** - User agreement and service terms
- **[Contact](https://hearth.keg.dev/contact)** - Support and contact information

## 🛠️ Technology Stack

### **Frontend**
- **React 19.2.1** - Modern React with latest features and hooks
- **TypeScript 5.9.3** - Full type safety and enhanced developer experience
- **Vite 7.2.4** - Lightning-fast build tool and development server
- **React Router 7.10.1** - Client-side routing with lazy loading
- **Bootstrap 5.3.8** - Responsive UI components and styling
- **React Bootstrap 2.10.10** - Bootstrap components for React

### **Backend & Services**
- **Firebase 12.6.0** - Complete backend-as-a-service platform
  - **Firestore** - NoSQL database for real-time data
  - **Authentication** - Secure Google OAuth integration
  - **Storage** - Cloud storage for images (optional)
- **EmailJS 4.4.1** - Email notification service for admin alerts

### **State Management & Utilities**
- **Zustand 5.0.9** - Lightweight, performant state management
- **QRCode.react 4.2.0** - QR code generation for containers and items
- **Browser Image Compression 2.0.2** - Client-side image optimization

### **Development & Testing**
- **Jest 30.2.0** - Comprehensive testing framework
- **React Testing Library 16.3.0** - Component testing utilities
- **TypeScript ESLint** - Code quality and consistency
- **Vite PWA Plugin** - Progressive Web App capabilities

## 🏗️ Architecture

### **Project Structure**
```
hearth/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Route-based page components
│   ├── services/           # API and business logic
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions and utilities
│   └── styles/             # Global styles and themes
├── public/                 # Static assets
├── .ai/                    # Project documentation and guides
├── .github/                # GitHub Actions workflows
└── dist/                   # Production build output
```

### **Key Components**
- **AccountStatusGuard** - User approval system enforcement
- **Navbar** - Navigation with theme switching and user management
- **InventoryStats** - Real-time inventory statistics display
- **QRCodeModal** - QR code generation and printing interface
- **ImageUpload** - Drag-and-drop image handling with compression

### **Services Layer**
- **authService** - User authentication and session management
- **containerService** - Container CRUD operations
- **itemService** - Item management with image handling
- **userRegistrationService** - User approval workflow
- **emailNotificationService** - Admin notification system

## 🚦 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase project (optional for demo mode)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hearth.git
   cd hearth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### **Demo Mode**
The app runs in demo mode without Firebase configuration, allowing you to explore all features with local data storage.

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci      # CI-friendly test run
```

### **Development Features**
- **Hot Module Replacement** - Instant updates during development
- **TypeScript Integration** - Full type checking and IntelliSense
- **ESLint Configuration** - Code quality enforcement
- **Automatic Testing** - Jest with React Testing Library
- **PWA Development** - Service worker and manifest generation

### **Code Quality**
- **TypeScript** - 100% TypeScript codebase with strict mode
- **Testing** - 80%+ test coverage requirement
- **Linting** - ESLint with React and TypeScript rules
- **Formatting** - Consistent code formatting
- **Type Safety** - Comprehensive type definitions

## 🔐 Security & User Management

### **Data Privacy & Protection**
- **Minimal Data Collection** - Only collects data necessary for inventory management
- **Google OAuth Compliance** - Follows Google API Services User Data Policy
- **No Advertising** - User data never used for advertising or marketing
- **User Control** - Complete control over data with export and deletion options
- **Transparent Practices** - Clear privacy policy explaining all data handling

### **User Approval System**
- **Registration Requests** - Users submit access requests
- **Admin Dashboard** - Centralized user management interface
- **Email Notifications** - Automatic admin alerts for new requests
- **Status Management** - Pending, approved, denied user states

### **Security Features**
- **Firebase Authentication** - Secure Google OAuth integration
- **Firestore Rules** - Database-level security enforcement
- **Input Validation** - Client and server-side validation
- **XSS Protection** - Content Security Policy implementation
- **HTTPS Enforcement** - Secure communication only

### **Google OAuth Integration**
- **Limited Scope Access** - Only requests essential scopes (openid, email, profile)
- **Google API Services Compliance** - Adheres to Google API Services User Data Policy
- **OAuth Dev Verification** - ✅ Approved by Google for brand verification (Project ID: hearth-db)
- **No Data Sharing** - Google user data never shared with third parties
- **Secure Storage** - All user data encrypted and stored securely via Firebase
- **User Control** - Users can revoke access through Google Account settings

## 📱 Progressive Web App

### **PWA Features**
- **Offline Support** - Full functionality without internet connection
- **Intelligent Caching** - 30-minute TTL cache for containers, items, and account status
- **App Installation** - Install as native app on mobile/desktop
- **Background Updates** - Automatic app updates
- **Push Notifications** - Future enhancement capability
- **Responsive Design** - Optimized for all screen sizes

### **Offline Functionality**
Hearth provides comprehensive offline support through an intelligent caching system:

- **Cache-First Strategy** - Loads data from cache first for instant performance
- **Automatic Fallback** - Seamlessly switches to cached data when offline
- **Smart Cache Management** - Handles localStorage quota limits with graceful degradation
- **Image Preservation** - Maintains images when online, graceful fallback when offline
- **Debug Tools** - Development helpers (`debugCache()`, `clearCache()`) for troubleshooting

### **Performance Optimizations**
- **Sub-Second Load Times** - Intelligent caching reduces load times from 5-10 seconds to instant
- **Large Dataset Support** - Handles 127+ items with quota management and fallback caching
- **Service Worker Integration** - Enabled in development mode for comprehensive testing
- **Module Loading Fixes** - Direct imports for critical pages to prevent offline loading errors

### **Performance**
- **Lighthouse Score** - 90+ in all categories
- **Core Web Vitals** - Excellent performance metrics
- **Code Splitting** - Optimized bundle loading
- **Image Optimization** - Automatic compression and WebP support
- **Caching Strategy** - Intelligent service worker caching with TTL management

## 🎨 User Experience

### **Design Principles**
- **Mobile-First** - Designed primarily for mobile usage
- **Accessibility** - WCAG compliance with ARIA labels
- **Theme Support** - Beautiful light and dark modes
- **Intuitive Navigation** - Clear, consistent user interface
- **Positive Messaging** - Encouraging empty states and feedback

### **Key User Flows**
1. **Registration** - Request access → Admin approval → Full access
2. **Container Setup** - Create containers → Add items → Generate QR codes
3. **Item Management** - Add photos → Tag items → Track values
4. **Search & Discovery** - Find items → View details → Update information

## 🚀 Deployment

### **Production Deployment**
The app is configured for deployment to GitHub Pages with automated CI/CD:

- **GitHub Actions** - Automated testing and deployment
- **Custom Domain** - hearth.keg.dev with HTTPS
- **Environment Management** - Secure secrets handling
- **Performance Optimization** - Minified, optimized builds

### **Deployment Guide**
See [GitHub Pages Deployment Guide](.ai/GITHUB_PAGES_DEPLOYMENT_COMPREHENSIVE.md) for complete deployment instructions.

## 📊 Project Status

### **Current Version**: 100% Production Ready (v1.3.0) - Legal Compliance Complete
- ✅ **Core Features** - Complete inventory management system
- ✅ **Container Sharing** - Multi-user collaboration with permission levels
- ✅ **Global Search** - Cross-inventory search with real-time suggestions
- ✅ **Image Optimization** - Admin tool for compressing large images
- ✅ **Legal Compliance** - Complete Terms of Service, Privacy Policy, Contact, and About pages
- ✅ **User Management** - Full approval workflow implemented
- ✅ **Security** - Production-ready security measures with GDPR compliance
- ✅ **Testing** - Comprehensive test suite (80%+ coverage)
- ✅ **Performance** - Optimized for production use with image compression
- ✅ **Documentation** - Complete development and deployment guides

### **Recent Achievements**
- 🤝 **Container Sharing System** - Complete implementation with view/edit/admin permissions
- 👥 **User Collaboration** - Share containers with other approved users
- 🎨 **Visual Indicators** - Clear shared container identification and owner information
- 🔐 **Enhanced Security** - Comprehensive Firestore rules for sharing permissions
- 📧 **Email Notifications** - Admin alerts for registration requests
- 🧪 **Extensive Testing** - 80%+ test coverage with comprehensive test suite
- 📱 **PWA Optimization** - Enhanced mobile experience and offline functionality
- 🚀 **Production Deployment** - Live at hearth.keg.dev with 98% readiness score

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Maintain 80%+ test coverage
- Use semantic commit messages
- Follow existing code style and patterns
- Update documentation for new features

## 📚 Documentation

### **Available Guides**
- **[Container Sharing System](.ai/features/CONTAINER_SHARING_SYSTEM.md)** - Complete sharing feature guide
- **[Firebase Setup](.ai/FIREBASE_SETUP.md)** - Backend configuration guide
- **[Deployment Guide](.ai/GITHUB_PAGES_DEPLOYMENT_COMPREHENSIVE.md)** - Production deployment
- **[Testing Strategy](.ai/testing/TESTING_STRATEGY.md)** - Comprehensive testing approach
- **[Security Audit](.ai/audits/PRODUCTION_SECURITY_AUDIT.md)** - Security assessment
- **[Production Readiness](.ai/audits/PRODUCTION_READINESS_AUDIT_V4.md)** - Latest readiness audit
- **[Feature Documentation](.ai/features/)** - Individual feature guides

### **API Documentation**
- **Services** - Well-documented service layer with TypeScript types
- **Components** - Reusable components with prop documentation
- **Types** - Comprehensive TypeScript type definitions
- **Utils** - Helper functions and utilities

## 🐛 Issues & Support

### **Reporting Issues**
- Use GitHub Issues for bug reports and feature requests
- Provide detailed reproduction steps
- Include browser and device information
- Check existing issues before creating new ones

### **Getting Help**
- Check the documentation in the `.ai/` folder
- Review existing GitHub Issues
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** - For providing excellent backend-as-a-service platform
- **React Team** - For the amazing React framework
- **Vite** - For the lightning-fast build tool
- **Bootstrap** - For the responsive UI components
- **Open Source Community** - For the incredible ecosystem of tools and libraries

---

**Built with ❤️ for home organization enthusiasts**

*Hearth - Never lose track of your belongings again!* 🏠✨