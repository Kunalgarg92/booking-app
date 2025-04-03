"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface BookingDetails {
  movieId: string;
  location: string;
  date: string;
  time: string;
  seats: string[];
}

const PLATFORM_FEE = 40;
const TAX_RATE = 0.18;

const BookingDetailsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [movieName, setMovieName] = useState<string>("");
  const [lowPrice, setLowPrice] = useState<number>(0);
  const [highPrice, setHighPrice] = useState<number>(0);
  const [lowPriceRows, setLowPriceRows] = useState<number>(0);

  useEffect(() => {
    const fetchMovie = async (movieId: string) => {
      try {
        const response = await fetch(`/api/movie/${movieId}`);
        const data = await response.json();

        if (data.success) {
          setMovieName(data.data.name);
          setLowPrice(data.data.lowPrice);
          setHighPrice(data.data.highPrice);
          setLowPriceRows(data.data.lowPriceRows);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    const data = searchParams.get("data");
    if (data) {
      try {
        const parsedData: BookingDetails = JSON.parse(decodeURIComponent(data));
        setBooking(parsedData);
        fetchMovie(parsedData.movieId);
      } catch (error) {
        console.error("Error parsing booking details:", error);
      }
    }
  }, [searchParams]);

  if (!booking) {
    return <div className="text-white text-center p-4">Loading booking details...</div>;
  }

  // Function to calculate price per seat
  const calculatePricePerSeat = (seat: string): number => {
    // Extract row number from seat (e.g., "A3" -> row A, "B5" -> row B)
    const rowLetter = seat[0];
    const rowNumber = rowLetter.charCodeAt(0) - 64; // Convert "A" -> 1, "B" -> 2, etc.

    // If the row is within the lowPriceRows range, return lowPrice, else highPrice
    return rowNumber <= lowPriceRows ? lowPrice : highPrice;
  };

  // Compute total ticket cost dynamically
  const ticketCost = booking.seats.reduce((total, seat) => total + calculatePricePerSeat(seat), 0);
  const taxAmount = ticketCost * TAX_RATE;
  const totalAmount = ticketCost + PLATFORM_FEE + taxAmount;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">Booking Confirmation</h2>
        <div className="border-b border-gray-700 pb-4 mb-4">
          <h3 className="text-xl font-semibold">{movieName}</h3>
          <p className="text-gray-400 mt-2">Location: <span className="text-white">{booking.location}</span></p>
          <p className="text-gray-400">Date: <span className="text-white">{booking.date}</span></p>
          <p className="text-gray-400">Time: <span className="text-white">{booking.time}</span></p>
        </div>

        <h3 className="text-lg font-semibold">Seats:</h3>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {booking.seats.map((seat) => (
            <span key={seat} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
              {seat} - ₹{calculatePricePerSeat(seat)}
            </span>
          ))}
        </div>

        {/* Billing Section */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-400">Billing Details</h3>
          <div className="mt-3">
            <p className="flex justify-between text-gray-300">
              <span>Ticket Price</span>
              <span>₹{ticketCost.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-gray-300">
              <span>Platform Fee</span>
              <span>₹{PLATFORM_FEE.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-gray-300">
              <span>Taxes (18% GST)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </p>
            <hr className="border-gray-600 my-2" />
            <p className="flex justify-between text-xl font-bold text-white">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Payment Button */}
        <button 
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg text-lg transition duration-300"
          onClick={() => alert(`Redirecting to payment for ₹${totalAmount.toFixed(2)}`)}
        >
          Proceed to Payment (₹{totalAmount.toFixed(2)})
        </button>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
