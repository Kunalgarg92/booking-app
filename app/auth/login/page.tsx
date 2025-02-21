"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const LoginPage = () => {
  const [step, setStep] = useState<"email" | "password" | "otp" | "set-password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); 
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
      const res = await axios.get("/api/auth/me");
      console.log("User data:", res.data);
  
      if (res.data.user) {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error.response?.data || "Unknown error");
    }
  };
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  
  const checkEmail = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/check-email", { email });

      if (!res.data.exists) {
        setIsNewUser(true);
        setStep("otp");
      } else {
        setStep(res.data.isVerified ? (res.data.hasPassword ? "password" : "set-password") : "otp");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error checking email.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async () => {
    if (!password) {
      setMessage("Please enter your password.");
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    try {
      const res = await axios.post("/api/auth/login", { email, password });
  
      const { accessToken } = res.data; 
      localStorage.setItem("token", accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  
      setMessage("Login successful! Redirecting to dashboard...");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
  
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  const sendOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      await axios.post("/api/auth/send-otp", { email });
      setOtpSent(true);
      setMessage("OTP sent! Check your email.");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

 
  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      setStep(res.data.hasPassword ? "password" : "set-password");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

 
  const setNewPassword = async () => {
    if (!password || !confirmPassword) {
      setMessage("Please enter both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post("/api/auth/set-password", { email, password });

      setMessage("Password created successfully! You can now log in.");
      setTimeout(() => {
        setStep("password");
      }, 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const res = await axios.post("/api/auth/google-login", {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
  
      const { token } = res.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
      setMessage(`Welcome, ${user.displayName}! Authentication successful. Redirecting...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      setMessage("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <h2 className="text-2xl font-bold">Login</h2>

      {step === "email" && (
        <>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="border p-2 rounded-md w-64"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={checkEmail} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            {loading ? "Checking..." : "Continue"}
          </button>
        </>
      )}

      {step === "password" && (
        <>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            className="border p-2 rounded-md w-64"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={loginWithPassword} className="bg-green-500 text-white px-4 py-2 rounded-md">
            {loading ? "Logging in..." : "Login"}
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          {!otpSent ? (
            <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                className="border p-2 rounded-md w-64"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={verifyOtp} className="bg-green-500 text-white px-4 py-2 rounded-md">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}
        </>
      )}

      <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded-md">
        Sign in with Google
      </button>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default LoginPage;
