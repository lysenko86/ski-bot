import type { Location } from "../data/locations.js";

export type CurrentWeatherConditions = {
  temperature: number | null;
  precipitation: number | null;
  rain: number | null;
  showers: number | null;
  snowfall: number | null;
  snowDepth: number | null;
};

export type WeatherReport = {
  message: string;
  current: CurrentWeatherConditions;
  periods: {
    label: string;
    conditions: CurrentWeatherConditions;
    message: string;
  }[];
};

export function formatLocationWeatherMessage(
  location: Location,
  weather: string,
): string {
  const links = [
    location.routesMap
      ? `<a href="${location.routesMap}">🗺 Карта трас</a>`
      : null,
    location.cameras
      ? `<a href="${location.cameras}">📹 Камери</a>`
      : null,
  ].filter((link) => link !== null);
  const locationHeading = `<a href="https://maps.google.com/?q=${location.latitude},${location.longitude}"><b>🏔️ ${location.name}</b></a>`;

  return `
${locationHeading}${links.length > 0 ? `, ${links.join(", ")}` : ""}

${weather}
  `.trim();
}

export async function getWeatherReport(
  latitude: number,
  longitude: number,
): Promise<WeatherReport> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    "&current=temperature_2m,precipitation,rain,showers,snowfall,snow_depth" +
    "&hourly=temperature_2m,precipitation,rain,showers,snowfall,snow_depth" +
    "&daily=snowfall_sum" +
    "&forecast_days=7" +
    "&timezone=Europe/Warsaw";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Не вдалося отримати погоду");
  }

  const data = await response.json();

  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  const todaySnow = daily.snowfall_sum?.[0] ?? 0;
  const tomorrowSnow = daily.snowfall_sum?.[1] ?? 0;
  const dayAfterTomorrowSnow = daily.snowfall_sum?.[2] ?? 0;

  const observationTime = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(current.time));

  function getPrecipitationText(
    precipitation: number,
    rain: number,
    snowfall: number,
  ): string {
    if (snowfall > 0) {
      return `Сніг (${snowfall} мм)`;
    }

    if (rain > 0) {
      return `Дощ (${rain} мм)`;
    }

    if (precipitation > 0) {
      return `${precipitation} мм`;
    }

    return "Немає";
  }

  function getSnowDepthText(snowDepth: number | null | undefined): string {
    if (snowDepth == null) {
      return "Немає даних";
    }

    return `${Math.round(snowDepth * 100)} см`;
  }

  function buildWeatherBlock(
    temperature: number,
    precipitation: number,
    rain: number,
    snowfall: number,
    snowDepth: number | null | undefined,
    newSnow: number,
  ): string {
    return `
🌡 Температура: ${temperature}°C
🌧 Опади: ${getPrecipitationText(precipitation, rain, snowfall)}
❄️ Сніговий покрив: ${getSnowDepthText(snowDepth)}
🌨️ Новий сніг за добу: ${newSnow} см
`.trim();
  }

  function buildHourlyWeatherBlock(index: number, newSnow: number): string {
    return buildWeatherBlock(
      hourly.temperature_2m[index],
      hourly.precipitation[index],
      hourly.rain[index],
      hourly.snowfall[index],
      hourly.snow_depth[index],
      newSnow,
    );
  }

  function getHourlyConditions(index: number): CurrentWeatherConditions {
    return {
      temperature: hourly.temperature_2m[index] ?? null,
      precipitation: hourly.precipitation[index] ?? null,
      rain: hourly.rain[index] ?? null,
      showers: hourly.showers[index] ?? null,
      snowfall: hourly.snowfall[index] ?? null,
      snowDepth: hourly.snow_depth[index] ?? null,
    };
  }

  const nowBlock = buildWeatherBlock(
    current.temperature_2m,
    current.precipitation,
    current.rain,
    current.snowfall,
    current.snow_depth,
    todaySnow,
  );

  const tomorrow11 = new Date();
  tomorrow11.setDate(tomorrow11.getDate() + 1);
  tomorrow11.setHours(11, 0, 0, 0);

  const dayAfterTomorrow11 = new Date();
  dayAfterTomorrow11.setDate(dayAfterTomorrow11.getDate() + 2);
  dayAfterTomorrow11.setHours(11, 0, 0, 0);

  const inFourDays11 = new Date();
  inFourDays11.setDate(inFourDays11.getDate() + 4);
  inFourDays11.setHours(11, 0, 0, 0);

  const getHourlyIndex = (date: Date) =>
    hourly.time.indexOf(`${date.toISOString().slice(0, 13)}:00`);

  const tomorrowIndex = getHourlyIndex(tomorrow11);
  const dayAfterTomorrowIndex = getHourlyIndex(dayAfterTomorrow11);
  const inFourDaysIndex = getHourlyIndex(inFourDays11);

  const inFourDaysLabel = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(inFourDays11);

  const inFourDaysDate = inFourDays11.toISOString().slice(0, 10);
  const inFourDaysSnowIndex = daily.time.indexOf(inFourDaysDate);
  const inFourDaysSnow = daily.snowfall_sum?.[inFourDaysSnowIndex] ?? 0;

  const tomorrowBlock = buildHourlyWeatherBlock(tomorrowIndex, tomorrowSnow);
  const dayAfterTomorrowBlock = buildHourlyWeatherBlock(
    dayAfterTomorrowIndex,
    dayAfterTomorrowSnow,
  );
  const inFourDaysBlock = buildHourlyWeatherBlock(
    inFourDaysIndex,
    inFourDaysSnow,
  );

  const currentConditions: CurrentWeatherConditions = {
    temperature: current.temperature_2m ?? null,
    precipitation: current.precipitation ?? null,
    rain: current.rain ?? null,
    showers: current.showers ?? null,
    snowfall: current.snowfall ?? null,
    snowDepth: current.snow_depth ?? null,
  };
  const periods = [
    {
      label: `Станом на ${observationTime}`,
      conditions: currentConditions,
      message: `<b>Станом на ${observationTime}</b>\n${nowBlock}`,
    },
    {
      label: "Завтра 11:00",
      conditions: getHourlyConditions(tomorrowIndex),
      message: `<b>Завтра 11:00</b>\n${tomorrowBlock}`,
    },
    {
      label: "Післязавтра 11:00",
      conditions: getHourlyConditions(dayAfterTomorrowIndex),
      message: `<b>Післязавтра 11:00</b>\n${dayAfterTomorrowBlock}`,
    },
    {
      label: `${inFourDaysLabel}, 11:00`,
      conditions: getHourlyConditions(inFourDaysIndex),
      message: `<b>${inFourDaysLabel}, 11:00</b>\n${inFourDaysBlock}`,
    },
  ];
  const message = periods.map((period) => period.message).join("\n\n");

  return {
    message,
    current: currentConditions,
    periods,
  };
}
