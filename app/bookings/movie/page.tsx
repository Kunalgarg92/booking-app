"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MovieCard from "./MovieCard";
import BookingModal from "./BookingModal";
import { PrivateRoute } from "@/app/hooks/PrivateRoute";
import { Movie } from "@/lib/models/movie";

type Seat = {
  row: number;
  column: number;
};

export default function MovieBooking() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [userEmail, setUserEmail] = useState("Loading...");
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded?.userId || decoded?.id || decoded?.sub;
        if (!userId) return;
        const response = await axios.get(`/api/user/info?userId=${userId}`);
        setUserEmail(response.data?.email || "No email found");
      } catch (error) {
        console.error("Token decode or API error:", error);
        setUserEmail("Error fetching email");
      }
    };
    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get<{ movies: Movie[] }>("/api/movie/customer");
        if (Array.isArray(response.data.movies)) {
          const uniqueMovies = Array.from(
            new Map(response.data.movies.map((movie) => [movie.id, movie])).values()
          );
          setMovieList(uniqueMovies);
        } else {
          console.error("Invalid movies data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };    
    fetchMovies();
  }, []);

  const uniqueProviders = [...new Set(movieList.map((movie) => movie.provider))];

  return (
    <PrivateRoute>
      <div className="p-8 min-h-screen bg-gray-900 text-white relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-center flex-grow">🎬 Book Your Movie Tickets</h1>
          <div className="relative">
            <button
              className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center focus:ring-2 focus:ring-blue-500"
              onClick={() => setShowMenu(!showMenu)}
            >
              <img
                src="https://cdn5.f-cdn.com/contestentries/1005995/24537990/5908bcd3c60c1_thumb900.jpg"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg p-3">
                <p className="text-sm truncate">{userEmail}</p>
                <button
                  className="w-full mt-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.reload();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search for a movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">🎥 All Providers</option>
            {uniqueProviders.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-semibold">🎥 Now Showing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {movieList
            .filter((movie) => {
              const movieDate = new Date(movie.releaseDate).toLocaleDateString("en-CA");
              return (
                movie.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (selectedDate === "" || movieDate === selectedDate) &&
                (selectedProvider === "" || movie.provider === selectedProvider)
              );
            })
            .map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={() => {
                  setSelectedMovie(movie);
                  setSelectedSeat(null);
                }}
              />
            ))}
        </div>

        {selectedMovie && (
          <BookingModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onSeatSelect={(seat: Seat) => setSelectedSeat(seat)}
            showConfirmButton={selectedSeat !== null}
          />
        )}
      </div>
    </PrivateRoute>
  );
}