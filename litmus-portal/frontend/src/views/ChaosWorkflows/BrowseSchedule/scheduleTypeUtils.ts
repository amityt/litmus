const setScheduleType = (
  dayofMonth: string,
  month: string,
  dayOfWeek: string
) => {
  if (dayofMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'everyHr';
  }
  if (dayofMonth === '*' && month === '*' && dayOfWeek === '0-6') {
    return 'everyDay';
  }
  if (dayofMonth === '*' && month === '*' && dayOfWeek !== '0-6') {
    return 'everyWeek';
  }
  if (month === '*' && dayOfWeek === '*') {
    return 'everyMonth';
  }
  return '';
};

const getWeekDayName = (day: string) => {
  let dayOfWeek = '';
  switch (day) {
    case 'Mon':
      dayOfWeek = 'Monday';
      break;
    case 'Tue':
      dayOfWeek = 'Tuesday';
      break;
    case 'Wed':
      dayOfWeek = 'Wednesday';
      break;
    case 'Thu':
      dayOfWeek = 'Thursday';
      break;
    case 'Friday':
      dayOfWeek = 'Friday';
      break;
    case 'Sat':
      dayOfWeek = 'Saturday';
      break;
    case 'Sun':
      dayOfWeek = 'Sunday';
      break;
    default:
      dayOfWeek = 'Monday';
  }
  return dayOfWeek;
};

export { setScheduleType, getWeekDayName };
