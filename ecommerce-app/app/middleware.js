// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();
  
  // ตรวจสอบเส้นทางที่ต้องการการเข้าถึงของ admin เท่านั้น
  const isAdminPage = url.pathname.startsWith("/admin");

  if (isAdminPage) {
    // ตรวจสอบว่า token มี role เป็น admin หรือไม่
    if (!token || token.role !== "admin") {
      url.pathname = "/unauthorized"; // ถ้าไม่ใช่ admin ให้เปลี่ยนเส้นทางไปที่ /unauthorized
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next(); // อนุญาตให้ผ่านถ้าเป็น admin
}

export const config = {
  matcher: ["/admin/:path*"], // ใช้ middleware กับทุกเส้นทางที่ขึ้นต้นด้วย /admin
};
