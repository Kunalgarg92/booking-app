import { NextResponse } from "next/server";
import * as cookie from "cookie";
import { revokedTokens } from "@/utils/tokenStore";

export async function POST(req: Request) {
  try {
    // Get refresh token from cookies
    const cookies = req.headers.get("cookie");
    const parsedCookies = cookies ? cookie.parse(cookies) : {};
    const refreshToken = parsedCookies.refreshToken;

    // Add refresh token to revoked list
    if (refreshToken) {
      revokedTokens.add(refreshToken);
    }

    // Clear cookies correctly
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      [
        cookie.serialize("accessToken", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          expires: new Date(0),
        }),
        cookie.serialize("refreshToken", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          expires: new Date(0),
        }),
      ].join(", ") // Fix: Use comma instead of semicolon
    );

    return new NextResponse(JSON.stringify({ message: "Logout successful" }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
