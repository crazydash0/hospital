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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/book"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-records"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <MyMedicalRecords />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-slots"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <CreateSlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly-schedule"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <WeeklySchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-appointments"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
