import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { Otp, User } from "@/lib/models/user";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json({ message: "OTP not found" }, { status: 400 });
    }
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
    await Otp.deleteOne({ email });
    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
