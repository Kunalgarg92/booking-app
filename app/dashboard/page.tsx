"use client";
import { PrivateRoute } from "@/app/hooks/PrivateRoute";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark/Light Mode State

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("token");
        sessionStorage.removeItem("jwt_token");
        sessionStorage.removeItem("token");
        router.push("/auth/login");
      } else {
        console.error("❌ Logout failed");
      }
    } catch (error) {
      console.error("❌ Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      {/* Full Page Dark/Light Theme */}
      <div
        className={`h-screen w-screen flex items-center justify-center relative transition-all duration-500 ${
          isDarkMode ? "bg-black" : "bg-gray-100"
        }`}
      >
        {/* Blurry Background Effect for Dark Mode Only */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isDarkMode ? "bg-black/60 backdrop-blur-2xl" : "bg-white"
          }`}
        ></div>

        {/* Logout Button at Top Left */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="absolute top-6 left-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 z-20"
        >
          {loading ? "Logging out..." : "Logout"}
        </button>

        {/* Dark/Light Mode Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-6 right-6 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 z-20"
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Floating Role Selection Box */}
        <div
          className={`relative p-10 rounded-xl shadow-2xl border transition-all duration-500 ${
            isDarkMode
              ? "border-gray-700 bg-white/10 backdrop-blur-lg" // Dark Mode: Blurry Effect
              : "border-gray-300 bg-white" // Light Mode: Clean White Box
          } z-30 transform hover:translate-y-[-5px] hover:scale-105`}
        >
          <h2
            className={`text-2xl font-bold mb-6 text-center transition-all duration-500 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Choose Your Role
          </h2>
          <div className="flex flex-col gap-4 w-80">
            <button
              onClick={() => router.push("/user/dashboard")}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 hover:bg-blue-600"
            >
              Customer
            </button>
            <button
              onClick={() => router.push("/provider/dashboard")}
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 hover:bg-green-600"
            >
              Provider
            </button>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
