"use client";

import { useState } from "react";
import axios from "axios";
import { PrivateRoute } from "@/app/hooks/PrivateRoute";

interface SeatMatrix {
  time: string;
  seats: boolean[][];
}

interface Schedule {
  date: string;
  times: SeatMatrix[];
}

interface Showtime {
  location: string;
  schedules: Schedule[];
  error?: boolean;
}

interface SeatingDetails {
  rows: string;
  columns: string;
  lowPriceRows: string;
  lowPrice: string;
  highPrice: string;
}

interface Movie {
  id: string;
  name: string;
  image: string;
  provider: string;
  releaseDate: string;
  rating: number;
  showtimes: Showtime[];
  seatingDetails: SeatingDetails;
}

export default function ProviderPage() {
  return (
    <PrivateRoute>
      <MovieForm />
    </PrivateRoute>
  );
}

const defaultMovie: Movie = {
  id: "",
  name: "",
  image: "",
  provider: "",
  releaseDate: "",
  rating: 0,
  showtimes: [
    {
      location: "",
      schedules: [
        {
          date: "",
          times: [
            {
              time: "",
              seats: Array(3)
                .fill(null)
                .map(() => Array(4).fill(false)),
            },
          ],
        },
      ],
    },
  ],
  seatingDetails: {
    rows: "",
    columns: "",
    lowPriceRows: "",
    lowPrice: "",
    highPrice: "",
  },
};

