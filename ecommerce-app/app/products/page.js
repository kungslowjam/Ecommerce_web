"use client";
import { useState, useEffect } from "react";

async function fetchProducts() {
  try {
    const res = await fetch("http://localhost:8000/products", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    const products = await res.json();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const productsData = await fetchProducts();
      setProducts(productsData);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const addToCart = async (productId, quantity) => {
    try {
      const res = await fetch("http://localhost:8000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          product_id: productId,
          quantity: quantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to add product to cart");
      setStatusMessage("Product added to cart!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setStatusMessage("Error adding product to cart");
    }
  };

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-4xl font-bold text-center mb-10"></h1>
      <h1 className="text-4xl font-bold text-center mb-10">Our Products</h1>
      {statusMessage && (
        <p className="text-center text-green-600 mb-4">{statusMessage}</p>
      )}
      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <p className="text-center text-red-600">No products available.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="card bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <figure className="relative">
                  <img
                    src={
                      product.image_urls && product.image_urls.length > 0
                        ? product.image_urls[0]
                        : "/default-image.jpg"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold">Out of Stock</span>
                    </div>
                  )}
                </figure>
                <div className="card-body p-4">
                  <h2 className="card-title text-gray-800 text-xl font-semibold">{product.name}</h2>
                  <p className="text-gray-500">{product.description}</p>
                  <div className="mt-4">
                    <p className="text-lg font-semibold text-gray-900">
                      Price: ${product.price}
                    </p>
                    <p
                      className={`text-sm ${
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.stock > 0
                        ? `In Stock: ${product.stock}`
                        : "Out of Stock"}
                    </p>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <a
                      href={`/products/${product.id}`}
                      className="btn btn-outline btn-primary"
                    >
                      View Details
                    </a>
                    {product.stock > 0 && (
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          defaultValue="1"
                          className="input input-bordered w-20 mr-2"
                          id={`quantity-${product.id}`}
                        />
                        <button
                          onClick={() => {
                            const quantity = parseInt(document.getElementById(`quantity-${product.id}`).value, 10);
                            addToCart(product.id, quantity);
                          }}
                          className="btn btn-primary"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
