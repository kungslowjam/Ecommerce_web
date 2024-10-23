"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams(); 
  const [formData, setFormData] = useState({
    name: "", short_description: "", description: "",
    price: "", stock: "", category: "", specs: "", images: []
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const res = await fetch(`http://localhost:8000/products/${id}`);
      const data = await res.json();
      setFormData({
        name: data.name, short_description: data.short_description || "",
        description: data.description, price: data.price, 
        stock: data.stock, category: data.category, 
        specs: JSON.stringify(data.specs), images: data.image_urls || []
      });
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        formData.images.forEach((img) => updatedData.append("images", img));
      } else {
        updatedData.append(key, formData[key]);
      }
    });

    const res = await fetch(`http://localhost:8000/products/update/${id}`, {
      method: "PUT",
      body: updatedData,
    });

    if (res.ok) {
      alert("Product updated successfully!");
      router.push("/products");
    } else {
      console.error("Failed to update product:", await res.json());
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-semibold text-center mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "short_description", "description", "price", "stock", "category", "specs"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold capitalize">{field.replace("_", " ")}</label>
            <input
              type={field === "description" || field === "specs" ? "textarea" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files) })}
            className="file-input w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full mt-4">
          Update Product
        </button>
      </form>
    </div>
  );
}
