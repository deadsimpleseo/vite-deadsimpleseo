export default function Footer() {
  return (
    <footer style={{
      background: '#1a1a2e',
      color: '#e0e0e0',
      padding: '3rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>About</h3>
            <p style={{ lineHeight: '1.6', color: '#b0b0b0' }}>
              DeadSimpleSEO makes static SEO pages for React apps without complex SSR frameworks.
            </p>
          </div>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>Home</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/about/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>About</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/features/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>Features</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/blog/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>Blog</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Resources</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/about/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>About <em>vite-deadsimpleseo</em></a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/docs/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>Documentation</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/blog/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>Blog</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/contact/" style={{ color: '#b0b0b0', textDecoration: 'none' }}>Contact</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Connect</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://github.com" style={{ color: '#b0b0b0', textDecoration: 'none' }}>GitHub</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://twitter.com" style={{ color: '#b0b0b0', textDecoration: 'none' }}>Twitter</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://linkedin.com" style={{ color: '#b0b0b0', textDecoration: 'none' }}>LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <div style={{ 
          borderTop: '1px solid #333', 
          paddingTop: '1.5rem', 
          textAlign: 'center',
          color: '#808080',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: 0 }}>
            © 2026 Timothy Meade (@NotABusinessGuy). Built with ❤️ using Vite + React + 🚀 DeadSimpleSEO 😊.
          </p>
        </div>
      </div>
    </footer>
  );
}
