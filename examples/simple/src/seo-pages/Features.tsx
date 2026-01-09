"use static";

export default function Features() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Our Features</h1>
      <p>Discover what makes our product amazing:</p>
      <ul>
        <li>⚡ Fast performance - optimized for speed</li>
        <li>🔍 SEO optimized - ranks well in search engines</li>
        <li>✨ Easy to use - intuitive interface</li>
        <li>🛡️ Secure - built with security in mind</li>
        <li>📱 Responsive - works on all devices</li>
      </ul>
    </div>
  );
}

export const seoMeta = {
  title: 'Features - Our Amazing Product',
  description: 'Discover all the amazing features of our product.',
};
