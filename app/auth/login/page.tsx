"use client";
import { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);

  const sendOtp = async () => {
    const recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptcha);
      setConfirmation(confirmationResult);
    } catch (error) {
      console.error(error);
    }
  };

  const verifyOtp = async () => {
    try {
      await confirmation.confirm(otp);
      alert("Login Successful!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input type="text" placeholder="Enter phone number" onChange={(e) => setPhone(e.target.value)} />
      <button onClick={sendOtp}>Send OTP</button>

      <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
      <button onClick={verifyOtp}>Verify OTP</button>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
