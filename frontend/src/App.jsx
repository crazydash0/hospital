import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/navbar";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import BookAppointment from "./pages/BookAppointment";
import CreateSlots from "./pages/CreateSlots";
import WeeklySchedule from "./pages/WeeklySchedule";
import MyAppointments from "./pages/MyAppointments";
import DoctorAppointments from "./pages/DoctorAppointments";
import MyMedicalRecords from "./pages/MyMedicalRecords";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import MyPatients from "./pages/MyPatients";
import PatientProfile from "./pages/PatientProfile";
import DoctorEditProfile from "./pages/DoctorEditProfile";
import DoctorReviews from "./pages/DoctorReviews";
import ClinicOwnerDashboard from "./pages/ClinicOwnerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/book" element={<ProtectedRoute allowedRoles={["PATIENT"]}><BookAppointment /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute allowedRoles={["PATIENT"]}><MyAppointments /></ProtectedRoute>} />
        <Route path="/my-records" element={<ProtectedRoute allowedRoles={["PATIENT"]}><MyMedicalRecords /></ProtectedRoute>} />
        <Route path="/create-slots" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><CreateSlots /></ProtectedRoute>} />
        <Route path="/weekly-schedule" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><WeeklySchedule /></ProtectedRoute>} />
        <Route path="/doctor-appointments" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><MyPatients /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><PatientProfile /></ProtectedRoute>} />
        <Route path="/my-profile" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><DoctorEditProfile /></ProtectedRoute>} />
        <Route path="/my-reviews" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><DoctorReviews /></ProtectedRoute>} />
        <Route path="/clinic-dashboard" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><ClinicOwnerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
