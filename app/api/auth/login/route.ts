import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { User } from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";
import * as cookie from "cookie"; 

export async function POST(req: Request) {
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON format in request:", err);
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { email, password } = body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials for email:", email);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    console.log("Generated Access Token:", accessToken);
    console.log("Generated Refresh Token:", refreshToken);
    const setCookieHeader = cookie.serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, 
    });
    const response = NextResponse.json(
      { message: "Login successful", accessToken },
      { status: 200 }
    );

    response.headers.append("Set-Cookie", setCookieHeader);
    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
