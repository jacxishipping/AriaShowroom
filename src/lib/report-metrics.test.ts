import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateReportSummary } from "./report-metrics";

describe("calculateReportSummary", () => {
  it("calculates sales, receivables, expenses, and inventory age", () => {
    const now = new Date("2026-01-11T00:00:00.000Z");
    assert.deepEqual(
      calculateReportSummary(
        [
          { salePrice: 20_000, landedCost: 17_000 },
          { salePrice: 15_000, landedCost: 16_000 },
        ],
        [{ amount: 1_200 }, { amount: 800 }],
        [new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-09T00:00:00.000Z")],
        500,
        now
      ),
      {
        salesRevenueUSD: 35_000,
        grossProfitUSD: 2_000,
        receivablesUSD: 2_000,
        expensesUSD: 500,
        activeInventoryCount: 2,
        averageInventoryAgeDays: 6,
      }
    );
  });

  it("returns zero average age for empty inventory", () => {
    assert.equal(calculateReportSummary([], [], [], 0).averageInventoryAgeDays, 0);
  });
});
