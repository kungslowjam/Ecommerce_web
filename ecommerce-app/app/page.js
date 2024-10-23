import Image from 'next/image';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero min-h-screen bg-white">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="mb-5 text-6xl font-bold text-gray-800">Discover Your Style</h1>
            <p className="mb-5 text-gray-600">High-quality products, minimal design. Tailored for your needs.</p>
            <a href="/products" className="btn btn-outline btn-primary">Shop Now</a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product Card */}
            <div className="card bg-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <figure className="px-10 pt-10">
                <Image 
                  src="/product1.jpg" 
                  alt="Product 1" 
                  width={500} 
                  height={300} 
                  className="rounded-xl" 
                />
              </figure>
              <div className="card-body text-center">
                <h2 className="card-title text-gray-800">Product 1</h2>
                <p className="text-gray-500">Affordable and sleek design.</p>
                <div className="card-actions justify-center">
                  <a href="/products/1" className="btn btn-outline btn-primary">View Details</a>
                </div>
              </div>
            </div>
            {/* Repeat more product cards */}
            <div className="card bg-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <figure className="px-10 pt-10">
                <Image 
                  src="/product2.jpg" 
                  alt="Product 2" 
                  width={500} 
                  height={300} 
                  className="rounded-xl" 
                />
              </figure>
              <div className="card-body text-center">
                <h2 className="card-title text-gray-800">Product 2</h2>
                <p className="text-gray-500">Minimalist and functional.</p>
                <div className="card-actions justify-center">
                  <a href="/products/2" className="btn btn-outline btn-primary">View Details</a>
                </div>
              </div>
            </div>
            <div className="card bg-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <figure className="px-10 pt-10">
                <Image 
                  src="/product3.jpg" 
                  alt="Product 3" 
                  width={500} 
                  height={300} 
                  className="rounded-xl" 
                />
              </figure>
              <div className="card-body text-center">
                <h2 className="card-title text-gray-800">Product 3</h2>
                <p className="text-gray-500">Elegant and affordable.</p>
                <div className="card-actions justify-center">
                  <a href="/products/3" className="btn btn-outline btn-primary">View Details</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action (CTA) */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-5 text-gray-800">Join Our Newsletter</h2>
          <p className="mb-5 text-gray-600">Stay updated with the latest offers and products.</p>
          <div className="flex justify-center">
            <input type="email" placeholder="Your Email" className="input input-bordered w-full max-w-xs" />
            <button className="btn btn-outline btn-primary ml-2">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
