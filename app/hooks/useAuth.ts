"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");
  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      console.warn("No token found, user is not authenticated");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
    } catch (error: any) {
      console.error("Auth check failed:", error?.response?.data?.message);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });

      if (!data.accessToken) {
        console.error("Login failed: No access token received");
        return;
      }

      localStorage.setItem("token", data.accessToken); 
      await checkAuth();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error?.response?.data?.message);
    }
  };
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      localStorage.removeItem("token");
      setUser(null);
      router.push("/login");
    } catch (error: any) {
      console.error("Logout failed:", error?.response?.data?.message);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const { data } = await axios.get("/api/auth/refresh-token"); 
  
      if (!data.accessToken) {
        console.error("Token refresh failed: No access token received");
        logout();
        return null;
      }
  
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } catch (error: any) {
      console.error("Failed to refresh token:", error?.response?.data?.message);
      if (error.response?.status === 403) {
        logout();
      }
      return null;
    }
  };
  
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, login, logout, refreshAccessToken };
}
