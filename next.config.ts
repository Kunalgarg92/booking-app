import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

const nextConfig: NextConfig = {
  env: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  },
};

export default nextConfig;

