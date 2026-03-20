//run 3
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route: pumunta sa login */}
        <Route path="/" element={<Login />} />

        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard route: kung may user sa localStorage, ipakita dashboard, kung wala redirect sa login */}
        <Route
          path="/dashboard"
          element={
            localStorage.getItem("user") ? <Dashboard /> : <Navigate to="/login" />
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;