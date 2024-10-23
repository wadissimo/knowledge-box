const stripTimeFromDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // This will return the date in YYYY-MM-DD format
};
const getTomorrowAsNumber = (): number => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

const truncateTime = (date: Date): number => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate.getTime();
};

export { stripTimeFromDate, getTomorrowAsNumber, truncateTime };
