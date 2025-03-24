import { NextResponse } from "next/server";
import {connectDB} from "@/lib/dbConnect"; // Apna DB connection function
import {User} from "@/lib/models/user"; // Apna User Model

export async function GET(req:Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const user = await User.findById(userId).select("name email image");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
