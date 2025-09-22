// Utility function to format time to 12-hour format with AM/PM
export const formatTime = (timeString) => {
  if (!timeString) return timeString;

  try {
    // Handle time in HH:MM format
    const [hours, minutes] = timeString.split(":");
    const hour24 = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    if (isNaN(hour24) || isNaN(minute)) return timeString;

    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const formattedMinutes = minute.toString().padStart(2, "0");

    return `${hour12}:${formattedMinutes} ${ampm}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

// Utility function to format date in a readable format
export const formatEventDate = (dateString) => {
  if (!dateString) return dateString;

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
