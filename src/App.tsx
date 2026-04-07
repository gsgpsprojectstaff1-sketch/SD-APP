//run 3
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard1 from "./pages/Dashboard1";
import UnregisterSourceDestination from "./pages/UnregisterSourceDestination";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
          path="/dashboard1"
          element={
            localStorage.getItem("user") ? (
              <ErrorBoundary>
                <Dashboard1 />
              </ErrorBoundary>
            ) : <Navigate to="/login" />
          }
        />

        {/* Unregister Source Destination page */}
        <Route
          path="/unregister-source-destination"
          element={
            localStorage.getItem("user") ? (
              <ErrorBoundary>
                <UnregisterSourceDestination />
              </ErrorBoundary>
            ) : <Navigate to="/login" />
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;