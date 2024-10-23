"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ฟังก์ชันสำหรับการสลับบัญชีและรีไดเร็กต์ไปที่หน้า /login
  const handleSwitchAccount = async () => {
    await signOut({ callbackUrl: "/login" }); // รีไดเร็กต์ไปที่หน้า /login หลังจาก signOut
    router.push("/login"); // ยืนยันการรีไดเร็กต์ไปยังหน้า /login
  };

  if (status === "authenticated") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
          <h1 className="text-2xl font-bold mb-6">Welcome, {session.user.name}!</h1>
          <button onClick={handleSwitchAccount} className="btn btn-outline w-full">
            Switch Account
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn btn-outline w-full">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <button
          onClick={() => signIn("google", { prompt: "login", callbackUrl: "/products" })}
          className="btn btn-outline w-full flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
            <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.3-4.7H24v9.1h13.3c-.6 3-2.3 5.5-4.9 7.1v5.9h7.9c4.6-4.2 7.2-10.4 7.2-17.4z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.7l-7.9-5.9c-2.2 1.5-5 2.4-7.9 2.4-6.1 0-11.2-4.1-13.1-9.7H3v6.1C6.9 43.2 14.9 48 24 48z" />
            <path fill="#FBBC05" d="M10.9 28.1C10.4 26.6 10.1 24.9 10.1 23c0-1.9.3-3.6.8-5.1V11.8H3C1.1 15.5 0 19.1 0 23c0 3.9 1.1 7.5 3 10.8l7.9-5.7z" />
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.9 0 6.9 4.8 3 11.8l7.9 6.1c1.8-5.6 6.9-9.7 13.1-9.7z" />
          </svg>
          <span>Sign in with Google</span>
        </button>
        <button
          onClick={() => signIn("facebook", { callbackUrl: "/products" })}
          className="btn btn-outline w-full flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
            <path fill="#1877F2" d="M24 4C12.954 4 4 12.954 4 24c0 9.856 7.177 18.004 16.438 19.71V30.437h-4.96v-4.96h4.96v-3.898c0-4.805 2.895-7.443 7.13-7.443 2.07 0 4.234.375 4.234.375v4.71h-2.384c-2.355 0-3.085 1.46-3.085 2.96v3.295h5.177l-.83 4.96h-4.347v13.273C36.823 42.004 44 33.856 44 24 44 12.954 35.046 4 24 4z" />
          </svg>
          <span>Sign in with Facebook</span>
        </button>
      </div>
    </div>
  );
}
