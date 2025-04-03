import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: string;
  movieId: string;
  amount: number;
  paymentId: string;
  status: "Success" | "Failed";
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: String, required: true },
  movieId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  status: { type: String, enum: ["Success", "Failed"], default: "Success" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPayment>("Payment", PaymentSchema);
