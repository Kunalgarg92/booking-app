import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { amount } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      payment_capture: true,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
}
