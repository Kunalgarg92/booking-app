import { NextResponse } from "next/server";
import * as cookie from "cookie";
import { revokedTokens } from "@/utils/tokenStore";

export async function POST(req: Request) {
  try {
    const cookies = req.headers.get("cookie");
    const parsedCookies = cookies ? cookie.parse(cookies) : {};
    const refreshToken = parsedCookies.refreshToken;
    if (refreshToken) {
      revokedTokens.add(refreshToken);
    }
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
      ].join(", ")
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
