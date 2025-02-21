import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { User } from "@/lib/models/user";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body || {};
    console.log("🔹 Received request to set password for:", email);
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      console.log("❌ Password too short");
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.isVerified) {
      console.log("❌ User is not verified:", email);
      return NextResponse.json({ message: "User is not verified. Verify OTP first." }, { status: 403 });
    }

    if (user.password) {
      console.log("❌ User already has a password set:", email);
      return NextResponse.json({ message: "Password is already set. Please log in." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password set successfully for:", email);
    return NextResponse.json({ message: "Password set successfully. You can now log in." }, { status: 200 });

  } catch (error) {
    console.error("❌ Error setting password:", error);
    return NextResponse.json({ message: "Server error. Please try again later." }, { status: 500 });
  }
}
