# GitHub Pages CSP Configuration for Google Calendar Integration

## Issue
GitHub Pages static hosting blocks Google APIs due to default Content Security Policy restrictions.

## Solution Options

### Option 1: GitHub Pages Custom Domain with Cloudflare (Recommended)
If you use a custom domain with Cloudflare, you can set CSP headers:

```
Content-Security-Policy: default-src 'self' https://srmtech-git.github.io; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com https://ssl.gstatic.com https://srmtech-git.github.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://srmtech-git.github.io; font-src 'self' https://fonts.gstatic.com https://srmtech-git.github.io; connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://srmtech-git.github.io; frame-src 'self' https://accounts.google.com https://content.googleapis.com; img-src 'self' data: blob: https: https://srmtech-git.github.io; media-src 'self' https://srmtech-git.github.io; object-src 'none'; base-uri 'self'
```

### Option 2: Client-Side CSP Override (Current Implementation)
The application includes client-side CSP management that attempts to override restrictive policies.

### Option 3: Alternative Hosting
Consider hosting on platforms that allow custom headers:
- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

## Testing Google Calendar Integration

1. **Local Development**: Google APIs work normally
2. **GitHub Pages**: May be blocked by CSP - requires manual browser configuration or hosting alternative
3. **Production with Custom Headers**: Works with proper CSP configuration

## Manual Browser Configuration (For Testing)
If CSP blocks Google APIs, users can temporarily disable CSP in their browser for testing:

**Chrome**: Launch with `--disable-web-security --disable-features=VizDisplayCompositor`
**Firefox**: Set `security.csp.enable` to `false` in about:config

⚠️ **Warning**: Only for development/testing purposes. Never recommend this to end users.

## Deployment Recommendations

For production deployment with full Google Calendar support:

1. **Use a platform with custom header support** (Vercel, Netlify)
2. **Set up a custom domain with CDN** (Cloudflare, AWS CloudFront)
3. **Configure proper CSP headers** to allow Google APIs while maintaining security

## Current Status

The Google Calendar integration is fully implemented and will work on any hosting platform that allows proper CSP configuration. GitHub Pages limitations are a hosting restriction, not an application issue.