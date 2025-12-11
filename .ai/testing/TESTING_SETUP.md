# Testing Setup Guide - Hearth App

## 🚀 Quick Start

This guide will set up comprehensive unit testing for the Hearth app with GitHub Actions integration.

## 📦 Step 1: Install Testing Dependencies

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @testing-library/react-hooks \
  jest \
  jest-environment-jsdom \
  jest-canvas-mock \
  @types/jest \
  firebase-mock \
  msw \
  @firebase/rules-unit-testing
```

## ⚙️ Step 2: Configure Jest

Create `jest.config.js` in project root:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: ['jest-canvas-mock']
};
```

## 🔧 Step 3: Create Test Setup Files

### `src/setupTests.ts`
```typescript
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import 'jest-canvas-mock';

// Configure React Testing Library
configure({ testIdAttribute: 'data-testid' });

// Mock Firebase
jest.mock('./firebase/config', () => ({
  db: null,
  auth: null,
  isFirebaseConfigured: false
}));

// Mock environment variables
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.VITE_FIREBASE_APP_ID = 'test-app-id';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};
```

### `src/__mocks__/fileMock.js`
```javascript
module.exports = 'test-file-stub';
```

## 📝 Step 4: Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false --passWithNoTests"
  }
}
```

## 🧪 Step 5: Create Sample Test Files

### `src/components/__tests__/Navbar.test.tsx`
```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Navbar from '../Navbar';

// Mock the auth store
jest.mock('../../store/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders brand logo and name', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByText('🏠')).toBeInTheDocument();
    expect(screen.getByText('Hearth')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
```

### `src/services/__tests__/itemService.test.ts`
```typescript
import { createItem, getUserItems } from '../itemService';
import type { CreateItemData } from '../../types';

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: null,
  isFirebaseConfigured: false
}));

describe('Item Service', () => {
  const mockUserId = 'test-user-id';
  const mockItemData: CreateItemData = {
    name: 'Test Item',
    description: 'Test Description',
    containerId: 'test-container-id',
    tags: ['tag1', 'tag2'],
    categoryId: 'test-category-id',
    purchasePrice: 100,
    currentValue: 90,
    condition: 'good'
  };

  describe('createItem', () => {
    it('creates item in demo mode', async () => {
      const result = await createItem(mockUserId, mockItemData);
      
      expect(result).toMatchObject({
        name: mockItemData.name,
        description: mockItemData.description,
        containerId: mockItemData.containerId,
        userId: mockUserId,
        purchasePrice: mockItemData.purchasePrice,
        currentValue: mockItemData.currentValue,
        condition: mockItemData.condition
      });
      
      expect(result.id).toMatch(/^demo_item_/);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('handles image compression in demo mode', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const itemWithImage = { ...mockItemData, image: mockFile };
      
      const result = await createItem(mockUserId, itemWithImage);
      
      expect(result.imageUrl).toBeDefined();
      expect(typeof result.imageUrl).toBe('string');
    });
  });

  describe('getUserItems', () => {
    it('returns empty array in demo mode', async () => {
      const result = await getUserItems(mockUserId);
      
      expect(result).toEqual([]);
    });
  });
});
```

### `src/utils/__tests__/validation.test.ts`
```typescript
import { validateEmail, validatePassword } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('MySecure2024')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });
});
```

## 🔄 Step 6: Update GitHub Actions Workflow

Update `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test:ci
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: hearth.keg.dev
```

## 🎯 Step 7: Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

## 📊 Step 8: Coverage Reporting

The setup includes:
- **Local coverage**: Generated in `coverage/` directory
- **HTML reports**: Open `coverage/lcov-report/index.html`
- **CI integration**: Automatic coverage upload to Codecov
- **Threshold enforcement**: Builds fail if coverage drops below 80%

## 🔧 Step 9: IDE Integration

### VS Code Extensions
- **Jest**: Syntax highlighting and test running
- **Coverage Gutters**: Inline coverage indicators
- **Test Explorer**: Visual test management

### Configuration
Add to `.vscode/settings.json`:
```json
{
  "jest.autoRun": "watch",
  "jest.showCoverageOnLoad": true,
  "coverage-gutters.showLineCoverage": true
}
```

## 🚀 Next Steps

1. **Run the setup**: Execute all commands above
2. **Write tests**: Start with critical components
3. **Monitor coverage**: Aim for 80%+ coverage
4. **Integrate CI**: Push to GitHub to trigger actions
5. **Iterate**: Add tests as you develop new features

## 🎯 Success Checklist

- ✅ All dependencies installed
- ✅ Jest configuration working
- ✅ Sample tests passing
- ✅ Coverage reports generating
- ✅ GitHub Actions running tests
- ✅ Deployment blocked on test failures
- ✅ Coverage thresholds enforced

Your Hearth app now has comprehensive testing with automated CI/CD integration! 🧪✨