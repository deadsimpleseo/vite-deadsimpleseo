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
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>App</a>
            <a href="/about/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>About</a>
            <a href="/features/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Features</a>
            <a href="/usage/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Usage</a>
            <a href="/blog/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Blog</a>
          </nav>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a 
              href="https://github.com/deadsimpleseo/vite-deadsimpleseo"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.375rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
              </svg>
              Star
            </a>
            <a 
              href="https://github.com/deadsimpleseo/vite-deadsimpleseo/fork"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.375rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
              </svg>
              Fork
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