function MovieForm() {
  const [movie, setMovie] = useState<Movie>(defaultMovie);

  const handleCityChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    locIndex: number
  ) => {
    const cityName = e.target.value;

    // Update location immediately
    setMovie((prevMovie) => {
      const updatedShowtimes = [...prevMovie.showtimes];
      updatedShowtimes[locIndex] = {
        ...updatedShowtimes[locIndex],
        location: cityName,
      };
      return { ...prevMovie, showtimes: updatedShowtimes };
    });

    try {
      const isValidCity = await fetchCityValidation(cityName);

      // Update error status based on validation
      setMovie((prevMovie) => {
        const updatedShowtimes = [...prevMovie.showtimes];
        updatedShowtimes[locIndex] = {
          ...updatedShowtimes[locIndex],
          error: !isValidCity,
        };
        return { ...prevMovie, showtimes: updatedShowtimes };
      });
    } catch (error) {
      console.error("City validation failed:", error);
    }
  };

  const fetchCityValidation = async (cityName: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          cityName
        )}&country=India&format=json`
      );
      const data = await response.json();
      return data.length > 0;
    } catch (error) {
      console.error("Error validating city:", error);
      return false;
    }
  };


  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!movie.name) newErrors.name = "This field is empty";
    if (!movie.image || !/^https?:\/\//.test(movie.image)) {
      newErrors.image = "Invalid image URL. Must start with http or https.";
    }
    if (!movie.provider) newErrors.provider = "Provider name is required.";
    if (!movie.releaseDate) {
      newErrors.releaseDate = "Release date is required.";
    } else if (new Date(movie.releaseDate) < new Date()) {
      newErrors.releaseDate = "Release date cannot be in the past.";
    }
    if (movie.rating < 0 || movie.rating > 10) {
      newErrors.rating = "Rating must be between 0 and 10.";
    }

    // Validate seating details
    if (
      !movie.seatingDetails.rows ||
      isNaN(Number(movie.seatingDetails.rows))
    ) {
      newErrors.rows = "Invalid number of rows";
    }
    if (
      !movie.seatingDetails.columns ||
      isNaN(Number(movie.seatingDetails.columns))
    ) {
      newErrors.columns = "Invalid number of columns";
    }
    if (
      !movie.seatingDetails.lowPriceRows ||
      isNaN(Number(movie.seatingDetails.lowPriceRows))
    ) {
      newErrors.lowPriceRows = "Invalid number of low price rows";
    }
    if (
      !movie.seatingDetails.lowPrice ||
      isNaN(Number(movie.seatingDetails.lowPrice))
    ) {
      newErrors.lowPrice = "Invalid low price";
    }
    if (
      !movie.seatingDetails.highPrice ||
      isNaN(Number(movie.seatingDetails.highPrice))
    ) {
      newErrors.highPrice = "Invalid high price";
    }

    // Validate showtimes
    if (movie.showtimes.length === 0) {
      newErrors.showtimes = "At least one location is required";
    } else {
      movie.showtimes.forEach((loc, locIndex) => {
        if (!loc.location) {
          newErrors[`location${locIndex}`] = "City is required";
        }
        if (loc.schedules.length === 0) {
          newErrors[`schedules${locIndex}`] =
            "At least one schedule is required";
        } else {
          loc.schedules.forEach((schedule, scheduleIndex) => {
            if (!schedule.date) {
              newErrors[`date${locIndex}${scheduleIndex}`] = "Date is required";
            }
            if (schedule.times.length === 0) {
              newErrors[`times${locIndex}${scheduleIndex}`] =
                "At least one showtime is required";
            }
          });
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addLocation = () => {
    setMovie((prevMovie) => {
      const updatedShowtimes = [
        ...prevMovie.showtimes,
        {
          location: "",
          schedules: [
            {
              date: "",
              times: [
                {
                  time: "",
                  seats: Array.from({ length: 5 }, () =>
                    Array.from({ length: 4 }, () => false)
                  ),
                },
              ],
            },
          ],
        },
      ];
      return { ...prevMovie, showtimes: updatedShowtimes };
    });
  };

  const removeLocation = (index: number) => {
    setMovie((prev) => ({
      ...prev,
      showtimes: prev.showtimes.filter((_, i) => i !== index),
    }));
  };

  const addSchedule = (locIndex: number) => {
    setMovie((prevMovie) => {
      const updatedShowtimes = prevMovie.showtimes.map((location, lIdx) =>
        lIdx === locIndex
          ? {
              ...location,
              schedules: [
                ...location.schedules,
                {
                  date: "",
                  times: [
                    {
                      time: "",
                      seats: Array.from({ length: 5 }, () =>
                        Array.from({ length: 4 }, () => false)
                      ),
                    },
                  ],
                },
              ],
            }
          : location
      );

      return { ...prevMovie, showtimes: updatedShowtimes };
    });
  };

  const removeSchedule = (locIndex: number, scheduleIndex: number) => {
    setMovie((prev) => {
      const updatedShowtimes = [...prev.showtimes];
      updatedShowtimes[locIndex].schedules = updatedShowtimes[
        locIndex
      ].schedules.filter((_, i) => i !== scheduleIndex);
      return { ...prev, showtimes: updatedShowtimes };
    });
  };

  const addTimeSlot = (locIndex: number, scheduleIndex: number) => {
    setMovie((prevMovie) => {
      const updatedShowtimes = prevMovie.showtimes.map((location, lIdx) =>
        lIdx === locIndex
          ? {
              ...location,
              schedules: location.schedules.map((schedule, sIdx) =>
                sIdx === scheduleIndex
                  ? {
                      ...schedule,
                      times: [
                        ...schedule.times,
                        {
                          time: "",
                          seats: Array.from({ length: 5 }, () =>
                            Array.from({ length: 4 }, () => false)
                          ),
                        },
                      ],
                    }
                  : schedule
              ),
            }
          : location
      );
      return { ...prevMovie, showtimes: updatedShowtimes };
    });
  };

  const removeTimeSlot = (
    locIndex: number,
    scheduleIndex: number,
    timeIndex: number
  ) => {
    setMovie((prev) => {
      const updatedShowtimes = [...prev.showtimes];
      updatedShowtimes[locIndex].schedules[scheduleIndex].times =
        updatedShowtimes[locIndex].schedules[scheduleIndex].times.filter(
          (_, i) => i !== timeIndex
        );
      return { ...prev, showtimes: updatedShowtimes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:3000/api/movie/provider", movie);
      alert("Movie added successfully");
    } catch (error) {
      console.error("Error submitting movie:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
          🎬 Add Movie
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              "Movie Name",
              "Movie Poster in URL ",
              "Provider Name",
              "ReleaseDate",
              "Rating",
            ].map((key, index) => (
              <div key={index}>
                <input
                  type={key === "releaseDate" ? "date" : "text"}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={String(movie[key as keyof Movie] || "")}
                  onChange={(e) =>
                    key === "location"
                      ? handleCityChange(e, index)
                      : setMovie((prevMovie) => ({
                          ...prevMovie,
                          [key]: e.target.value,
                        }))
                  }
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[key] && (
                  <p className="text-red-500 text-sm">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Seats & Pricing */}
          <div>
            <h3 className="text-xl font-semibold text-white">
              🎟️ Seats & Pricing
            </h3>

            
            {/* Rows Input */}
            <div className="border border-white/20 p-4 rounded-lg bg-white/10 mt-3">
              <label className="text-white text-sm">Total Rows</label>
              <input
                type="number"
                placeholder="Total Rows"
                value={movie.seatingDetails.rows}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    seatingDetails: {
                      ...movie.seatingDetails,
                      rows: e.target.value,
                    },
                  })
                }
                className="w-full p-3 mt-1 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
              {errors.rows && (
                <p className="text-red-500 text-sm">{errors.rows}</p>
              )}
            </div>

            {/* Columns Input */}
            <div className="border border-white/20 p-4 rounded-lg bg-white/10 mt-3">
              <label className="text-white text-sm">Total Columns</label>
              <input
                type="number"
                placeholder="Total Columns"
                value={movie.seatingDetails.columns}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    seatingDetails: {
                      ...movie.seatingDetails,
                      columns: e.target.value,
                    },
                  })
                }
                className="w-full p-3 mt-1 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Low Price Rows Input */}
            <div className="border border-white/20 p-4 rounded-lg bg-white/10 mt-3">
              <label className="text-white text-sm">Low Price Rows</label>
              <input
                type="number"
                placeholder="Low Price Rows"
                value={movie.seatingDetails.lowPriceRows}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    seatingDetails: {
                      ...movie.seatingDetails,
                      lowPriceRows: e.target.value,
                    },
                  })
                }
                className="w-full p-3 mt-1 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Low Price Input */}
            <div className="border border-white/20 p-4 rounded-lg bg-white/10 mt-3">
              <label className="text-white text-sm">Low Price</label>
              <input
                type="number"
                placeholder="Low Price"
                value={movie.seatingDetails.lowPrice}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    seatingDetails: {
                      ...movie.seatingDetails,
                      lowPrice: e.target.value,
                    },
                  })
                }
                className="w-full p-3 mt-1 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* High Price Input */}
            <div className="border border-white/20 p-4 rounded-lg bg-white/10 mt-3">
              <label className="text-white text-sm">High Price</label>
              <input
                type="number"
                placeholder="High Price"
                value={movie.seatingDetails.highPrice}
                onChange={(e) =>
                  setMovie({
                    ...movie,
                    seatingDetails: {
                      ...movie.seatingDetails,
                      highPrice: e.target.value,
                    },
                  })
                }
                className="w-full p-3 mt-1 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}

          <div>
            <h3 className="text-xl font-semibold text-white">
              📍 Locations & Showtimes
            </h3>

            {movie.showtimes.map((loc, locIndex) => (
              <div
                key={locIndex}
                className="border border-white/20 p-4 rounded-lg bg-white/10 mt-3"
              >
                {/* Location Input */}
                <input
                  type="text"
                  placeholder="City"
                  value={loc.location}
                  onChange={(e) => handleCityChange(e, locIndex)}
                  className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />

                {/* Show Error if City is Invalid */}
                {loc.error && (
                  <p className="text-red-500 text-sm mt-1">
                    ❌ Please enter a valid city in India.
                  </p>
                )}

                {/* Schedule (Dates) */}
                {loc.schedules.map((schedule, scheduleIndex) => (
                  <div
                    key={scheduleIndex}
                    className="mt-3 border border-gray-500 p-3 rounded-lg"
                  >
                    <input
                      type="date"
                      value={schedule.date}
                      onChange={(e) => {
                        const updatedShowtimes = [...movie.showtimes];
                        updatedShowtimes[locIndex].schedules[
                          scheduleIndex
                        ].date = e.target.value;
                        setMovie({ ...movie, showtimes: updatedShowtimes });
                      }}
                      className="w-full p-2 bg-black/20 border border-white/20 rounded-lg text-white"
                    />

                    {/* Times for the Selected Date */}
                    {schedule.times.map((timeSlot, timeIndex) => (
                      <div key={timeIndex} className="mt-2">
                        <input
                          type="time"
                          value={timeSlot.time}
                          onChange={(e) => {
                            const updatedShowtimes = [...movie.showtimes];
                            updatedShowtimes[locIndex].schedules[
                              scheduleIndex
                            ].times[timeIndex].time = e.target.value;
                            setMovie({
                              ...movie,
                              showtimes: updatedShowtimes,
                            });
                          }}
                          className="w-full p-2 bg-black/20 border border-white/20 rounded-lg text-white"
                        />

                        {/* Seats Grid */}
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {timeSlot.seats.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex space-x-2">
                              {row.map((seat, seatIndex) => (
                                <button
                                  key={seatIndex}
                                  onClick={() => {
                                    const updatedShowtimes = [
                                      ...movie.showtimes,
                                    ];
                                    updatedShowtimes[locIndex].schedules[
                                      scheduleIndex
                                    ].times[timeIndex].seats[rowIndex][
                                      seatIndex
                                    ] = !seat;
                                    setMovie({
                                      ...movie,
                                      showtimes: updatedShowtimes,
                                    });
                                  }}
                                  className={`w-6 h-6 rounded ${
                                    seat ? "bg-red-500" : "bg-green-500"
                                  }`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        {/* Remove Time Slot */}
                        {schedule.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeTimeSlot(locIndex, scheduleIndex, timeIndex)
                            }
                            className="text-red-500 text-sm mt-2"
                          >
                            ❌ Remove Showtime
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add Time Slot Button */}
                    <button
                      type="button"
                      onClick={() => addTimeSlot(locIndex, scheduleIndex)}
                      className="mt-2 text-blue-400 text-sm"
                    >
                      + Add Showtime
                    </button>

                    {/* Remove Date Schedule */}
                    {loc.schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(locIndex, scheduleIndex)}
                        className="text-red-500 text-sm mt-2"
                      >
                        ❌ Remove Date
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Date Schedule Button */}
                <button
                  type="button"
                  onClick={() => addSchedule(locIndex)}
                  className="mt-2 text-blue-400 text-sm"
                >
                  + Add Date
                </button>

                {/* Remove Location Button */}
                {movie.showtimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLocation(locIndex)}
                    className="mt-2 text-gray-400 hover:text-gray-500 transition"
                  >
                    ❌ Remove Location
                  </button>
                )}
              </div>
            ))}

            {/* Add Location Button */}
            <button
              type="button"
              onClick={addLocation}
              className="mt-4 text-blue-400"
            >
              + Add Location
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            🚀 Submit
          </button>
        </form>
      </div>
    </div>
  );
}
