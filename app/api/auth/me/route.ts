import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt";
import { parse } from "cookie"; 

export async function GET(req: Request) {
  try {
    let token: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("🔹 Token from Authorization Header:", token);
    } else {
      console.warn("⚠️ No token in Authorization header");
    }
    if (!token) {
      const cookieHeader = req.headers.get("Cookie");
      if (cookieHeader) {
        const cookies = parse(cookieHeader);
        token = cookies.accessToken ?? null;
        console.log("🔹 Token from Cookies:", token);
      } else {
        console.warn("⚠️ No Cookie header found");
      }
    }

    if (!token) {
      console.error("❌ No token received");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      console.log("🔹 Verifying Token:", token);
      const decoded: any = verifyAccessToken(token);
      console.log("✅ Decoded token:", decoded);
      return NextResponse.json({ user: { id: decoded.userId } }, { status: 200 });
    } catch (error: any) {
      console.error("❌ Token verification failed:", error.message);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  } catch (error: any) {
    console.error("❌ Server error:", error.message);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
