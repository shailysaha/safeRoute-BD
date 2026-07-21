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

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/explore-routes" element={<ExploreRoutes />} />
        <Route path="/Profile" element={<Profile />} />
       


        {/* Protected Routes */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
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
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
         path="/explore"
         element={<ExploreRoutes />}
        />

    

      </Routes>
    </BrowserRouter>
  );
}

export default App;