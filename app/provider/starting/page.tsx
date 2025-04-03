"use client"; // Ensure this runs on the client side

import { useState } from "react";

const ProviderForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    aadhaar: "",
    contact: "",
    address: "",
    gstNumber: "",
    aadhaarFile: null,
    panCardFile: null,
    theatreLicenseFile: null,
    gstFile: null,
  });

  const [message, setMessage] = useState("");

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const fileName = file.name.toLowerCase();
      const fileSize = file.size / 1024 / 1024; // size in MB

      if (fileSize > 5) {
        alert("❌ File size exceeds 5MB!");
        return;
      }

      if (
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".png") ||
        fileName.endsWith(".pdf")
      ) {
        setFormData({ ...formData, [e.target.name]: file });
      } else {
        alert(
          "❌ Invalid file type! Accepted types are .jpg, .jpeg, .png, and .pdf."
        );
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Aadhaar number
    if (formData.aadhaar.length !== 12 || !/^\d{12}$/.test(formData.aadhaar)) {
      setMessage("❌ Invalid Aadhaar Number! Must be 12 digits.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("organization", formData.organization);
    formDataToSend.append("aadhaar", formData.aadhaar);
    formDataToSend.append("contact", formData.contact);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("gstNumber", formData.gstNumber);

    if (formData.aadhaarFile)
      formDataToSend.append("aadhaarFile", formData.aadhaarFile);
    if (formData.panCardFile)
      formDataToSend.append("panCardFile", formData.panCardFile);
    if (formData.theatreLicenseFile)
      formDataToSend.append("theatreLicenseFile", formData.theatreLicenseFile);
    if (formData.gstFile) formDataToSend.append("gstFile", formData.gstFile);

    try {
      const response = await fetch("/api/storeproviderdetails", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("✅ Provider details submitted successfully!");
      } else {
        const data = await response.json();
        alert(`❌ Failed to submit: ${data.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    
    <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white shadow-md rounded-lg mt-10 h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">Provider Information</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Provider Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="organization"
          placeholder="Organization Name"
          value={formData.organization}
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="aadhaar"
          placeholder="Aadhaar Number"
          value={formData.aadhaar}
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="gstNumber"
          placeholder="GST Number"
          value={formData.gstNumber}
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
          required
        />
        {/* File inputs */}
        <div className="space-y-3">
          <input
            type="file"
            name="aadhaarFile"
            onChange={handleFileChange}
            className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
            accept=".jpg, .jpeg, .png, .pdf"
          />
          <label className="block text-sm text-gray-300">
            Aadhaar Card Photo (Max 5MB, JPG/PNG/PDF)
          </label>

          <input
            type="file"
            name="panCardFile"
            onChange={handleFileChange}
            className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
            accept=".jpg, .jpeg, .png, .pdf"
          />
          <label className="block text-sm text-gray-300">
            PAN Card Photo (Max 5MB, JPG/PNG/PDF)
          </label>

          <input
            type="file"
            name="theatreLicenseFile"
            onChange={handleFileChange}
            className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
            accept=".jpg, .jpeg, .png, .pdf"
          />
          <label className="block text-sm text-gray-300">
            Theater License Photo (Max 5MB, JPG/PNG/PDF)
          </label>

          <input
            type="file"
            name="gstFile"
            onChange={handleFileChange}
            className="w-full p-3 border rounded-md mb-3 bg-gray-700 text-white"
            accept=".jpg, .jpeg, .png, .pdf"
          />
          <label className="block text-sm text-gray-300">
            GST Registration (Max 5MB, JPG/PNG/PDF)
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md mt-4"
        >
          Submit Provider Information
        </button>
      </form>
      {message && <p className="mt-3 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default ProviderForm;
