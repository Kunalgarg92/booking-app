"use client";
import { useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login"); 
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  if (!user) return null; 

  return <>{children}</>;
}
