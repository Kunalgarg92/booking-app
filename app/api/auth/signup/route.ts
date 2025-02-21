import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { User } from "@/lib/models/user";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword, isVerified: true });

    return NextResponse.json({ message: "Signup successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
