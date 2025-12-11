// Analytics and performance monitoring utilities

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class Analytics {
  private static instance: Analytics;
  private isEnabled: boolean = false;

  private constructor() {
    // Initialize analytics in production only
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      this.initializeAnalytics();
    }
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private initializeAnalytics() {
    // Initialize Google Analytics if GA_MEASUREMENT_ID is provided
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && typeof window !== 'undefined') {
      // Load Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Initialize gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function() {
        (window as any).dataLayer.push(arguments);
      };
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', gaId);

      this.isEnabled = true;
    }
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isEnabled) return;

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title
      });
    }
  }

  // Track custom events
  trackEvent({ action, category, label, value }: AnalyticsEvent) {
    if (!this.isEnabled) return;

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', { action, category, label, value });
    }
  }

  // Track user actions
  trackUserAction(action: string, details?: Record<string, any>) {
    this.trackEvent({
      action,
      category: 'User Action',
      label: details ? JSON.stringify(details) : undefined
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.trackEvent({
      action: metric,
      category: 'Performance',
      label: unit,
      value: Math.round(value)
    });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.trackEvent({
      action: 'Error',
      category: 'JavaScript Error',
      label: `${context ? context + ': ' : ''}${error.message}`
    });
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static startTiming(label: string) {
    this.marks.set(label, performance.now());
  }

  static endTiming(label: string) {
    const startTime = this.marks.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      Analytics.getInstance().trackPerformance(label, duration);
      this.marks.delete(label);
      return duration;
    }
    return 0;
  }

  static measureWebVitals() {
    // Measure Core Web Vitals if supported
    if ('web-vital' in window) {
      // This would require web-vitals library
      // For now, we'll use basic performance API
      
      // Measure page load time
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        Analytics.getInstance().trackPerformance('Page Load Time', loadTime);
      });

      // Measure First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            Analytics.getInstance().trackPerformance('First Contentful Paint', entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    }
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Convenience functions for common tracking
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  analytics.trackUserAction(action, details);
};

export const trackPageView = (path: string, title?: string) => {
  analytics.trackPageView(path, title);
};

export const trackError = (error: Error, context?: string) => {
  analytics.trackError(error, context);
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.measureWebVitals();
}