import { NextRequest, NextResponse } from "next/server";
import Movie from "@/lib/models/movie";
import { connectDB } from "@/lib/dbConnect";
import { verifyAccessToken } from "@/utils/jwt";
import { JwtPayload } from "jsonwebtoken";

// Helper function to validate seat structure
const validateSeats = (
  seats: boolean[][],
  rows: number,
  columns: number
): boolean => {
  return (
    Array.isArray(seats) &&
    seats.length === rows &&
    seats.every((row) => row.length === columns)
  );
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const createEmptySeats = (rows: number, columns: number): boolean[][] => {
      return Array.from({ length: rows }, () => Array(columns).fill(false));
    };

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const token = authHeader.split(" ")[1];
    const session = verifyAccessToken(token) as JwtPayload;
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    if (
      !body.name ||
      !body.image ||
      !body.releaseDate ||
      !body.rating ||
      !body.showtimes ||
      !body.seatingDetails
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize seating details
    const { rows, columns } = body.seatingDetails;

    for (const location of body.showtimes) {
      if (!location.location) { 
        return NextResponse.json(
          { error: "Each location must have a name" },
          { status: 400 }
        );
      }
    
      for (const schedule of location.schedules) {
        for (const timeSlot of schedule.times) {
          // Ensure seats are properly assigned
          if (!Array.isArray(timeSlot.seats) || timeSlot.seats.length === 0) {
            timeSlot.seats = createEmptySeats(rows, columns);
          }
        }
      }
    }
    
    

    const movie = new Movie({ ...body, provider: session.userId });
    await movie.save();

    return NextResponse.json({ message: "Movie added successfully", movie });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// **PUT** - Update an Existing Movie
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const token = authHeader.split(" ")[1];
    const session = verifyAccessToken(token) as JwtPayload;
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { movieId, ...updateData } = await req.json();

    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    const movie = await Movie.findOneAndUpdate(
      { _id: movieId, provider: session.userId },
      updateData,
      { new: true }
    );

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Movie updated successfully", movie });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// **DELETE** - Remove a Movie
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const token = authHeader.split(" ")[1];
    const session = verifyAccessToken(token) as JwtPayload;
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { movieId } = await req.json();

    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    const movie = await Movie.findOneAndDelete({
      _id: movieId,
      provider: session.userId,
    });

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Movie deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
