"use client";
import { useState } from "react";

interface PaymentProps {
  amount: number;
  userId: string;
  movieId: string;
}

const PaymentButton: React.FC<PaymentProps> = ({ amount, userId, movieId }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const { success, order } = await res.json();
    if (!success) return alert("Order creation failed");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name: "Movie Booking",
      description: "Payment for Movie Ticket",
      order_id: order.id,
      handler: async (response: any) => {
        await fetch("/api/payment/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, userId, movieId, amount }),
        });
        alert("Payment Successful!");
      },
      theme: { color: "#F37254" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <button onClick={handlePayment} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
};

export default PaymentButton;
