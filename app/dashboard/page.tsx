"use client";
import { PrivateRoute } from "@/app/hooks/PrivateRoute";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        // ✅ Clear tokens from localStorage/sessionStorage
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("token");
        sessionStorage.removeItem("jwt_token");
        sessionStorage.removeItem("token");
  
        // ✅ Redirect to login page after logout
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
      <div className="p-6">
        <h1 className="text-2xl font-bold">Welcome to Dashboard!</h1>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </PrivateRoute>
  );
}
