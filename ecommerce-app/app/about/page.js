// app/about/page.js
export default function About() {
  return (
    <div className="container mx-auto p-6 pt-20">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="mb-4">
        Welcome to our e-commerce platform! We strive to bring you the best quality products at affordable prices. 
        Our mission is to provide a seamless shopping experience for our customers by offering a wide variety of products.
      </p>
      <p className="mb-4">
        Our team is passionate about delivering the best customer service and ensuring that you have a great experience every time you shop with us.
      </p>
      <h2 className="text-2xl font-bold mt-6 mb-4">Our Vision</h2>
      <p className="mb-4">
        We aim to become a leading online store by continuously improving our platform and expanding our product offerings.
      </p>
      <h2 className="text-2xl font-bold mt-6 mb-4">Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns, feel free to reach out to our support team at <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a>.
      </p>
    </div>
  );
}
