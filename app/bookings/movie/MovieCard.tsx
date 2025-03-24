import React from "react";
import { FaStar } from "react-icons/fa";
import { Movie } from "@/lib/models/movie"; 

interface Props {
  movie: Movie;
  onSelect: () => void;
}


const MovieCard: React.FC<Props> = ({ movie, onSelect }) => {
  const isReleased = new Date(movie.releaseDate) <= new Date();
  const formattedDate = new Date(movie.releaseDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="relative w-full h-80 flex items-center justify-center bg-black">
        <img src={movie.image} alt={movie.name} className="w-full h-full object-contain" />
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900">{movie.name}</h2>
        <p className="text-gray-600 text-sm">🎭 {movie.provider}</p>

        <p className="text-gray-600 text-sm mt-1">📅 Release Date: <span className="font-medium">{formattedDate}</span></p>

        {isReleased ? (
          <div className="flex items-center mt-2 text-yellow-500">
            <FaStar />
            <span className="ml-1 font-semibold">{movie.rating}/10</span>
            <span className="ml-2 text-gray-500 text-sm">({Math.floor(Math.random() * 500)} Votes)</span>
          </div>
        ) : (
          <p className="text-red-500 font-semibold mt-2">🚀 Coming Soon</p>
        )}

        {isReleased && (
          <button
            onClick={onSelect}
            className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200"
          >
            🎟 Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
