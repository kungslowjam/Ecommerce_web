"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const router = useRouter(); // Initialize router

  const fetchCartItems = async () => {
    try {
      const res = await fetch("http://localhost:8000/cart?user_id=1");
      if (!res.ok) throw new Error("Failed to fetch cart items");
      const data = await res.json();
      return data.items || [];
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  };

  useEffect(() => {
    async function fetchCart() {
      const items = await fetchCartItems();
      setCartItems(items);
      calculateTotalPrice(items);
    }
    fetchCart();
  }, []);

  const calculateTotalPrice = (items) => {
    const total = items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const updateQuantity = async (itemId, quantity) => {
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    calculateTotalPrice(updatedItems);

    try {
      await fetch(`http://localhost:8000/cart/update/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:8000/cart/remove/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove item from cart");

      const updatedItems = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedItems);
      calculateTotalPrice(updatedItems);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 pt-24">
      <h1 className="text-4xl font-bold text-center mb-10">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cartItems.map((item) => (
            <div key={item.id} className="card bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
              <img
                src={item.product.image_urls && item.product.image_urls.length > 0 ? item.product.image_urls[0] : "/default-image.jpg"}
                alt={item.product.name}
                className="h-32 w-32 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold text-center">{item.product.name}</h2>
              <p className="text-gray-600">Price: <span className="font-bold">${item.product.price.toFixed(2)}</span></p>
              <p className="text-gray-600">Quantity: <span className="font-bold">{item.quantity}</span></p>
              <p className="text-gray-800 mt-2">
                Subtotal: <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
              </p>
              <div className="flex items-center space-x-2 mt-4">
                <button
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition"
                >
                  -
                </button>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {cartItems.length > 0 && (
        <div className="text-center mt-10">
          <h2 className="text-2xl font-semibold">Total: <span className="font-bold">${totalPrice.toFixed(2)}</span></h2>
          <button
            onClick={() => router.push("/checkout")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
