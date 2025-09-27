// src/lib/cspUtils.ts

// Get current origin for dynamic CSP configuration
const getCurrentOrigin = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

// Debug function to help troubleshoot CSP and Google API issues
export const debugGoogleAPIs = () => {
  if (typeof window === 'undefined') return;

  console.group('🔍 Google APIs Debug Information');

  // Environment info
  console.log('Current origin:', getCurrentOrigin());
  console.log('User agent:', navigator.userAgent);

  // CSP info
  const cspMetaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMetaTag) {
    console.log('CSP meta tag found:', (cspMetaTag as HTMLMetaElement).content);
  } else {
    console.log('No CSP meta tag found');
  }

  // Google APIs availability
  console.log('window.gapi available:', !!window.gapi);
  console.log('window.google available:', !!window.google);

  // Check for CSP violations
  const violations = [];
  if (!window.gapi) violations.push('gapi not loaded - check script-src CSP');
  if (!window.google) violations.push('google not loaded - check script-src CSP');

  if (violations.length > 0) {
    console.warn('Potential CSP violations:', violations);
  } else {
    console.log('✅ Google APIs appear to be loading correctly');
  }

  console.groupEnd();
};

// Client-side CSP management for Google APIs
export const enableGoogleAPIsCSP = () => {
  if (typeof window === 'undefined') return;

  const currentOrigin = getCurrentOrigin();
  console.log('🔧 Updating CSP for Google APIs on:', currentOrigin);

  // Create or update CSP meta tag for Google APIs
  const cspMetaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;

  const googleAPICSP = [
    `default-src 'self' ${currentOrigin}`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com https://ssl.gstatic.com ${currentOrigin}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${currentOrigin}`,
    `font-src 'self' https://fonts.gstatic.com ${currentOrigin}`,
    `connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com ${currentOrigin}`,
    "frame-src 'self' https://accounts.google.com https://content.googleapis.com",
    `img-src 'self' data: blob: https: ${currentOrigin}`,
    `media-src 'self' ${currentOrigin}`,
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');

  if (cspMetaTag) {
    // Update existing CSP meta tag
    cspMetaTag.content = googleAPICSP;
    console.log('✅ Updated existing CSP meta tag');
  } else {
    // Create new CSP meta tag
    const newCspMetaTag = document.createElement('meta');
    newCspMetaTag.httpEquiv = 'Content-Security-Policy';
    newCspMetaTag.content = googleAPICSP;
    document.head.appendChild(newCspMetaTag);
    console.log('✅ Created new CSP meta tag');
  }

  console.log('CSP policy applied:', googleAPICSP);
};

// Check if Google APIs are available and ready
export const waitForGoogleAPIs = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      console.log('❌ waitForGoogleAPIs: Not in browser environment');
      resolve(false);
      return;
    }

    const maxAttempts = 100; // 10 seconds
    let attempts = 0;

    const checkAPIs = () => {
      attempts++;

      if (window.gapi && window.google) {
        console.log('✅ Google APIs loaded successfully after', attempts, 'attempts');
        resolve(true);
      } else if (attempts < maxAttempts) {
        if (attempts % 20 === 0) { // Log every 2 seconds
          console.log(`⏳ Waiting for Google APIs... (${attempts}/100)`);
        }
        setTimeout(checkAPIs, 100);
      } else {
        console.warn('❌ Google APIs failed to load within timeout (10 seconds)');
        console.warn('Available globals:', { gapi: !!window.gapi, google: !!window.google });
        debugGoogleAPIs();
        resolve(false);
      }
    };

    // Start checking immediately
    checkAPIs();
  });
};

// Initialize Google APIs with CSP fixes
export const initializeGoogleAPIs = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    console.log('❌ initializeGoogleAPIs: Not in browser environment');
    return false;
  }

  try {
    console.log('🚀 Initializing Google APIs...');

    // First, ensure CSP allows Google APIs
    enableGoogleAPIsCSP();

    // Wait a moment for CSP to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    // Wait for Google APIs to load
    const loaded = await waitForGoogleAPIs();

    if (!loaded) {
      console.error('❌ Google APIs could not be loaded - CSP might be blocking them');
      console.error('💡 Use debugGoogleAPIs() in the console for more information');
      return false;
    }

    console.log('✅ Google APIs initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Google APIs:', error);
    debugGoogleAPIs();
    return false;
  }
};