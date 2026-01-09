
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
