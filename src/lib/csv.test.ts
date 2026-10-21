import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, parseCsvNumber } from "./csv";

describe("parseCsv", () => {
  it("parses headers, commas, escaped quotes, and CRLF", () => {
    assert.deepEqual(
      parseCsv('\uFEFFname,notes\r\n"Herat, Motors","said ""ready"""\r\n'),
      [["name", "notes"], ["Herat, Motors", 'said "ready"']]
    );
  });

  it("preserves line breaks inside quoted fields", () => {
    assert.deepEqual(parseCsv('name,description\nCar,"first line\nsecond line"'), [
      ["name", "description"],
      ["Car", "first line\nsecond line"],
    ]);
  });

  it("rejects unterminated quoted fields", () => {
    assert.throws(() => parseCsv('name,description\nCar,"unfinished'), /unterminated/i);
  });

  it("does not coerce blank required numbers to zero", () => {
    assert.equal(Number.isNaN(parseCsvNumber("")), true);
    assert.equal(parseCsvNumber("", 0), 0);
    assert.equal(parseCsvNumber(" 42 "), 42);
  });
});
