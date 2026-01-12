export default function Header() {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1.5rem 2rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
          🚀 DeadSimpleSEO
        </h1>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>App</a>
          <a href="/about/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>About</a>
          <a href="/features/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Features</a>
          <a href="/usage/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Usage</a>
          <a href="/blog/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Blog</a>
        </nav>
      </div>
    </header>
  );
}
