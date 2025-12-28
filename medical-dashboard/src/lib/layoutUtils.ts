import { CalendarEvent } from "@/types";

/**
 * Calculates the visual layout (top, height, left, width) for calendar events
 * to handle overlapping schedules (side-by-side view).
 */
export const calculateLayout = (events: CalendarEvent[]) => {
  // 1. Sort events by start time, then by duration (longest first)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.startHour === b.startHour && a.startMinute === b.startMinute) {
      return b.duration - a.duration;
    }
    const aTime = a.startHour * 60 + a.startMinute;
    const bTime = b.startHour * 60 + b.startMinute;
    return aTime - bTime;
  });

  const columns: CalendarEvent[][] = [];

  // 2. Group overlapping events
  sortedEvents.forEach((event) => {
    let placed = false;

    // Try to place event in an existing column where it doesn't overlap
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const lastEventInCol = col[col.length - 1];
      
      const lastEventEnd = lastEventInCol.startHour * 60 + lastEventInCol.startMinute + lastEventInCol.duration;
      const currentEventStart = event.startHour * 60 + event.startMinute;

      if (currentEventStart >= lastEventEnd) {
        col.push(event);
        placed = true;
        break;
      }
    }

    // If it collides with all existing columns, start a new column
    if (!placed) {
      columns.push([event]);
    }
  });

  // 3. Flatten and assign styles
  // If we have 3 columns, each gets 33% width.
  const result: (CalendarEvent & { style: React.CSSProperties })[] = [];
  const totalColumns = columns.length;

  columns.forEach((col, colIndex) => {
    col.forEach((event) => {
      const startMinutes = (event.startHour - 7) * 60 + event.startMinute; // 7 is start of day offset
      const top = (startMinutes / 60) * 80; // 80px per hour
      const height = (event.duration / 60) * 80;
      
      const widthPercent = 100 / totalColumns;
      const leftPercent = colIndex * widthPercent;

      result.push({
        ...event,
        style: {
          top: `${top}px`,
          height: `${height}px`,
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          position: 'absolute',
        }
      });
    });
  });

  return result;
};