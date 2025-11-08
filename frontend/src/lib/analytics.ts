/**
 * Google Analytics Event Tracking
 * Utility functions for tracking user interactions
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Track custom events
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Track page views (for SPAs)
 */
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-6V9NW6WZ9C', {
      page_path: url,
      page_title: title,
    });
  }
};

/**
 * Track user sign-ups
 */
export const trackSignUp = (method: 'email' | 'google') => {
  trackEvent('sign_up', {
    method,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track user sign-ins
 */
export const trackSignIn = (method: 'email' | 'google') => {
  trackEvent('login', {
    method,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track questionnaire completion
 */
export const trackQuestionnaireComplete = (
  businessType: string,
  offeringType: string
) => {
  trackEvent('questionnaire_complete', {
    business_type: businessType,
    offering_type: offeringType,
  });
};

/**
 * Track pricing recommendation viewed
 */
export const trackPricingView = (consultationId: string) => {
  trackEvent('pricing_recommendation_viewed', {
    consultation_id: consultationId,
  });
};

/**
 * Track credit purchase intent
 */
export const trackCreditPurchaseIntent = () => {
  trackEvent('credit_purchase_intent', {
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track blog post views
 */
export const trackBlogView = (postTitle: string, postCategory: string) => {
  trackEvent('blog_view', {
    post_title: postTitle,
    post_category: postCategory,
  });
};

/**
 * Track CTA clicks
 */
export const trackCTAClick = (
  ctaLocation: string,
  ctaText: string,
  destination: string
) => {
  trackEvent('cta_click', {
    cta_location: ctaLocation,
    cta_text: ctaText,
    destination,
  });
};

/**
 * Track document uploads
 */
export const trackDocumentUpload = (fileType: string, fileSize: number) => {
  trackEvent('document_upload', {
    file_type: fileType,
    file_size_kb: Math.round(fileSize / 1024),
  });
};

/**
 * Track errors
 */
export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
  });
};

