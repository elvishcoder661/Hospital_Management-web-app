import { useAuth } from "../context/AuthContext";
import { Redirect } from "wouter";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking localStorage token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) return <Redirect to="/login" />;

  return children;
}