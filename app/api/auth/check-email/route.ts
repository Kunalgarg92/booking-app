import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { User } from "@/lib/models/user";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    console.log("🔹 Received email check request for:", email);

    if (!email || typeof email !== "string") {
      console.error("❌ Invalid email provided");
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log("🔹 User not found in the database");
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const hasPassword = Boolean(user.password && user.password.trim() !== "");

    console.log("🔹 User found:", {
      email: user.email,
      hasPassword,
      isVerified: user.isVerified ?? false,
    });

    return NextResponse.json(
      {
        exists: true,
        hasPassword,
        isVerified: user.isVerified ?? false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in check-email API:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
