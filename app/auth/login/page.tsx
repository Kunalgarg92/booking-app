"use client";

import { useEffect, useState } from "react";
import { auth, provider } from "@/lib/firebaseConfig";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

const Login = () => {
  const [user, setUser] = useState<any>(null);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      alert(`Welcome ${result.user.displayName}!`);
    } catch (error) {
      console.error("Google Login Failed", error);
      alert("Login failed! Try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      alert("Logged out successfully!");
    } catch (error) {
      console.error("Logout Failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-2xl font-bold">Login with Google</h2>

      {!user ? (
        <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded-md">
          Sign in with Google
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <p>Welcome, {user.displayName}</p>
          <img src={user.photoURL} alt="User Profile" className="w-12 h-12 rounded-full" />
          <button onClick={handleLogout} className="bg-gray-500 text-white px-4 py-2 rounded-md">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
