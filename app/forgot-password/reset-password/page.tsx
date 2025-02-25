"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const email = typeof window !== "undefined" ? localStorage.getItem("email") : null;

  const resetPassword = async () => {
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
            localStorage.removeItem("email");
            router.push("/auth/login");
          }, 2000);
          
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-10">
      <h2 className="text-2xl font-bold">Reset Password</h2>

      <input
        type="password"
        placeholder="Enter new password"
        className="border p-2 rounded-md w-64"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm new password"
        className="border p-2 rounded-md w-64"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={resetPassword} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Reset Password
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
}
