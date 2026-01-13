/**
 * Simple PostHog page view tracker using vanilla JS and fetch API
 * Copyright (c) 2026 DeadSimpleSEO
 * Licensed under the MIT License
 */
(function () {

    if (window._postHogSimple) {
        return;
    }

    const posthogSimple = (function () {
        // Get PostHog configuration from environment variables
        const POSTHOG_API_KEY = import.meta.env.VITE_ENV_POSTHOG_API_KEY;
        const POSTHOG_HOST = import.meta.env.VITE_ENV_POSTHOG_HOST || 'https://app.posthog.com';

        // Exit if no API key configured
        if (!POSTHOG_API_KEY) {
            // console.warn('PostHog tracking disabled: VITE_ENV_POSTHOG_API_KEY not set');
            return;
        }

        const _posthogSimpleState = { enabled: false };

        // Get or create distinct_id from localStorage
        function getDistinctId() {
            let distinctId = localStorage.getItem('ph_distinct_id');
            if (!distinctId) {
                distinctId = `ph_${crypto.randomUUID()}`;
                localStorage.setItem('ph_distinct_id', distinctId);
            }
            return distinctId;
        }

        // Send pageview event to PostHog
        function trackPageView(url) {
            if (!_posthogSimpleState.enabled) {
                return;
            }

            const payload = {
                api_key: POSTHOG_API_KEY,
                event: '$pageview',
                properties: {
                    $current_url: url || window.location.href,
                    $host: window.location.host,
                    $pathname: window.location.pathname,
                    $referrer: document.referrer,
                    $screen_height: window.screen.height,
                    $screen_width: window.screen.width,
                    $viewport_height: window.innerHeight,
                    $viewport_width: window.innerWidth
                },
                distinct_id: getDistinctId(),
                timestamp: new Date().toISOString()
            };

            fetch(`${POSTHOG_HOST}/capture/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(err => {
                console.error('PostHog tracking error:', err);
            });
        }

        // Track initial page view
        trackPageView();

        // Track pushState and replaceState navigation
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            trackPageView(arguments[2]);
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            trackPageView(arguments[2]);
        };

        // Track popstate (back/forward buttons)
        window.addEventListener('popstate', function () {
            trackPageView();
        });

        const enableTracking = () => {
            _posthogSimpleState.enabled = true;
        };

        return { enableTracking, trackPageView };
    });

    window._postHogSimple = posthogSimple();
})();

export {};