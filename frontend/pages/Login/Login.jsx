// src/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Mail, Lock, Eye, EyeOff } from "lucide-react";
import API_BASE_URL from '../../config/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");

  // login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // register state (simplified)
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Vendor login state
  const [showVendorLogin, setShowVendorLogin] = useState(false);
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPassword, setVendorPassword] = useState("");
  const [vendorShowPassword, setVendorShowPassword] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState("");

  // Helpers / validation
  const emailIsValid = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).toLowerCase());
  const passwordIsStrong = (p) => p.length >= 8;

  const registerFormIsValid = () => {
    return (
      regFullName.trim().length >= 2 &&
      emailIsValid(regEmail) &&
      passwordIsStrong(regPassword) &&
      regPassword === regConfirm
    );
  };

  // LOGIN handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      // Call backend API
      const res = await axios.post(`${API_BASE_URL}/api/auth/user/login`, {
        email,
        password,
      });

      // Store user data and token in localStorage
      const user = {
        ...res.data,
        loggedIn: true,
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", res.data.token);

      console.log("Logged in:", user);
      // Redirect to main page on successful login
      navigate("/main");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // REGISTER handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!registerFormIsValid()) {
      setRegError("Please fix the validation errors before submitting.");
      return;
    }

    setRegLoading(true);
    try {
      const payload = {
        name: regFullName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        phone: "", // Optional field
      };

      const res = await axios.post(`${API_BASE_URL}/api/auth/user/register`, payload);
      setRegSuccess("Account created successfully! You can now log in.");
      
      // Store token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      
      // clear form
      setRegFullName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");

      // switch to login after a short delay so user can see success
      setTimeout(() => setTab("login"), 1200);
      console.log("Registered:", res.data);
    } catch (err) {
      setRegError(err.response?.data?.message || "Registration failed. Try again.");
      console.error(err);
    } finally {
      setRegLoading(false);
    }
  };

  // VENDOR LOGIN handler
  const handleVendorLogin = async (e) => {
    e.preventDefault();
    setVendorError("");
    setVendorLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/vendor/login`, {
        email: vendorEmail,
        password: vendorPassword,
      });

      const accountData = {
        ...res.data,
        loggedIn: true,
      };
      
      // Store based on role
      if (res.data.role === "labour") {
        localStorage.setItem("labour", JSON.stringify(accountData));
      } else {
        localStorage.setItem("vendor", JSON.stringify(accountData));
      }
      localStorage.setItem("token", res.data.token);

      console.log(`${res.data.role} logged in:`, accountData);
      navigate("/vendor-dashboard");
    } catch (err) {
      setVendorError(err.response?.data?.message || "Login failed. Please try again.");
      console.error(err);
    } finally {
      setVendorLoading(false);
    }
  };

  // reset messages when switching tabs
  useEffect(() => {
    setLoginError("");
    setRegError("");
    setRegSuccess("");
    setVendorError("");
  }, [tab, showVendorLogin]);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
  {/* LEFT HERO - show only on large screens (lg+) to keep mobile clean) */}
  <aside className="hidden lg:flex flex-1 flex-col justify-between bg-[#174f48] text-white p-10">
        <div className="flex items-center gap-3 text-lg font-medium">
          <MapPin className="h-5 w-5" />
          <span className="text-white">KhoojLocal</span>
        </div>

        <div className="max-w-lg">
          <blockquote className="text-lg leading-relaxed">
            "KhoojLocal has transformed how I discover and interact with local
            businesses. The trust-based ranking system ensures I always find
            quality services."
          </blockquote>
          <div className="mt-6 text-sm">Sofia Davis</div>
        </div>
      </aside>

      {/* Compact top banner for medium screens (md) - hidden on lg */}
      <div className="hidden md:flex lg:hidden items-center justify-between bg-[#174f48] text-white px-6 py-3">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">KhoojLocal</span>
        </div>
        <div className="text-sm">Connect with trusted local services</div>
      </div>

      {/* RIGHT FORM SECTION */}
      <main className="flex flex-1 items-start sm:items-center justify-center bg-gray-50 min-h-screen overflow-auto py-6 sm:py-8">
        <div className="w-full max-w-md px-4 sm:px-0">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">Welcome to KhoojLocal</h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Sign in to your account or create a new one
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 w-fit mx-auto bg-transparent rounded-md">
            <button
              onClick={() => setTab("login")}
              className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium border ${
                tab === "login"
                  ? "bg-white border-black shadow-[0_0_0_3px_rgba(0,0,0,0.12)]"
                  : "bg-gray-100 border-gray-200 text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium border ${
                tab === "register"
                  ? "bg-white border-black shadow-[0_0_0_3px_rgba(0,0,0,0.12)]"
                  : "bg-gray-100 border-gray-200 text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-1">
                {tab === "login" ? "Login" : "Create an account"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                {tab === "login"
                  ? "Enter your credentials to access your account"
                  : "Fill out the fields below to create your account"}
              </p>

              {tab === "login" ? (
                <>
                  {loginError && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full border rounded-md px-10 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full border rounded-md px-10 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center text-gray-500"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:opacity-95 disabled:opacity-60"
                    >
                      {loading ? "Logging in..." : "Sign In"}
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <a href="#" className="text-sm text-gray-500 underline hover:text-black">Forgot your password?</a>
                  </div>

                  {/* Vendor Buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <p className="text-center text-sm text-gray-600 mb-3">Are you a business owner?</p>
                    
                    {/* Login as Vendor */}
                    <button
                      onClick={() => setShowVendorLogin(true)}
                      className="w-full bg-[#174f48] text-white py-3 rounded-md text-sm font-medium hover:bg-[#1a5c54] transition-all shadow-md"
                    >
                      Login as Vendor
                    </button>
                    
                    {/* Register as Vendor - Opens user type selection */}
                    <button
                      onClick={() => navigate("/register")}
                      className="w-full bg-white border-2 border-[#174f48] text-[#174f48] py-3 rounded-md text-sm font-medium hover:bg-[#174f48] hover:text-white transition-colors"
                    >
                      Register as Vendor
                    </button>
                  </div>
                </>
              ) : (
                /* Simplified Register form */
                <>
                  {regError && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{regError}</div>
                  )}
                  {regSuccess && (
                    <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded">{regSuccess}</div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full border rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                      {regFullName && regFullName.trim().length < 2 && (
                        <p className="text-xs text-red-500 mt-1">Please enter your full name (min 2 characters).</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full border rounded-md px-10 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                      {regEmail && !emailIsValid(regEmail) && (
                        <p className="text-xs text-red-500 mt-1">Please enter a valid email.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type={regShowPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create a password"
                          required
                          className="w-full border rounded-md px-10 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword(!regShowPassword)}
                          aria-label={regShowPassword ? "Hide password" : "Show password"}
                          className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center text-gray-500"
                        >
                          {regShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters.</p>
                      {!passwordIsStrong(regPassword) && regPassword.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">Password is too short.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type={regShowPassword ? "text" : "password"}
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          placeholder="Confirm your password"
                          required
                          className="w-full border rounded-md px-10 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                      {regConfirm && regConfirm !== regPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!registerFormIsValid() || regLoading}
                      className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:opacity-95 disabled:opacity-60"
                    >
                      {regLoading ? "Creating account..." : "Create Account"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Admin Login Button - Bottom Right */}
      <button
        onClick={() => navigate("/AdminLogin")}
        className="fixed bottom-6 right-6 bg-[#174f48] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-[#1a5c54] transition-all duration-200 flex items-center gap-2 text-sm font-medium z-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>Admin Login</span>
      </button>

      {/* Vendor Login Modal */}
      {showVendorLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowVendorLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Vendor Login</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your business dashboard</p>
            </div>

            {vendorError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{vendorError}</div>
            )}

            <form onSubmit={handleVendorLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#174f48] focus:border-transparent outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={vendorShowPassword ? "text" : "password"}
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#174f48] focus:border-transparent outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVendorShowPassword(!vendorShowPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {vendorShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={vendorLoading}
                className="w-full bg-[#174f48] text-white py-3 rounded-md text-sm font-medium hover:bg-[#1a5c54] disabled:opacity-60 transition-all"
              >
                {vendorLoading ? "Logging in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have a vendor account?{" "}
                <button
                  onClick={() => {
                    setShowVendorLogin(false);
                    navigate("/vendor-register");
                  }}
                  className="text-[#174f48] font-medium hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
