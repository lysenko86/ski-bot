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

  const friday11 = new Date();

  while (friday11.getDay() !== 5) {
    friday11.setDate(friday11.getDate() + 1);
  }

  friday11.setHours(11, 0, 0, 0);

  const getHourlyIndex = (date: Date) =>
    hourly.time.indexOf(`${date.toISOString().slice(0, 13)}:00`);

  const tomorrowIndex = getHourlyIndex(tomorrow11);
  const dayAfterTomorrowIndex = getHourlyIndex(dayAfterTomorrow11);
  const fridayIndex = getHourlyIndex(friday11);

  const fridayLabel = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(friday11);

  const fridaySnowIndex = Math.min(
    daily.snowfall_sum.length - 1,
    Math.ceil(
      (friday11.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const fridaySnow = daily.snowfall_sum?.[fridaySnowIndex] ?? 0;

  const tomorrowBlock = buildHourlyWeatherBlock(tomorrowIndex, tomorrowSnow);
  const dayAfterTomorrowBlock = buildHourlyWeatherBlock(
    dayAfterTomorrowIndex,
    dayAfterTomorrowSnow,
  );
  const fridayBlock = buildHourlyWeatherBlock(fridayIndex, fridaySnow);

  return `
<b>Станом на ${observationTime}</b>
${nowBlock}

<b>Завтра 11:00</b>
${tomorrowBlock}

<b>Післязавтра 11:00</b>
${dayAfterTomorrowBlock}

<b>${fridayLabel}, 11:00</b>
${fridayBlock}
`.trim();
}
