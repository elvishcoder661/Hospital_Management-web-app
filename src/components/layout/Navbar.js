import { Link, useLocation } from "wouter";
import { Activity, Menu, X, User, Calendar, Stethoscope, Building2, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const [location, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Activity },
    { name: "Doctors", href: "/doctors", icon: Stethoscope },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Patients", href: "/patients", icon: User },
    { name: "Departments", href: "/departments", icon: Building2 },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Health<span className="text-blue-600">Care</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location === link.href ? "text-blue-600" : "text-gray-500"
                }`}>
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Sign In</button>
                </Link>
                <Link href="/register">
                  <button className="rounded-full px-6 py-2 bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700 transition-colors">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b shadow-lg overflow-hidden">
            <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      location === link.href ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
                    }`}>
                    <Icon className="h-5 w-5" />{link.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Signed in as <span className="font-semibold text-gray-800">{user.name}</span>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full rounded-xl border border-gray-200 text-gray-700 py-2 font-medium text-sm">Sign In</button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full rounded-xl bg-blue-600 text-white py-2 font-medium text-sm">Get Started</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}