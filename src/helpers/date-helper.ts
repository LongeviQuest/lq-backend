import { DateTime, Interval } from 'luxon';
import { Human } from '../models/Human';

export const calculateAgeInYearsAndDays = (
  startDate: string,
  endDate: string,
  timeZone?: string
) => {
  const { interval, startDateTime, endDateTime } = getInterval(
    startDate,
    endDate,
    timeZone
  );

  const years = Math.floor(interval.toDuration(['years']).years);
  const intermediateDate = startDateTime.plus({ years });
  const remainingInterval = Interval.fromDateTimes(
    intermediateDate,
    endDateTime
  );
  const days = Math.floor(remainingInterval.toDuration(['days']).days);

  return { years: years, days: days };
};

const getInterval = (startDate: string, endDate: string, timeZone?: string) => {
  const offset = DateTime.fromISO(endDate, { zone: timeZone }).offset;
  const startDateTime = DateTime.fromISO(startDate)
    .setZone('UTC')
    .plus({ minutes: offset });
  const endDateTime = DateTime.fromISO(endDate)
    .setZone('UTC')
    .plus({ minutes: offset });

  const interval = Interval.fromDateTimes(startDateTime, endDateTime);

  return { interval, startDateTime, endDateTime };
};

export const calculateAgeInMilliseconds = (
  startDate: string,
  endDate: string,
  timeZone?: string
) => {
  const { interval } = getInterval(startDate, endDate, timeZone);
  const milliseconds = interval.toDuration(['milliseconds']).milliseconds;

  return milliseconds;
};

export const parseDateString = (inputDate: string | Date) => {
  const ddMmYyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const date = inputDate.toString();

  let isoString: string = '';

  const match = date.match(ddMmYyyyRegex);
  if (match) {
    const day = match[1];
    const month = match[2];
    const year = match[3];

    isoString = `${year}-${month}-${day}T00:00:00.000Z`;
  } else {
    const formattedDate = new Date(date);
    if (!isNaN(formattedDate.getTime())) {
      isoString = formattedDate.toISOString();
    }
  }

  return isoString;
};

export const getAgeObject = (human: Human) => {
  const personalInfo = human.acf.personal_information;
  const timeZones = human.acf.time_zones;

  const startDate = parseDateString(personalInfo.birth);
  const endDate = personalInfo.date_of_death
    ? new Date(personalInfo.date_of_death).toISOString()
    : new Date().toISOString();
  const timeZoneForCalc =
    timeZones?.death_place?.timeZoneId ?? timeZones?.residence?.timeZoneId;

  const timeComponents = calculateAgeInYearsAndDays(
    startDate,
    endDate,
    timeZoneForCalc
  );

  const totalMilliseconds = calculateAgeInMilliseconds(
    startDate,
    endDate,
    timeZoneForCalc
  );

  const ageObject = {
    time_components: timeComponents,
    total_milliseconds: totalMilliseconds,
  };

  return ageObject;
};
