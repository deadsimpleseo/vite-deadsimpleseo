"use static";

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Features() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>Features</h1>
          <p>Discover what makes DeadSimpleSEO powerful yet simple:</p>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>⚡ Fast Performance</h3>
            <p>
              Static pages are generated at build time, ensuring lightning-fast load times
              and optimal SEO performance.
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>🔍 SEO Optimized</h3>
            <p>
              Each page gets its own HTML file with proper meta tags, making it easy for
              search engines to crawl and index your content.
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>✨ Easy to Use</h3>
            <p>
              Just add "use static"; to your components and they'll be automatically
              converted to static pages. No complex configuration needed.
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>📝 Markdown Support</h3>
            <p>
              Write your content in markdown with frontmatter for metadata. The plugin
              automatically converts it to React components.
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>🛡️ Type Safe</h3>
            <p>
              Full TypeScript support with proper type definitions for all hooks and utilities.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const seoMeta = {
  title: 'Features - DeadSimpleSEO',
  description: 'Explore the powerful features that make DeadSimpleSEO the easiest way to add SEO pages to your React app.',
};
