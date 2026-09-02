import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import ApplicationDetails from "./pages/ApplicationDetails";
import ArchivedApplications from "./pages/ArchivedApplications";
import ProtectedRoute from "./components/ProtectedRoute";
import ReviewApplication from "./pages/ReviewApplication";
import MyReviews from "./pages/MyReviews";
import Alerts from "./pages/Alerts";
import Conflicts from "./pages/Conflicts";
import BulkAssignment from "./pages/BulkAssignment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
          <Route path="/archived" element={<ArchivedApplications />} />
          <Route path="/reviews" element={<MyReviews/>} />
          <Route path="/reviews/:id" element={<ReviewApplication />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/conflicts" element={<Conflicts />} />
          <Route path="/bulk-assignment" element={<BulkAssignment />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
