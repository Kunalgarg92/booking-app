import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Movie from "@/lib/models/movie";

export async function GET() {
  try {
    await connectDB();
    const movies = await Movie.find().lean();
    return NextResponse.json({ movies }, { status: 200 });
  } catch (error) {
    console.error("Error fetching movies:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
}
