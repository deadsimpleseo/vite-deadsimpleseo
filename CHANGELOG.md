
Implement vite-deadsimpleseo plugin

    - Core plugin with Vite hooks (configResolved, buildStart, closeBundle, configureServer)
    - Component scanner to discover SEO pages in configured directory
    - Validator to check 'use static' directive and prevent stateful React hooks
    - Static page generator creating route-based folder structure
    - Developer hooks: useSEOPage(), useSEOPages()
    - Utility function: isSEOPage()
    - TypeScript declarations and type safety
    - Working example project with test SEO pages
    - Successfully generates static HTML files at /about-us/ and /contact/

Enforce 'use static' hook restrictions

The 'use static' directive is intentionally more restrictive than ReactDOMServer:
- Only useContext is allowed (if providers are in parent hierarchy)
- useState, useEffect, useReducer, etc. are not allowed
- This keeps SEO pages simple, predictable, and purely presentational

Changes:
- Validator enforces hook restrictions (except useContext)
- Updated documentation to clarify design decision
- Fixed Features.tsx example to be hook-free
- Removed warning system (now errors for disallowed hooks)

Split hook validation into separate categories (for 'use static' and non-'use static' components).

