import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { Activity, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Update field and clear its error at the same time
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name is required";
    if (!form.email || !form.email.includes("@")) e.email = "Valid email is required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setLoading(true);
      setApiError("");
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/");
    } catch (err) {
      setApiError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Apollo<span className="text-blue-600">Care</span>
          </h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* API Error */}
          {apiError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  errors.name ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="text"
                placeholder="you@example.com"
                className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  errors.email ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className={`h-11 w-full rounded-lg border px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.password ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  className={`h-11 w-full rounded-lg border px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full h-11 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}