'use client';

import { useEffect } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export const PerformanceOptimizer = ({ children }: PerformanceOptimizerProps) => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload the API endpoint
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = '/api/generate';
      document.head.appendChild(link);

      // Preload fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      fontLink.as = 'style';
      document.head.appendChild(fontLink);
    };

    // Optimize images and lazy loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('loading');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // Service Worker registration for caching
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully');
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    // Performance monitoring
    const monitorPerformance = () => {
      // Monitor Core Web Vitals
      if ('web-vital' in window) {
        // This would integrate with a real monitoring service
        console.log('Performance monitoring initialized');
      }

      // Monitor API response times
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = performance.now();
        const response = await originalFetch(...args);
        const end = performance.now();
        
        if (args[0]?.toString().includes('/api/')) {
          console.log(`API call to ${args[0]} took ${end - start}ms`);
        }
        
        return response;
      };
    };

    // Initialize optimizations
    preloadCriticalResources();
    optimizeImages();
    registerServiceWorker();
    monitorPerformance();

    // Cleanup
    return () => {
      // Restore original fetch if needed
    };
  }, []);

  return <>{children}</>;
};

// Hook for performance metrics
export const usePerformanceMetrics = () => {
  useEffect(() => {
    // Measure and report performance metrics
    const measurePerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics = {
          // Core Web Vitals approximations
          LCP: navigation.loadEventEnd - navigation.loadEventStart, // Simplified LCP
          FID: navigation.domInteractive - navigation.fetchStart, // Simplified FID
          CLS: 0, // Would need real measurement
          
          // Other metrics
          TTFB: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart
        };

        // In a real app, you'd send these to your analytics service
        console.log('Performance Metrics:', metrics);
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }
  }, []);
};