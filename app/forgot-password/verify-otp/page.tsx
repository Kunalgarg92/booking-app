"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const email = typeof window !== "undefined" ? localStorage.getItem("email") : null; 

  const verifyOtp = async () => {
    try {
      const response = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push("/forgot-password/reset-password"); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold">Enter OTP</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        className="border p-2 rounded-md w-64"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={verifyOtp} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Verify OTP
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
