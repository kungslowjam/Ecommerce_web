import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  session: {
    maxAge: 24 * 60 * 60, // Token อายุ 24 ชั่วโมง
  },
  callbacks: {
    async jwt({ token, account }) {
      // ใช้ account เพื่อตั้งค่า token.id ในครั้งแรก
      if (account) {
        token.id = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // กำหนดค่า role ให้กับ session โดยตรวจสอบจาก email
      if (session.user.email === "kungslowjam@gmail.com") {
        session.user.role = "admin";
      } else {
        session.user.role = "user";
      }
      session.user.id = token.id; // เพิ่ม ID ให้กับ session.user
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
