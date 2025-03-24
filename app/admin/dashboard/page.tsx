"use client";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  email: string;
  isVerified: boolean;
}

interface Provider {
  _id: string;
  name: string;
  isApproved: boolean;
}

interface Booking {
  _id: string;
  user: string;
  provider: string;
  refundStatus: string;
}

interface FraudReport {
  _id: string;
  providerName: string;
  reason: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [refundRequests, setRefundRequests] = useState<Booking[]>([]);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const usersRes = await fetch("/api/admin/users-providers");
      const refundsRes = await fetch("/api/admin/refunds");
      const fraudRes = await fetch("/api/admin/fraud-reports");
      const analyticsRes = await fetch("/api/admin/analytics");

      const usersData = await usersRes.json();
      const refundsData = await refundsRes.json();
      const fraudData = await fraudRes.json();
      const analyticsData = await analyticsRes.json();

      setUsers(usersData.users);
      setProviders(usersData.providers);
      setRefundRequests(refundsData);
      setFraudReports(fraudData);
      setRevenue(analyticsData.revenue);
      setTotalBookings(analyticsData.totalBookings);
    }
    fetchData();
  }, []);

  async function handleRefund(bookingId: string, action: "approve" | "reject") {
    await fetch("/api/admin/refunds", {
      method: "POST",
      body: JSON.stringify({ bookingId, action }),
    });

    setRefundRequests((prev) => prev.filter((b) => b._id !== bookingId));
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold">Admin Dashboard</h2>

      {/* Manage Users & Providers */}
      <h3 className="text-md font-semibold mt-4">Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u._id} className="border p-2 my-2">
            Email: {u.email} | Verified: {u.isVerified ? "Yes" : "No"}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="border p-4">
          <h3 className="text-md font-semibold">Total Revenue</h3>
          <p>₹{revenue}</p>
        </div>
        <div className="border p-4">
          <h3 className="text-md font-semibold">Total Bookings</h3>
          <p>{totalBookings}</p>
        </div>
      </div>

      <h3 className="text-md font-semibold mt-4">Providers</h3>
      <ul>
        {providers.map((p) => (
          <li key={p._id} className="border p-2 my-2">
            Name: {p.name} | Approved: {p.isApproved ? "Yes" : "No"}
          </li>
        ))}
      </ul>

      {/* Refund Requests */}
      <h3 className="text-md font-semibold mt-4">Refund Requests</h3>
      {refundRequests.length ? (
        <ul>
          {refundRequests.map((b) => (
            <li key={b._id} className="border p-2 my-2">
              User: {b.user} | Provider: {b.provider} | Status: {b.refundStatus}
              <button
                className="ml-2 bg-green-500 text-white p-1"
                onClick={() => handleRefund(b._id, "approve")}
              >
                Approve
              </button>
              <button
                className="ml-2 bg-red-500 text-white p-1"
                onClick={() => handleRefund(b._id, "reject")}
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending refund requests</p>
      )}

      {/* Fraud Reports */}
      <h3 className="text-md font-semibold mt-4">Fraud Reports</h3>
      {fraudReports.length ? (
        <ul>
          {fraudReports.map((r) => (
            <li key={r._id} className="border p-2 my-2">
              Provider: {r.providerName} | Reason: {r.reason}
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending fraud reports</p>
      )}
    </div>
  );
}
