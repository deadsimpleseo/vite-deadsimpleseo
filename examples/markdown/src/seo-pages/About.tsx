"use static";

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>About DeadSimpleSEO</h1>
          <p>
            DeadSimpleSEO is a Vite plugin that generates static SEO pages from React components
            using ReactDOMServer.renderToString, without requiring complex SSR frameworks.
          </p>
          <h2>Key Features</h2>
          <ul>
            <li>✅ Simple "use static" directive to mark SEO pages</li>
            <li>✅ Automatic validation - prevents side-effect hooks</li>
            <li>✅ CamelCase to snake-case route conversion</li>
            <li>✅ Developer hooks for SEO metadata</li>
            <li>✅ Optional markdown support</li>
          </ul>
          <h2>Why DeadSimpleSEO?</h2>
          <p>
            Most SSR frameworks are complex and require significant setup. DeadSimpleSEO
            focuses on the common use case: generating a few static SEO pages for your
            React application without the overhead.
          </p>
        </div>
    </div>
  );
}

export const seoMeta = {
  title: 'About DeadSimpleSEO - Simple Static SEO Pages for React',
  description: 'Learn about DeadSimpleSEO, a Vite plugin for generating static SEO pages without complex SSR frameworks.',
};
