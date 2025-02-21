import { NextResponse } from "next/server";
import cookie from "cookie";

export async function POST() {
  const headers = new Headers();
  headers.append("Set-Cookie", cookie.serialize("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  }));

  return NextResponse.json({ message: "Logout successful" }, { status: 200, headers });
}
