"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState(0);
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [status, setStatus] = useState("Available");
  const [specs, setSpecs] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      JSON.parse(specs); // ตรวจสอบ JSON ของ `specs`
    } catch (err) {
      setMessage("Invalid JSON format for specifications.");
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", price);
    formData.append("discount", discount);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("sku", sku);
    formData.append("status", status);
    formData.append("specs", specs);
    images.forEach((image) => formData.append("images", image));

    try {
      const res = await fetch("http://localhost:8000/products/add", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" },
        mode: "cors",
      });

      if (res.ok) {
        setMessage("Product added successfully!");
        router.push("/products");
      } else {
        const errorData = await res.json();
        setMessage(`Failed to add product: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage("An error occurred: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-semibold">Specifications (JSON format)</label>
          <textarea
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            className="textarea textarea-bordered w-full"
            placeholder={`{"Dimension": "10x20 cm", "Material": "Stainless Steel"}`}
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Coming Soon">Coming Soon</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold">Images</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            multiple
            className="file-input w-full"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4">
          Add Product
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}
