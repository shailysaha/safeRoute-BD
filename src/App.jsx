import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import Reports from "./pages/Reports";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import ExploreRoutes from "./pages/ExploreRoutes";
import Profile from "./pages/Profile";
import MyReports from "./pages/MyReports";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore-routes" element={<ExploreRoutes />} />
        <Route path="/map" element={<MapPage hideSidebar={true} />} />

        {/* Protected Routes */}
        <Route
          path="/report-area"
          element={
            <ProtectedRoute>
              <MapPage hideSidebar={false} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;