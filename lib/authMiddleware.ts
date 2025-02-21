import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request) {
  const token = req.headers.get("cookie")?.split("token=")[1];

  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.headers.set("user", JSON.stringify(decoded));
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }
}
