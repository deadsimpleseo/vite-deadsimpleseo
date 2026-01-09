"use static";

export default function AboutUs() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>About Us</h1>
      <p>
        Welcome to our company! We've been serving customers since 2020 with 
        passion and dedication.
      </p>
      <h2>Our Mission</h2>
      <p>
        To provide the best service possible while maintaining the highest 
        standards of quality and customer satisfaction.
      </p>
      <h2>Our Team</h2>
      <p>
        Our team consists of experienced professionals who are committed to 
        excellence in everything they do.
      </p>
    </div>
  );
}

export const seoMeta = {
  title: 'About Us - Our Company',
  description: 'Learn more about our company, mission, and the team behind our success.',
};
