import assert from "node:assert/strict";
import test from "node:test";

import type { Location } from "../data/locations.js";
import { formatLocationWeatherMessage } from "./weather.js";

const location: Location = {
  command: "bialka",
  name: "Białka Tatrzańska",
  latitude: 49.389528,
  longitude: 20.099056,
};

test("formats the location heading without optional links", () => {
  const message = formatLocationWeatherMessage(location, "Pogoda");

  assert.match(message, /🏔️ Białka Tatrzańska/);
  assert.doesNotMatch(message, /Карта трас|Камери|undefined/);
});

test("adds only the optional links that are provided", () => {
  const message = formatLocationWeatherMessage(
    {
      ...location,
      routesMap: "https://example.com/routes",
    },
    "Pogoda",
  );

  assert.match(message, /<a href="https:\/\/example\.com\/routes">🗺 Карта трас<\/a>/);
  assert.doesNotMatch(message, /Камери/);
});

test("adds the cameras link when provided", () => {
  const message = formatLocationWeatherMessage(
    {
      ...location,
      cameras: "https://example.com/cameras",
    },
    "Pogoda",
  );

  assert.match(message, /<a href="https:\/\/example\.com\/cameras">📹 Камери<\/a>/);
  assert.doesNotMatch(message, /Карта трас/);
});
