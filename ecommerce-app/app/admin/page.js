"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:8000/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`http://localhost:8000/products/delete/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter((product) => product.id !== productId));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 pt-20"> {/* Adjust padding top to prevent navbar overlap */}
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Add Product Button */}
      <div className="flex justify-end mb-6">
        <a href="/products/add" className="btn btn-outline btn-primary">
          + Add Product
        </a>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <figure className="px-6 pt-6">
                <img
                  src={
                    product.image_urls && product.image_urls.length > 0
                      ? product.image_urls[0]
                      : '/default-image.jpg' // Placeholder image if no image is provided
                  }
                  alt={product.name}
                  className="rounded-lg object-cover h-40 w-full"
                />
              </figure>
              <div className="card-body text-center">
                <h2 className="text-xl font-medium text-gray-800">{product.name}</h2>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">${product.price}</p>
                <p className={`text-sm mt-1 ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                  {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
                </p>
                <div className="flex justify-between mt-4">
                  <a href={`/products/${product.id}/update/`} className="btn btn-outline btn-sm">
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="btn btn-outline btn-sm btn-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ); 
}
