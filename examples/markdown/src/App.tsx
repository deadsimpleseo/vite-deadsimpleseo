import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import TodoList from './components/app/TodoList';

import { isSEOPage, useSEOPage, useSEOPageComponent } from 'deadsimpleseo-react';

function AppMain() {
  return (
    <div className="App" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Vite + React + DeadSimpleSEO</h1>
      <h2>This is the main React application.</h2>

      <div style={{ margin: '1.5rem 0', border: '1px solid #e0e0e0' }}>
        <TodoList />
      </div>

      <h2>SEO pages are generated separately:</h2>
      <ul>
        <li><a href="/about/">About Page</a></li>
        <li><a href="/features/">Features Page</a></li>
        <li><a href="/usage/">Usage Guide</a></li>
        <li><a href="/contact/">Contact Page</a></li>
      </ul>
    </div>
  );
}

function Page() {
  const seoPage = useSEOPage();
  const SEOPageComponent = useSEOPageComponent();

  if (!seoPage || !SEOPageComponent) {
    return null;
  }

  return seoPage.render();
}

function App() {
  const shouldRenderSEO = isSEOPage();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f9fc' }}>
      <Header />
      <main style={{ flex: 1, padding: '3rem 2rem' }}>
        { shouldRenderSEO ? <Page /> : <AppMain /> }
      </main>
      <Footer />
    </div>
  );
}

export default App;
