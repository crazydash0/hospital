const STORAGE_KEY = "lastSeenAppointmentId";

export function getLastSeenAppointmentId() {
  return Number(localStorage.getItem(STORAGE_KEY) || 0);
}

export function setLastSeenAppointmentId(id) {
  localStorage.setItem(STORAGE_KEY, String(id));
}
