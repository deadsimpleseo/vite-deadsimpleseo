/**
 * Simple cookie consent banner
 * Copyright (c) 2026 DeadSimpleSEO
 * Licensed under the MIT License
 */
(function() {
  const CONSENT_KEY = 'cookie_consent';
  const ANALYTICS_PREFERENCE_KEY = 'analytics_enabled';

  // Check if consent already given
  const existingConsent = localStorage.getItem(CONSENT_KEY);
  if (existingConsent) {
    // If analytics was previously enabled, enable tracking
    const analyticsEnabled = localStorage.getItem(ANALYTICS_PREFERENCE_KEY) === 'true';
    if (analyticsEnabled && window._posthogSimple) {
      window._posthogSimple.enableTracking();
    }
    return;
  }

  // Create banner HTML
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 0.5rem;
      left: 0.5rem;
      right: 0.5rem;
      background: #1a1a1a;
      color: white;
      padding: 0.5rem 1rem;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      border-radius: 6px;
    ">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px;">
          <p style="margin: 0; font-size: 0.75rem; color: #ccc; line-height: 1.3;">
            This project uses optional third-party analytics to gauge usage of the site. Your identity is not preserved between visits, it's only stored in the local session.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="checkbox" id="analytics-toggle" checked style="display: none;">
          <button id="cookie-modify" style="
            padding: 0.375rem 0.75rem;
            background: transparent;
            border: 1px solid #666;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          ">
            <span id="check-icon" style="color: #667eea;">✓</span>
            <span>Third-party analytics</span>
          </button>
          <button id="cookie-accept" style="
            padding: 0.375rem 0.875rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 600;
            transition: all 0.2s;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          ">
            Accept
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // Trigger fade-in animation after a brief delay to ensure proper rendering
  const bannerInner = banner.querySelector('div');
  setTimeout(() => {
    bannerInner.style.opacity = '1';
  }, 10);

  // Add hover effects
  const acceptBtn = document.getElementById('cookie-accept');
  const modifyBtn = document.getElementById('cookie-modify');
  const checkbox = document.getElementById('analytics-toggle');
  const checkIcon = document.getElementById('check-icon');
  
  // Update check icon visibility based on checkbox state
  function updateCheckIcon() {
    if (checkbox.checked) {
      checkIcon.style.opacity = '1';
      checkIcon.style.fontWeight = 'bold';
    } else {
      checkIcon.style.opacity = '0.3';
      checkIcon.style.fontWeight = 'normal';
    }
  }
  
  updateCheckIcon();
  
  acceptBtn.addEventListener('mouseenter', () => {
    acceptBtn.style.transform = 'translateY(-1px)';
    acceptBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
  });
  acceptBtn.addEventListener('mouseleave', () => {
    acceptBtn.style.transform = 'translateY(0)';
    acceptBtn.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
  });

  modifyBtn.addEventListener('mouseenter', () => {
    modifyBtn.style.borderColor = '#999';
    modifyBtn.style.background = 'rgba(255, 255, 255, 0.05)';
  });
  modifyBtn.addEventListener('mouseleave', () => {
    modifyBtn.style.borderColor = '#666';
    modifyBtn.style.background = 'transparent';
  });

  // Handle Modify button (toggles checkbox)
  modifyBtn.addEventListener('click', () => {
    checkbox.checked = !checkbox.checked;
    updateCheckIcon();
  });

  // Handle Accept button
  acceptBtn.addEventListener('click', () => {
    const analyticsEnabled = checkbox.checked;
    
    localStorage.setItem(CONSENT_KEY, 'true');
    localStorage.setItem(ANALYTICS_PREFERENCE_KEY, analyticsEnabled.toString());
    
    // Enable tracking if analytics enabled
    if (analyticsEnabled && window._posthogSimple) {
      window._posthogSimple.enableTracking();
    }
    
    // Fade out before removing
    bannerInner.style.opacity = '0';
    setTimeout(() => {
      banner.remove();
    }, 300);
  });
})();

export {};