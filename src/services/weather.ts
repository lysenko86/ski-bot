export async function getWeather(
  latitude: number,
  longitude: number,
): Promise<string> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    "&current=temperature_2m,precipitation,rain,snowfall" +
    "&hourly=temperature_2m,precipitation,rain,snowfall" +
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

  function buildWeatherBlock(
    temperature: number,
    precipitation: number,
    rain: number,
    snowfall: number,
    newSnow: number,
  ): string {
    return `
🌡 Температура: ${temperature}°C
🌧 Опади: ${getPrecipitationText(precipitation, rain, snowfall)}
❄️ Новий сніг за добу: ${newSnow} см
`.trim();
  }

  function buildHourlyWeatherBlock(index: number, newSnow: number): string {
    return buildWeatherBlock(
      hourly.temperature_2m[index],
      hourly.precipitation[index],
      hourly.rain[index],
      hourly.snowfall[index],
      newSnow,
    );
  }

  const nowBlock = buildWeatherBlock(
    current.temperature_2m,
    current.precipitation,
    current.rain,
    current.snowfall,
    todaySnow,
  );

  const tomorrow11 = new Date();
  tomorrow11.setDate(tomorrow11.getDate() + 1);
  tomorrow11.setHours(11, 0, 0, 0);

  const dayAfterTomorrow11 = new Date();
  dayAfterTomorrow11.setDate(dayAfterTomorrow11.getDate() + 2);
  dayAfterTomorrow11.setHours(11, 0, 0, 0);

  const fourthDay11 = new Date();
  fourthDay11.setDate(fourthDay11.getDate() + 3);
  fourthDay11.setHours(11, 0, 0, 0);

  const getHourlyIndex = (date: Date) =>
    hourly.time.indexOf(`${date.toISOString().slice(0, 13)}:00`);

  const tomorrowIndex = getHourlyIndex(tomorrow11);
  const dayAfterTomorrowIndex = getHourlyIndex(dayAfterTomorrow11);
  const fourthDayIndex = getHourlyIndex(fourthDay11);

  const fourthDayLabel = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fourthDay11);

  const fourthDayDate = fourthDay11.toISOString().slice(0, 10);
  const fourthDaySnowIndex = daily.time.indexOf(fourthDayDate);
  const fourthDaySnow = daily.snowfall_sum?.[fourthDaySnowIndex] ?? 0;

  const tomorrowBlock = buildHourlyWeatherBlock(tomorrowIndex, tomorrowSnow);
  const dayAfterTomorrowBlock = buildHourlyWeatherBlock(
    dayAfterTomorrowIndex,
    dayAfterTomorrowSnow,
  );
  const fourthDayBlock = buildHourlyWeatherBlock(fourthDayIndex, fourthDaySnow);

  return `
<b>Станом на ${observationTime}</b>
${nowBlock}

<b>Завтра 11:00</b>
${tomorrowBlock}

<b>Післязавтра 11:00</b>
${dayAfterTomorrowBlock}

<b>${fourthDayLabel}, 11:00</b>
${fourthDayBlock}
`.trim();
}
