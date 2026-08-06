import { useState } from "react";
import api from "../api/axios";

function CreateSlots() {
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [duration, setDuration] = useState("30");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/appointments/slots", {
        date,
        startHour: Number(startHour),
        endHour: Number(endHour),
        duration: Number(duration),
      });
      setMessage("Slots created successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <h1>Set Your Available Hours</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Start Hour (e.g. 9)"
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
        />
        <input
          type="number"
          placeholder="End Hour (e.g. 17)"
          value={endHour}
          onChange={(e) => setEndHour(e.target.value)}
        />

        <input
          type="number"
          placeholder="Duration in minutes"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="5"
          max="240"
          list="duration-options"
        />
        <datalist id="duration-options">
          <option value="15" />
          <option value="30" />
          <option value="45" />
          <option value="60" />
        </datalist>

        <button type="submit">Create Slots</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateSlots;