"use static";

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Usage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>Getting Started</h1>
          <p>
            DeadSimpleSEO is easy to set up. Follow these steps to add static SEO pages 
            to your Vite + React application.
          </p>

          <h2>Installation</h2>
          <pre><code>npm install @deadsimpleseo/vite-deadsimpleseo @deadsimpleseo/deadsimpleseo-react deadsimpleseo-react</code></pre>

          <h2>Configure Vite</h2>
          <p>Add the plugin to your <code>vite.config.ts</code>:</p>
          <pre><code>{`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import deadSimpleSEO from 'vite-deadsimpleseo';

export default defineConfig({
  plugins: [
    react(),
    deadSimpleSEO({
      pagesDir: 'src/seo-pages',
      markdown: true,
    }),
  ],
});`}</code></pre>

          <h2>Create SEO Pages</h2>
          <p>Create components in <code>src/seo-pages/</code> with the <code>"use static"</code> directive:</p>
          <pre><code>{`// src/seo-pages/About.tsx
"use static";

export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Learn more about our company.</p>
    </div>
  );
}`}</code></pre>

          <h2>Update Your App</h2>
          <p>Use the provided hooks to detect and render SEO pages:</p>
          <pre><code>{`import { isSEOPage, useSEOPage, useSEOPageComponent } from 'deadsimpleseo-react';

function Header() {
    return (
        <div>
            <span>Your Logo</span>
            <nav>
                <ul>
                    {/* This is a link to your application which will be rendered with React at runtime */}
                    <ul><a href="/">App</a></ul>
                    {/* These are links to your static SEO pages which are pre-rendered HTML pages which you can serve as static pages */}
                    <SEOPageLinks element="li" />
                </ul>
            </nav>
        </div>
    );
}

function Footer() {
    return (
        <div>
            <p>©2026 Your Company. All rights reserved.</p>
            <div className="seoLinks">
                <SEOPageLinks element="a" separator=" | " />
            </div>
        </div>
    );
}

function MainContent() {
  const shouldRenderSEO = isSEOPage();
  
  if (shouldRenderSEO) {
    const seoPage = useSEOPage();
    return seoPage.render();
  }
  
  return <MainApp />;
}

function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}

`}</code></pre>

          <h2>Build</h2>
          <p>Build your app as usual. Static SEO pages will be generated automatically:</p>
          <pre><code>npm run build</code></pre>
          <p>
            Each page component becomes a static HTML file at <code>/page-name/index.html</code>
          </p>

          <h2>Configuration Options</h2>
          <ul>
            <li><strong>pagesDir</strong> - Directory for SEO page components (default: 'src/seo-pages')</li>
            <li><strong>outDir</strong> - Output directory for static pages (default: 'dist')</li>
            <li><strong>markdown</strong> - Enable markdown support (default: false)</li>
            <li><strong>routeTransform</strong> - Custom route transformation function</li>
          </ul>

          <h2>What Gets Generated</h2>
          <p>For each SEO page component:</p>
          <ul>
            <li>✅ Static HTML file with rendered content</li>
            <li>✅ Inlined CSS for self-contained pages</li>
            <li>✅ No JavaScript bundle (pure HTML for SEO)</li>
            <li>✅ Proper meta tags from your components</li>
          </ul>
        </div>
    </div>
  );
}
