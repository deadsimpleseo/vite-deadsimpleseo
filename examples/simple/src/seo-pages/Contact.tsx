"use static";

export default function Contact() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Contact Us</h1>
      <p>
        Get in touch with us! We'd love to hear from you.
      </p>
      <h2>Address</h2>
      <p>123 Main Street<br />Anytown, USA 12345</p>
      <h2>Email</h2>
      <p>contact@example.com</p>
      <h2>Phone</h2>
      <p>(555) 123-4567</p>
    </div>
  );
}

export const seoMeta = {
  title: 'Contact Us - Get in Touch',
  description: 'Contact our team for inquiries, support, or general questions.',
};
