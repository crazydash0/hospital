import { useState, useEffect } from "react";
import api from "../api/axios";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function WeeklySchedule() {
  const [template, setTemplate] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [duration, setDuration] = useState("30");
  const [leaveDate, setLeaveDate] = useState("");
  const [message, setMessage] = useState("");

  async function fetchTemplate() {
    try {
      const response = await api.get("/appointments/weekly-template");
      setTemplate(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchTemplate();
  }, []);

  async function handleSaveDay(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/appointments/weekly-template", {
        dayOfWeek: Number(dayOfWeek),
        startHour: Number(startHour),
        endHour: Number(endHour),
        duration: Number(duration),
      });
      setMessage("Day saved successfully!");
      fetchTemplate();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

  async function handleAddLeave(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/appointments/leaves", { date: leaveDate });
      setMessage("Leave added successfully!");
      setLeaveDate("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

  async function handleGenerateWeek() {
    setMessage("");

    try {
      const response = await api.post("/appointments/generate-week");
      setMessage(
        `Created ${response.data.totalCreated} slots. Skipped: ${response.data.skippedDays.join(", ") || "none"}`
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <h1>Weekly Schedule</h1>

      <h2>Current Schedule</h2>
      {template.length === 0 ? (
        <p>No days set yet.</p>
      ) : (
        template.map((day) => (
          <p key={day.id}>
            {DAYS[day.dayOfWeek]}: {day.startHour}:00 - {day.endHour}:00 ({day.duration} min)
          </p>
        ))
      )}

      <h2>Set/Update a Day</h2>
      <form onSubmit={handleSaveDay}>
        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
          {DAYS.map((name, index) => (
            <option key={index} value={index}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Start Hour"
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
        />
        <input
          type="number"
          placeholder="End Hour"
          value={endHour}
          onChange={(e) => setEndHour(e.target.value)}
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button type="submit">Save Day</button>
      </form>

      <h2>Add a Leave Day</h2>
      <form onSubmit={handleAddLeave}>
        <input
          type="date"
          value={leaveDate}
          onChange={(e) => setLeaveDate(e.target.value)}
        />
        <button type="submit">Add Leave</button>
      </form>

      <h2>Generate Next Week</h2>
      <button onClick={handleGenerateWeek}>Generate Week</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default WeeklySchedule;