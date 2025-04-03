import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: String,
  movieId: String,
  amount: Number,
  paymentId: String,
  status: String,
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URI!);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, movieId, amount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) return res.status(400).json({ success: false, error: "Invalid signature" });

    await connectDB();
    await Payment.create({ userId, movieId, amount, paymentId: razorpay_payment_id, status: "Success" });

    res.status(200).json({ success: true, message: "Payment verified" });
  } catch (error) {
    res.status(500).json({ error: "Payment verification failed" });
  }
}
