export async function getWeather(
  latitude: number,
  longitude: number
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
  const newSnowToday = daily.snowfall_sum?.[0] ?? 0;

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
    snowfall: number
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
    index: number,
    snowToday?: number
  ): string {
    const temperature = hourly.temperature_2m[index];
    const precipitation = hourly.precipitation[index];
    const rain = hourly.rain[index];
    const snowfall = hourly.snowfall[index];

    return `
  🌡 Температура: ${temperature}°C
  🌧 Опади: ${getPrecipitationText(
      precipitation,
      rain,
      snowfall
    )}
  ❄️ Новий сніг за добу: ${snowToday || "0"} см
  `.trim();
  }

  const nowBlock = buildWeatherBlock(
    hourly.time.indexOf(current.time),
    newSnowToday
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

  const formatHour = (date: Date) =>
    date.toISOString().slice(0, 13) + ":00";

  const tomorrowIndex = hourly.time.indexOf(
    formatHour(tomorrow11)
  );

  const dayAfterTomorrowIndex = hourly.time.indexOf(
    formatHour(dayAfterTomorrow11)
  );

  const fridayIndex = hourly.time.indexOf(
    formatHour(friday11)
  );

  const fridayLabel = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(friday11);

  return `
<b>Станом на ${observationTime}</b>
${nowBlock}

<b>Завтра 11:00</b>
${buildWeatherBlock(tomorrowIndex)}

<b>Післязавтра 11:00</b>
${buildWeatherBlock(dayAfterTomorrowIndex)}

<b>${fridayLabel}, 11:00</b>
${buildWeatherBlock(fridayIndex)}
    `.trim();
};
