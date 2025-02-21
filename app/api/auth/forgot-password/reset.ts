import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { Otp, User } from "@/lib/models/user";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    const otpEntry = await Otp.findOne({ email });
    if (!otpEntry) {
      return NextResponse.json({ message: "OTP expired or not found" }, { status: 400 });
    }
    const isValid = await bcrypt.compare(otp, otpEntry.otp);
    if (!isValid) {
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    await Otp.deleteOne({ email });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Changed Successfully",
      text: "Your password has been successfully changed. If this wasn't you, please contact support.",
    });

    return NextResponse.json({ message: "Password reset successfully. You can now log in." }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
