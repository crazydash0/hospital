import { useState, useEffect } from "react";
import api from "../api/axios";

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [slots, setSlots] = useState([]);

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
      {slots.map((slot) => (
        <div key={slot.id}>
           <p>{new Date(slot.startTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default BookAppointment;