"use client"; // ระบุว่าคอมโพเนนต์นี้ต้องทำงานบน client-side

import { SessionProvider } from "next-auth/react";
import Navbar from './components/Navbar';  // ตรวจสอบเส้นทางการนำเข้าให้ถูกต้อง
import './styles/globals.css';  // นำเข้าไฟล์ CSS ของ Tailwind

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />  {/* แสดง Navbar ในทุกหน้า */}
          <main>{children}</main>  {/* แสดงเนื้อหาในแต่ละหน้า */}
        </SessionProvider>
      </body>
    </html>
  );
}
