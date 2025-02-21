import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { User } from "@/lib/models/user";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { email, displayName, photoURL } = body;

    if (!email || !displayName || !photoURL) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name: displayName, photo: photoURL, isVerified: true });
      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env");
      return NextResponse.json({ message: "Server error: JWT secret missing" }, { status: 500 });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({ token, message: "Login Successful!" }, { status: 200 });
  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.json({ message: "Google Login Failed" }, { status: 500 });
  }
}
