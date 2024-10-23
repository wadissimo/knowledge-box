import { i18n } from "./i18n";

const ONE_DAY: number = 24 * 60 * 60 * 1000;
const ONE_MIN: number = 60 * 1000;

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

const getDaysInInterval = (interval: number): number => {
  return Math.floor(interval / ONE_DAY);
};

const getMinsInInterval = (interval: number): number => {
  return Math.floor(interval / ONE_MIN);
};

const formatInterval = (interval: number): string => {
  const days = getDaysInInterval(interval);
  if (days !== 0) return `${days} ${i18n.t("common.time.days")}`;
  const mins = getMinsInInterval(interval);
  if (mins > 0) {
    return `${mins} ${i18n.t("common.time.mins")}`;
  } else {
    return " < 1 " + i18n.t("common.time.mins");
  }
};

export { stripTimeFromDate, getTomorrowAsNumber, truncateTime, formatInterval };
