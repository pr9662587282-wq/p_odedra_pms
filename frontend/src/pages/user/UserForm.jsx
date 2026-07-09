import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function User_form() {
  const loginUser = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [fullname, setfullname] = useState("");
  const [joiningDate, setjoiningDate] = useState("");
  const [bDate, setbDate] = useState("");
  const [address, setaddress] = useState("");
  const [city, setcity] = useState("");
  const [number, setnumber] = useState("");
  const [gender, setgender] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitfrom = async (event) => {
    event.preventDefault();

    if (!loginUser) {
      alert("Please login before submitting the form.");
      return;
    }

    if (
      !fullname ||
      !joiningDate ||
      !bDate ||
      !gender ||
      !address ||
      !city ||
      !number
    ) {
      //alert("Please fill all fields");
      toast.custom("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/fromuser`,
        {
          email: loginUser,
          fullname,
          joiningDate,
          bDate,
          gender,
          address,
          city,
          number,
          role,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      setMessage(response.data?.message || "Form submitted successfully");
      setfullname("");
      setjoiningDate("");
      setbDate("");
      setgender("");
      setaddress("");
      setcity("");
      setnumber("");
      setTimeout(() => {
        navigate("/UserDeshboard");
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message ||
          "Error submitting form. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Personal Data</h1>
        <p className="text-gray-500 text-sm mb-6">
          Fields with <span className="text-red-500">*</span> are mandatory.
        </p>

        <form className="space-y-4" onSubmit={submitfrom}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullname"
              value={fullname}
              onChange={(e) => setfullname(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joining Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="joiningDate"
              value={joiningDate}
              onChange={(e) => setjoiningDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="bDate"
                value={bDate}
                onChange={(e) => setbDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={city}
                onChange={(e) => setcity(e.target.value)}
                placeholder="Enter city"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={gender}
                onChange={(e) => setgender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={address}
                onChange={(e) => setaddress(e.target.value)}
                placeholder="Enter address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="number"
              value={number}
              onChange={(e) => setnumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.toLowerCase().includes("success")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              className="flex-1 px-4 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              ← BACK
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {loading ? "SAVING..." : "NEXT →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
