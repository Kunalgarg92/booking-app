import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string; 
  isVerified: boolean;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  password: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 300 }, 
});

export const Otp = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
