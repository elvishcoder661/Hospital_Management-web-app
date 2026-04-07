import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointment";
import Patients from "./pages/Patients";
import Departments from "./pages/Departments";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected routes — redirect to /login if not logged in */}
      <Route path="/">
        <ProtectedRoute><Home /></ProtectedRoute>
      </Route>
      <Route path="/doctors">
        <ProtectedRoute><Doctors /></ProtectedRoute>
      </Route>
      <Route path="/appointments">
        <ProtectedRoute><Appointments /></ProtectedRoute>
      </Route>
      <Route path="/patients">
        <ProtectedRoute><Patients /></ProtectedRoute>
      </Route>
      <Route path="/departments">
        <ProtectedRoute><Departments /></ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route>
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-gray-700">404 - Page Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}