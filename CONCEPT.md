
# The vite-deadsimpleseo does static pages for SEO without complex server-side rendering or frameworks

Uses components in a specifc folder

Components do not use stateful React functions or contexts.

Components start with `use static`; (any string format supported)

Converts camel-cased components to snake-case folders with index.html file in each folder.

Uses the same index.html, stylesheets, and main.tsx

Provides useSEOPage() hook exposing pageTitle and pageContent

Provides useSEOPages() hook exposing the list of SEO pages with URLs

Provides isSEOPage() which can be used outside of hook-context, such as in main.tsx

Optional markdown support (using mark)

