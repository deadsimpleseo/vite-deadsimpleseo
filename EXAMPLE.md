
Example using `vite-deadsimpleseo` with react-router (v6) and StaticRouter.

1. main.tsx entry point uses isSEOPage() call to determine if we should use StaticRouter or the default BrowserRouter
2. placeholder traditional React application is also present
3. use infrastructure with custom Page component to render the markdown content with titles
4. static header and footers with list of SEO routes in footer, normal React page routes in header (converted to a by the plugin)
