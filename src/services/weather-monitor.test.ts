import assert from "node:assert/strict";
import test from "node:test";

import { meetsSkiConditions } from "./weather-monitor.js";

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
