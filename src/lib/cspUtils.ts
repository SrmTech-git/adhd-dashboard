// src/lib/cspUtils.ts

// Client-side CSP management for Google APIs
export const enableGoogleAPIsCSP = () => {
  if (typeof window === 'undefined') return;

  // Create or update CSP meta tag for Google APIs
  const cspMetaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;

  const googleAPICSP = [
    "default-src 'self' https://srmtech-git.github.io",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com https://ssl.gstatic.com https://srmtech-git.github.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://srmtech-git.github.io",
    "font-src 'self' https://fonts.gstatic.com https://srmtech-git.github.io",
    "connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://srmtech-git.github.io",
    "frame-src 'self' https://accounts.google.com https://content.googleapis.com",
    "img-src 'self' data: blob: https: https://srmtech-git.github.io",
    "media-src 'self' https://srmtech-git.github.io",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');

  if (cspMetaTag) {
    // Update existing CSP meta tag
    cspMetaTag.content = googleAPICSP;
  } else {
    // Create new CSP meta tag
    const newCspMetaTag = document.createElement('meta');
    newCspMetaTag.httpEquiv = 'Content-Security-Policy';
    newCspMetaTag.content = googleAPICSP;
    document.head.appendChild(newCspMetaTag);
  }
};

// Check if Google APIs are available and ready
export const waitForGoogleAPIs = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const maxAttempts = 100; // 10 seconds
    let attempts = 0;

    const checkAPIs = () => {
      attempts++;

      if (window.gapi && window.google) {
        console.log('Google APIs loaded successfully');
        resolve(true);
      } else if (attempts < maxAttempts) {
        setTimeout(checkAPIs, 100);
      } else {
        console.warn('Google APIs failed to load within timeout');
        resolve(false);
      }
    };

    // Start checking immediately
    checkAPIs();
  });
};

// Initialize Google APIs with CSP fixes
export const initializeGoogleAPIs = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    // First, ensure CSP allows Google APIs
    enableGoogleAPIsCSP();

    // Wait a moment for CSP to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    // Wait for Google APIs to load
    const loaded = await waitForGoogleAPIs();

    if (!loaded) {
      console.error('Google APIs could not be loaded - CSP might be blocking them');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Google APIs:', error);
    return false;
  }
};