import { connectDB } from "@/lib/dbConnect";
import Movie from "@/lib/models/movie";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB(); // Ensure DB is connected

  try {
    // Extract movie ID from the request URL
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop(); // Extract last part of the path
    console.log("Extracted Movie ID:", id);

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, error: "Invalid Movie ID format" }, { status: 400 });
    }

    // Convert `id` to a number since it's stored as a number in MongoDB
    const movie = await Movie.findOne({ id: Number(id) });

    if (!movie) {
      return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    }

    // Ensure seatingDetails exist
    const { seatingDetails } = movie;
    if (!seatingDetails) {
      return NextResponse.json({ success: false, error: "Seating details missing" }, { status: 500 });
    }

    // Extract seating details
    const { lowPrice, highPrice, lowPriceRows } = seatingDetails;

    return NextResponse.json({
      success: true,
      data: {
        name: movie.name,
        lowPrice,
        highPrice,
        lowPriceRows,
      },
    });
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
