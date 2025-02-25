import { NextResponse } from "next/server";
import { generateAccessToken, verifyRefreshToken } from "@/utils/jwt";
import cookie from "cookie";
import { revokedTokens } from "@/utils/tokenStore";

export async function GET(req: Request) {
  try {
    const cookies = req.headers.get("cookie");
    const parsedCookies = cookies ? cookie.parse(cookies) : {};
    const refreshToken = parsedCookies.refreshToken;

    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token provided" }, { status: 401 });
    }
    if (revokedTokens.has(refreshToken)) {
      console.warn("❌ Blocked attempt to use a revoked refresh token.");

      return new NextResponse(JSON.stringify({ message: "Refresh token has been revoked" }), {
        status: 403,
        headers: new Headers({
          "Set-Cookie": cookie.serialize("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: new Date(0),
          }),
        }),
      });
    }

    try {
      const decoded: any = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken(decoded.userId);

      return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
    } catch (error: any) {
      console.error("❌ Refresh token verification failed:", error.message);
      revokedTokens.add(refreshToken);

      return new NextResponse(JSON.stringify({ message: "Invalid or expired refresh token" }), {
        status: 403,
        headers: new Headers({
          "Set-Cookie": cookie.serialize("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: new Date(0),
          }),
        }),
      });
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
