import { i18n } from './i18n';

const ONE_DAY: number = 24 * 60 * 60 * 1000;
const ONE_HOUR: number = 60 * 60 * 1000;
const ONE_MIN: number = 60 * 1000;

const stripTimeFromDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // This will return the date in YYYY-MM-DD format
};

const getTodayAsNumber = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

const getTomorrowAsNumber = (): number => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

const getYesterdayAsNumber = (): number => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday.getTime();
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
  if (days !== 0) return `${days} ${i18n.t('common.time.days')}`;
  const mins = getMinsInInterval(interval);
  if (mins > 0) {
    return `${mins} ${i18n.t('common.time.mins')}`;
  } else {
    return ' < 1 ' + i18n.t('common.time.mins');
  }
};

export {
  ONE_DAY,
  ONE_HOUR,
  ONE_MIN,
  stripTimeFromDate,
  getTodayAsNumber,
  getYesterdayAsNumber,
  getTomorrowAsNumber,
  truncateTime,
  formatInterval,
};
