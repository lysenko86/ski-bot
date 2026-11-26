import assert from "node:assert/strict";
import test from "node:test";

import {
  getSkiConditionPeriods,
  meetsSkiConditions,
} from "./weather-monitor.js";
import type { WeatherReport } from "./weather.js";

test("alerts for snowy conditions when rain and showers are unavailable", () => {
  assert.equal(
    meetsSkiConditions({
      temperature: -4,
      precipitation: 0.14,
      rain: 0,
      showers: null,
      snowfall: 0.14,
      snowDepth: 0.07,
    }),
    true,
  );
});

test("does not alert when liquid rain is present with snowfall", () => {
  assert.equal(
    meetsSkiConditions({
      temperature: -4,
      precipitation: 0.14,
      rain: 0.1,
      showers: 0,
      snowfall: 0.14,
      snowDepth: 0.07,
    }),
    false,
  );
});

test("alerts for a qualifying forecast even when current conditions do not qualify", () => {
  const report: WeatherReport = {
    message: "",
    current: {
      temperature: -2,
      precipitation: 0,
      rain: 0,
      showers: 0,
      snowfall: 0,
      snowDepth: 0.03,
    },
    periods: [
      {
        label: "Післязавтра 11:00",
        conditions: {
          temperature: -5.1,
          precipitation: 0,
          rain: 0,
          showers: 0,
          snowfall: 0,
          snowDepth: 0.08,
        },
        message: "<b>Післязавтра 11:00</b>\nweather block",
      },
    ],
  };

  assert.deepEqual(
    getSkiConditionPeriods(report).map((period) => period.label),
    ["Післязавтра 11:00"],
  );
});

test("keeps the alert message limited to the matching period", () => {
  const report: WeatherReport = {
    message: "all four periods",
    current: {
      temperature: -2,
      precipitation: 0,
      rain: 0,
      showers: 0,
      snowfall: 0,
      snowDepth: 0.03,
    },
    periods: [
      {
        label: "Післязавтра 11:00",
        conditions: {
          temperature: -5.1,
          precipitation: 0,
          rain: 0,
          showers: 0,
          snowfall: 0,
          snowDepth: 0.08,
        },
        message: "<b>Післязавтра 11:00</b>\n8 см снігу",
      },
    ],
  };

  const [matchingPeriod] = getSkiConditionPeriods(report);

  assert.equal(matchingPeriod?.message, "<b>Післязавтра 11:00</b>\n8 см снігу");
  assert.notEqual(matchingPeriod?.message, report.message);
});
