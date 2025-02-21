import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { Otp, User } from "@/lib/models/user";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();
    console.log("Received OTP verification request for:", email);
    const otpEntry = await Otp.findOne({ email });
    if (!otpEntry) {
      console.log("OTP expired or not found");
      return NextResponse.json({ message: "OTP expired or not found" }, { status: 400 });
    }
    const isValid = await bcrypt.compare(otp, otpEntry.otp);
    if (!isValid) {
      console.log("Incorrect OTP");
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
    }

    await Otp.deleteOne({ email });
    let user = await User.findOne({ email });
    let hasPassword = !!user?.password && user.password.trim() !== "";
    if (!user) {
      user = new User({ email, password: "", isVerified: true });
      await user.save();
      hasPassword = false;
    } else {
      user.isVerified = true;
      await user.save();
    }
    
    console.log("OTP verified successfully for:", email);
    return NextResponse.json({ message: "OTP verified successfully", hasPassword }, { status: 200 });

  } catch (error) {
    console.error("Error in verify-otp API:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
