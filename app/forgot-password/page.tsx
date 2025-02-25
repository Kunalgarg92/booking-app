"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const sendOtp = async () => {
    try {
      localStorage.setItem("email", email);
      const response = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      if (response.ok) {
        router.push("/forgot-password/verify-otp");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };
  

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        className="border p-2 rounded-md w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Send OTP
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
