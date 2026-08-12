import { useState, useEffect } from "react";
import api from "../api/axios";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  async function fetchAppointments() {
    try {
      const response = await api.get("/appointments/patient");
      setAppointments(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function handleCancel(appointmentId) {
    setMessage("");
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      setMessage("Appointment cancelled.");
      fetchAppointments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <h1>My Appointments</h1>
      {message && <p>{message}</p>}

      {appointments.length === 0 ? (
        <p>You have no appointments yet.</p>
      ) : (
        appointments.map((appt) => (
          <div key={appt.id}>
            <p>Doctor: {appt.doctor.fullName}</p>
            <p>Date: {new Date(appt.slot.startTime).toLocaleString()}</p>
            <p>Status: {appt.status}</p>
            {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
              <button onClick={() => handleCancel(appt.id)}>Cancel</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyAppointments;