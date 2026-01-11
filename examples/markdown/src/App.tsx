import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';

import { useSEOPage, useSEOPageComponent, type SEOPage } from 'deadsimpleseo-react';

function HeaderX() {
  return (
    <header style={{
      background: '#0f3460',
      color: 'white',
      padding: '1.5rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>DeadSimpleSEO Example App</h1>
      </div>
    </header>
  );
}

function FooterX() {
  return (
    <footer style={{
      background: '#1a1a2e',
      color: '#e0e0e0',
      padding: '3rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p>© 2024 DeadSimpleSEO. All rights reserved.</p>
      </div>
    </footer>
  );
}

function MainPage() {
  return (
    <div className="App" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Vite + React + DeadSimpleSEO</h1>
      <p>This is the main React application.</p>
      <p>SEO pages are generated separately:</p>
      <ul>
        <li><a href="/about/">About Page</a></li>
        <li><a href="/features/">Features Page</a></li>
        <li><a href="/blog/">Blog Post (Markdown)</a></li>
      </ul>
    </div>
  );
}

function Page() {
  const seoPage = useSEOPage();
  const SEOPageComponent = useSEOPageComponent();

  if (!seoPage || !SEOPageComponent) {
    throw new Error('No SEO page or component found');
    // return (
    //   <div>no SEO page or component</div>
    // );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>{seoPage.pageTitle}</h1>
      <h3>Component path: {seoPage.meta?.componentPath}</h3>

      <SEOPageComponent />
    </div>
  )
}

function App() {
  const seoPage = useSEOPage();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '3rem 2rem' }}>
        { seoPage ? <Page /> : <MainPage /> }
      </main>
      <Footer />
    </div>
  );
}

export default App;
