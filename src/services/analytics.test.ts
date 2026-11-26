import assert from "node:assert/strict";
import test from "node:test";

import { formatAnalyticsReport } from "./analytics.js";

test("reports today, rolling seven-day, and rolling thirty-day command counts", () => {
  const report = formatAnalyticsReport(
    {
      "2026-11-26": { start: 2 },
      "2026-11-20": { bialka: 3 },
      "2026-11-19": { info: 4 },
    },
    "2026-11-26",
  );

  assert.match(report, /Сьогодні: 2/);
  assert.match(report, /Останні 7 днів: 5/);
  assert.match(report, /Останні 30 днів: 9/);
  assert.match(report, /\/start: 2/);
  assert.match(report, /\/bialka: 3/);
  assert.match(report, /\/info: 4/);
});
