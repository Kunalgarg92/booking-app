"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrivateRoute } from "@/app/hooks/PrivateRoute";
import { jwtDecode } from "jwt-decode";

interface UserInfo {
  name: string;
  email: string;
  image?: string;
}

interface DecodedToken {
  userId: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Decode token and set userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(decoded.userId);
      } catch {
        setError("Invalid token. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      }
    }
  }, []);

  // Fetch user info
  useEffect(() => {
    if (!userId) return;
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`/api/user/info?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user info");
        setUserInfo(await res.json());
      } catch (err) {
        setError("Error loading user info.");
      }
    };
    fetchUserInfo();
  }, [userId]);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <PrivateRoute>
      <div className="p-6 w-full min-h-screen bg-gray-900 text-white">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-blue-400">Your Booking Hub</h2>

          <div className="flex items-center space-x-6">
            {/* Book Now Dropdown */}
            <div className="relative">
              <button
                className="text-white hover:text-blue-400 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Book Now ▼
              </button>
              {dropdownOpen && (
                <div className="absolute mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-40">
                  <ul className="py-2">
                    {["Movie", "Train", "Bus", "Flight"].map((item) => (
                      <li
                        key={item}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => router.push(`/bookings/${item.toLowerCase()}`)}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button className="text-white hover:text-blue-400" onClick={() => router.push("/my-bookings")}>
              My Bookings
            </button>
            <button className="text-white hover:text-blue-400" onClick={() => router.push("/chat")}>
              Chat
            </button>
            <button className="text-white hover:text-blue-400" onClick={() => router.push("/reviews")}>
              Reviews
            </button>
            <button className="text-white hover:text-blue-400" onClick={() => router.push("/contact")}>
              Contact Us
            </button>

            {/* User Profile Dropdown */}
            {userInfo && (
              <div className="relative">
                <img
                  src={userInfo.image || "https://cdn5.f-cdn.com/contestentries/1005995/24537990/5908bcd3c60c1_thumb900.jpg"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300"
                  onClick={() => setMenuOpen(!menuOpen)}
                />
                {menuOpen && (
                  <div className="absolute right-0 mt-2 min-w-[150px] bg-gray-800 shadow-lg rounded-lg p-3 z-10 text-center">
                    <p className="text-sm text-gray-300">{userInfo.email}</p>
                    <hr className="my-2 border-gray-600" />
                    <button className="w-full text-red-400 hover:text-red-500" onClick={logout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Featured Deals & Discounts */}
<section className="text-center py-10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-lg">
  <h1 className="text-3xl font-extrabold text-blue-400 tracking-wide">
    🔥 Special Deals & Discounts 🔥
  </h1>
  <p className="text-gray-300 mt-2 text-lg">Book now and grab exclusive offers!</p>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8 px-4">
    {[
      { text: "Flat 20% off on Holi Trips!", icon: "🎨" },
      { text: "Movie Tickets @ ₹99", icon: "🎬" },
      { text: "Train Tickets - Buy 1 Get 1 Free!", icon: "🚆" },
      { text: "Flight Discounts up to ₹2000", icon: "✈️" },
    ].map((deal, index) => (
      <div
        key={index}
        className="relative p-5 bg-gray-800 rounded-lg shadow-md text-white text-lg font-semibold flex items-center justify-center transition-transform duration-300 transform hover:scale-105 border-2 border-gray-700 hover:border-blue-400"
      >
        <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          New
        </span>
        <span className="text-2xl mr-2">{deal.icon}</span> {deal.text}
      </div>
    ))}
  </div>
</section>


        {/* Popular Bookings */}
        <section className="mt-12">
  <h2 className="text-3xl font-bold text-white text-center mb-6">📍 Popular Destinations</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {[
      { name: "Vrindavan Holi", img: "https://www.holifestival.org/images/Holi-in-Mathura-Vrindavan-2.jpg" },
      { name: "Goa Beach", img: "https://media.istockphoto.com/id/1202427959/photo/sunset-at-tropical-beach-with-deck-chairs-under-ubrellas.jpg?s=612x612&w=0&k=20&c=5VwSzURPtMuH8yK-BUCjExIi6n4Hir3fzFbk0_JaNKg=" },
      { name: "Kedarnath Yatra", img: "https://cdn.triptotemples.com/ImageManager/678f3df96c98652cc271604d-kedarnath-900x600.jpg" },
      { name: "Jaipur Tour", img: "https://media.istockphoto.com/id/635726330/photo/nahargarh-fort.jpg?b=1&s=612x612&w=0&k=20&c=rHE4_H7HKuV-YMt5qJgKuQXmwoP_2-tu06ytyVQEbwA=" },
    ].map((destination, index) => (
      <div
        key={index}
        className="relative group rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${destination.img})` }}
        ></div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-70 transition duration-300"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-2xl font-bold text-white">{destination.name}</h3>
          <p className="text-gray-300 mt-2">Book your {destination.name} trip today!</p>

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Book Now
          </button>
        </div>
      </div>
    ))}
  </div>
</section>


        {/* Testimonials */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white text-center">⭐ What Our Users Say ⭐</h2>
          <div className="mt-6 flex flex-col md:flex-row gap-6">
            {[
              { name: "Aman Gupta", review: "Booking was a breeze! The user-friendly interface made the process quick and hassle-free. I’ll definitely be using this service again for my future travel plans!", img: "https://www.hire4event.com/apppanel/assets/artistimage/17290588951729058895aman2.jpg" },
              { name: "Sneha Sharma", review: "Unbeatable discounts! I found the best price for my booking, making my travel plans even more enjoyable. Highly recommend checking this site for great deals!", img: "https://media.licdn.com/dms/image/v2/D4D03AQH67A-26cfQ7w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1689930467368?e=2147483647&v=beta&t=B-FtbA7Bb58U9-vxDzcTmCKJdquFYGEdjUZ55mu5RG4" },
              { name: "Rohan Mehta", review: "The customer support is outstanding! They were quick to assist and resolved my queries with ease. Truly a fantastic experience that made my booking stress-free!", img: "https://media.licdn.com/dms/image/D4D03AQHx6w3z5Hyysg/profile-displayphoto-shrink_200_200/0/1722189163542?e=2147483647&v=beta&t=_W22gyiKAjRadUA19Kjh1fR0Yti2VE_uWoDEAplnAOY" },
              { name: "Pooja Verma", review: "I absolutely loved my Holi trip to Vrindavan! The vibrant colors and festive atmosphere made it an unforgettable experience. Can't wait to go back and relive the magic!", img: "data:image/jpeg;base64,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" },
            ].map((feedback, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md flex-1">
                <img src={feedback.img} alt="User" className="w-12 h-12 rounded-full mx-auto mb-2" />
                <p className="text-gray-400">"{feedback.review}"</p>
                <p className="text-blue-400 mt-2">- {feedback.name}</p>
              </div>
            ))}
          </div>
        </section>
         {/* FOOTER */}
         <footer className="mt-16 py-6 border-t border-gray-700 text-center">
          <p className="text-gray-400">&copy; 2025 Your Booking Hub. All Rights Reserved.</p>
          </footer>
          {/* Error Message */}
          {error && <p className="text-red-400">{error}</p>}
      </div>
    </PrivateRoute>
  );
}
