import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { translations } from "./translations";

describe("translations", () => {
  it("defines the same keys for English, Dari, and Pashto", () => {
    const englishKeys = Object.keys(translations.en).sort();
    assert.deepEqual(Object.keys(translations.fa).sort(), englishKeys);
    assert.deepEqual(Object.keys(translations.ps).sort(), englishKeys);
  });
});
