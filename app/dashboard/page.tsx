"use client";
import { PrivateRoute } from "@/app/hooks/PrivateRoute";

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Welcome to Dashboard!</h1>
      </div>
    </PrivateRoute>
  );
}
