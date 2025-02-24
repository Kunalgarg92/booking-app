import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { Otp, User } from "@/lib/models/user";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"; 


export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ message: "Email already exists" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.findOneAndUpdate(
      { email },
      { otp: hashedOtp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true }
    );

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
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
