"use client";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCartCount() {
      try {
        const res = await fetch("http://localhost:8000/cart?user_id=1");
        const data = await res.json();
        setCartCount(data.items.length);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    }

    fetchCartCount();
  }, []);

  const handleUserIconClick = () => {
    if (status === "authenticated") {
      window.location.href = "/account";
    } else {
      window.location.href = "/login";
    }
  };

  const handleSwitchAccount = async () => {
    await signOut({ redirect: false });
    window.location.href = "https://accounts.google.com/logout";
    setTimeout(() => {
      signIn("google", { prompt: "login", callbackUrl: "/" });
    }, 1000);
  };

  return (
    <nav className="navbar bg-white shadow-lg fixed w-full top-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center justify-between w-full lg:w-auto">
        <a className="text-2xl font-semibold text-gray-800 hover:text-blue-600 transition duration-300" href="/">My Shop</a>
        <button
          className="lg:hidden p-2 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <XMarkIcon className="h-6 w-6 text-gray-800" /> : <Bars3Icon className="h-6 w-6 text-gray-800" />}
        </button>
      </div>

      <div className={`lg:flex lg:items-center lg:space-x-6 w-full lg:w-auto ${menuOpen ? "block mt-4 lg:mt-0" : "hidden lg:flex"}`}>
        <ul className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6 lg:ml-6 text-gray-700">
          <li><a href="/" className="block text-lg font-medium px-4 py-2 hover:text-blue-600 transition duration-300">Home</a></li>
          <li><a href="/products" className="block text-lg font-medium px-4 py-2 hover:text-blue-600 transition duration-300">Products</a></li>
          <li><a href="/about" className="block text-lg font-medium px-4 py-2 hover:text-blue-600 transition duration-300">About</a></li>
          <li>
            <a href="/cart" className="relative flex items-center text-lg font-medium px-4 py-2 hover:text-blue-600 transition duration-300">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Cart
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 mt-2 -mr-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </a>
          </li>
        </ul>
      </div>

      <div className={`lg:flex lg:items-center space-x-4 ${menuOpen ? "block mt-4 lg:mt-0" : "hidden lg:flex"}`}>
        {status === "authenticated" ? (
          <button onClick={handleUserIconClick} className="flex items-center space-x-1 px-4 py-2 text-lg font-medium text-gray-800 hover:text-blue-600 transition duration-300">
            <UserIcon className="h-6 w-6" />
            <span>Welcome, {session.user.name}</span>
          </button>
        ) : (
          <button onClick={handleUserIconClick} className="flex items-center space-x-1 px-4 py-2 text-lg font-medium text-gray-800 hover:text-blue-600 transition duration-300">
            <UserIcon className="h-6 w-6" />
            <span>Login</span>
          </button>
        )}
        {status === "authenticated" && session.user.role === "admin" && (
          <a href="/admin" className="text-lg font-medium text-gray-800 hover:text-blue-600 transition duration-300 px-4 py-2">
            Admin
          </a>
        )}
        {status === "authenticated" && (
          <>
            <button onClick={handleSwitchAccount} className="text-lg font-medium text-gray-800 hover:text-blue-600 transition duration-300 px-4 py-2">
              Switch Account
            </button>
            <a href="/api/auth/signout" className="text-lg font-medium text-gray-800 hover:text-blue-600 transition duration-300 px-4 py-2">
              Logout
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
