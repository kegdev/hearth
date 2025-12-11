// Mock for analytics
module.exports = {
  initializeAnalytics: jest.fn(),
  trackEvent: jest.fn(),
  trackPageView: jest.fn()
};