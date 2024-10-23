"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:8000/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product details");

        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  }

  if (!product) {
    return <p className="text-center mt-10 text-gray-600">Product not found</p>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Main Image */}
        <div className="mb-4 flex justify-center">
          <img
            src={`http://localhost:8000/products/images/${product.mainImage || product.image_url}`}
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Product Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

        {/* Short Description */}
        <p className="text-gray-600 mb-4">{product.shortDescription}</p>

        {/* Price */}
        <p className="text-2xl font-semibold text-blue-600 mb-4">${product.price}</p>

        {/* Specifications */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Specifications</h2>
          <ul className="text-gray-600 space-y-1">
            {product.specs?.map((spec, index) => (
              <li key={index}>• {spec}</li>
            ))}
          </ul>
        </div>

        {/* Add to Cart Button */}
        <button
          className="btn bg-blue-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Add to Cart
        </button>

        {/* Product Description */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Description</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
