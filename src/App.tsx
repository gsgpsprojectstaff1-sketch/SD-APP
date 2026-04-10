//run 3
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard1 from "./pages/Dashboard1";
import UnregisterSourceDestination from "./pages/UnregisterSourceDestination";
import { ErrorBoundary } from "./components/ErrorBoundary";
import TripsDetails from "./pages/TripsDetails";
import FCTDetails from "./pages/FCTDetails";
import { BadgeProvider, useBadgeCounts } from "./AppBadgeContext";


function AppWithBadges() {
  const { unregisterCount, tripCount, fctCount } = useBadgeCounts();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard1"
          element={
            localStorage.getItem("user") ? (
              <ErrorBoundary>
                <Dashboard1 unregisterCount={unregisterCount} tripCount={tripCount} fctCount={fctCount} />
              </ErrorBoundary>
            ) : <Navigate to="/login" />
          }
        />
        <Route
          path="/unregister-source-destination"
          element={
            localStorage.getItem("user") ? (
              <ErrorBoundary>
                <UnregisterSourceDestination unregisterCount={unregisterCount} tripCount={tripCount} fctCount={fctCount} />
              </ErrorBoundary>
            ) : <Navigate to="/login" />
          }
        />
        <Route
          path="/trips-details"
          element={
            localStorage.getItem("user") ? (
              <ErrorBoundary>
                <TripsDetails unregisterCount={unregisterCount} tripCount={tripCount} fctCount={fctCount} />
              </ErrorBoundary>
            ) : <Navigate to="/login" />
          }
        />
        <Route
          path="/fct-details"
          element={
            localStorage.getItem("user") ? (
              <ErrorBoundary>
                <FCTDetails unregisterCount={unregisterCount} tripCount={tripCount} fctCount={fctCount} />
              </ErrorBoundary>
            ) : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <BadgeProvider>
      <AppWithBadges />
    </BadgeProvider>
  );
}

export default App;