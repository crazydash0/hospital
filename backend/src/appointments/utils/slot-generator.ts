export interface GeneratedSlot {
  doctorId: number;
  startTime: Date;
  endTime: Date;
}

export function generateSlots(
  doctorId: number,
  date: Date,
  startHour: number,
  endHour: number,
  slotMinutes = 30,
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];

  const start = new Date(date);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);

  while (start < end) {
    const slotStart = new Date(start);
    const slotEnd = new Date(start);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes);

    slots.push({
      doctorId,
      startTime: slotStart,
      endTime: slotEnd,
    });

    start.setMinutes(start.getMinutes() + slotMinutes);
  }

  return slots;
}
