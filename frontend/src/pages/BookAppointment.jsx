import { useState, useEffect } from "react";
import api from "../api/axios";

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await api.get("/doctors");
        setDoctors(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) return;

    async function fetchSlots() {
      try {
        const response = await api.get(`/appointments/doctor/${selectedDoctorId}/slots`);
        setSlots(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchSlots();
  }, [selectedDoctorId]);

  return (
    <div>
      <h1>Book an Appointment</h1>

      {doctors.map((doctor) => (
        <div key={doctor.id}>
          <p>{doctor.fullName}</p>
          <button onClick={() => setSelectedDoctorId(doctor.id)}>Select</button>
        </div>
      ))}

      <h2>Available Slots</h2>
      {message && <p>{message}</p>}
      {slots.map((slot) => (
        <div key={slot.id}>
          <span>{new Date(slot.startTime).toLocaleString()}</span>
          <button onClick={() => handleBook(slot.id)}>Book</button>
        </div>
      ))}
    </div>
  );
  async function handleBook(slotId) {
    setMessage("");
    try {
      await api.post("/appointments", { slotId });
      setMessage("Appointment booked successfully!");
      const response = await api.get(`/appointments/doctor/${selectedDoctorId}/slots`);
      setSlots(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }
}

export default BookAppointment;