import mongoose, { Schema, Document, Model } from "mongoose";

// 🎯 Showtime Schema (Seats as a 2D Array)
const ShowtimeSchema = new Schema({
  time: { type: String, required: true, trim: true },
  seats: {
    type: [[Boolean]], // 2D Array
    required: true,
    validate: {
      validator: function (value: boolean[][]) {
        return (
          Array.isArray(value) &&
          value.every(
            (row) =>
              Array.isArray(row) && row.every((col) => typeof col === "boolean")
          )
        );
      },
      message: "Invalid seat structure, must be a 2D boolean array.",
    },
  },
});

const DateScheduleSchema = new Schema({
  date: { type: String, required: true, trim: true },
  times: { type: [ShowtimeSchema], default: [] },
});

// 🎯 Location Schema
const LocationSchema = new Schema({
  location: { type: String, required: true, trim: true },
  schedules: { type: [DateScheduleSchema], default: [] },
});

// 🎯 Seating Details Schema
const SeatingDetailsSchema = new Schema({
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  lowPriceRows: { type: Number, required: true },
  lowPrice: { type: Number, required: true },
  highPrice: { type: Number, required: true },
});

export interface Showtime {
  time: string;
  seats: boolean[][];
}

export interface DateSchedule {
  date: string;
  times: Showtime[];
}

export interface Location {
  location: string;
  schedules: DateSchedule[];
}

export interface SeatingDetails {
  rows: number;
  columns: number;
  lowPriceRows: number;
  lowPrice: number;
  highPrice: number;
}

export interface Movie {
  id: string; // Ensure this exists
  name: string;
  image: string;
  provider: string;
  releaseDate: string;
  rating: number;
  showtimes: Location[];
  seatingDetails: SeatingDetails;
}

interface MovieDocument extends Document, Omit<Movie, "id"> {
  _id: string; 
}

const MovieSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    releaseDate: { type: String, required: true, trim: true },
    rating: { type: Number, required: true },
    showtimes: { type: [LocationSchema], default: [] },
    seatingDetails: { type: SeatingDetailsSchema, required: true },
  },
  { timestamps: true }
);

const Movie: Model<MovieDocument> =
  mongoose.models.Movie || mongoose.model<MovieDocument>("Movie", MovieSchema);

export default Movie;
