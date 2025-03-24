import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Movie as MovieType, Location, DateSchedule, Showtime } from "@/lib/models/movie";

interface Seat {
  row: number;
  column: number;
}

interface Props {
  movie: MovieType | null;
  onClose: () => void;
  onSeatSelect?: (seat: Seat) => void;  
  showConfirmButton: boolean; 
}

const BookingModal: React.FC<Props> = ({ movie, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeats] = useState<boolean[][]>([]);
  const [showSeats, setShowSeats] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (movie && selectedLocation && selectedDate && selectedTime) {
      const showtime = movie.showtimes.find((s) => s.location === selectedLocation);
      const dateData = showtime?.schedules.find((d) => d.date === selectedDate);
      const timeSlot = dateData?.times.find((t) => t.time === selectedTime);

      if (timeSlot?.seats) {
        setSeats(timeSlot.seats);
      } else {
        setSeats([]);
      }
    } else {
      setSeats([]);
    }
  }, [movie, selectedLocation, selectedDate, selectedTime]);

  if (!movie) return null;

  const locations = movie.showtimes.map((loc: Location) => loc.location);
  const selectedLocationData = movie.showtimes.find((loc: Location) => loc.location === selectedLocation);
  const availableDates = selectedLocationData ? selectedLocationData.schedules.map((s: DateSchedule) => s.date) : [];
  const selectedDateData = selectedLocationData?.schedules.find((d: DateSchedule) => d.date === selectedDate);
  const availableTimes = selectedDateData ? selectedDateData.times.map((t: Showtime) => t.time) : [];

  const toggleSeatSelection = (rowIndex: number, colIndex: number) => {
    const seatId = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleConfirmBooking = () => {
    const bookingDetails = {
      movieId: movie.id,
      movieName: movie.name,
      provider: movie.provider,
      location: selectedLocation,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
    };
    router.push(`/booking-details?data=${encodeURIComponent(JSON.stringify(bookingDetails))}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 rounded-lg w-[500px] shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          {movie.name} <span className="text-green-400">({movie.provider})</span>
        </h2>

        <label className="block text-gray-300">Select Location:</label>
        <select
          className="border border-gray-700 bg-gray-800 text-white p-2 w-full rounded"
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setSelectedDate("");
            setSelectedTime("");
            setShowSeats(false);
          }}
        >
          <option value="">Choose Location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <label className="block mt-4 text-gray-300">Select Date:</label>
        <select
          className="border border-gray-700 bg-gray-800 text-white p-2 w-full rounded"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime("");
            setShowSeats(false);
          }}
          disabled={!availableDates.length}
        >
          <option value="">Choose Date</option>
          {availableDates.map((date) => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>

        <label className="block mt-4 text-gray-300">Select Time:</label>
        <select
          className="border border-gray-700 bg-gray-800 text-white p-2 w-full rounded"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          disabled={!availableTimes.length}
        >
          <option value="">Choose Time</option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>

        <button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold"
          onClick={() => setShowSeats(true)}
          disabled={!selectedTime}
        >
          Choose Seats
        </button>

        {showSeats && seats.length > 0 && (
          <div className="mt-4 flex justify-between bg-gray-800 p-4 rounded-lg">
            {[0, 1].map((half) => (
              <div key={half} className="grid grid-cols-4 gap-2">
                {seats.slice(half * 4, (half + 1) * 4).map((row, rowIndex) =>
                  row.map((seat, colIndex) => (
                    <button
                      key={`${half}-${rowIndex}-${colIndex}`}
                      className={`p-2 w-10 h-10 text-white text-center rounded ${
                        seat ? selectedSeats.includes(`${String.fromCharCode(65 + half * 4 + rowIndex)}${colIndex + 1}`)
                          ? "bg-green-500" : "bg-gray-600 hover:bg-gray-500" : "bg-red-500 cursor-not-allowed"
                      }`}
                      disabled={!seat}
                      onClick={() => toggleSeatSelection(half * 4 + rowIndex, colIndex)}
                    >
                      {String.fromCharCode(65 + half * 4 + rowIndex)}{colIndex + 1}
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>
        )}

         {/* Confirm Booking */}
         {selectedSeats.length > 0 && (
          <button
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full font-semibold"
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </button>
        )}

        <button className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BookingModal;
