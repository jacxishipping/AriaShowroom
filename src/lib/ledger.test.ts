import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_ACCOUNTS } from "./mock-data";
import {
  roundCurrency,
  extractAccountCode,
  createLedgerEntry,
  reverseLedgerEntriesByReference,
  reverseAndDeleteJournalEntry,
} from "./ledger";

function createInMemoryLedgerTx() {
  const accounts = INITIAL_ACCOUNTS.map((a, idx) => ({
    id: `acc-${idx + 1}`,
    code: a.code,
    name: a.name,
    nameDari: a.nameDari,
    type: a.type,
    balanceUSD: 0,
  }));

  const journalEntries: Array<{
    id: string;
    entryNumber: string;
    date: Date;
    description: string;
    reference: string | null;
    debitAccount: string;
    creditAccount: string;
    amountUSD: number;
    amountAFN: number;
    createdAt: Date;
  }> = [];

  const tx = {
    account: {
      createMany: async () => ({ count: 0 }),
      findUnique: async ({ where }: { where: { code?: string; id?: string } }) => {
        const match = accounts.find(
          (a) =>
            (where.code && a.code === where.code) ||
            (where.id && a.id === where.id)
        );
        return match ? { ...match } : null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { balanceUSD: number };
      }) => {
        const target = accounts.find((a) => a.id === where.id);
        if (!target) throw new Error("Account not found");
        target.balanceUSD = data.balanceUSD;
        return { ...target };
      },
    },
    journalEntry: {
      create: async ({ data }: { data: Record<string, any> }) => {
        const record = {
          id: `je-${journalEntries.length + 1}`,
          entryNumber: data.entryNumber,
          date: data.date || new Date(),
          description: data.description,
          reference: data.reference ?? null,
          debitAccount: data.debitAccount,
          creditAccount: data.creditAccount,
          amountUSD: data.amountUSD,
          amountAFN: data.amountAFN,
          createdAt: new Date(),
        };
        journalEntries.push(record);
        return { ...record };
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const found = journalEntries.find((j) => j.id === where.id);
        return found ? { ...found } : null;
      },
      findMany: async ({ where }: { where?: Record<string, any> }) => {
        return journalEntries.filter((j) => {
          if (where?.reference && j.reference !== where.reference) return false;
          if (where?.entryNumber?.startsWith) {
            if (!j.entryNumber.startsWith(where.entryNumber.startsWith)) {
              return false;
            }
          }
          if (where?.NOT?.entryNumber?.startsWith) {
            if (j.entryNumber.startsWith(where.NOT.entryNumber.startsWith)) {
              return false;
            }
          }
          return true;
        });
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = journalEntries.findIndex((j) => j.id === where.id);
        if (idx === -1) throw new Error("Journal entry not found");
        const [removed] = journalEntries.splice(idx, 1);
        return removed;
      },
    },
  };

  const getTrialBalance = () => {
    const totalDebits = roundCurrency(
      accounts
        .filter((a) => a.type === "ASSET" || a.type === "EXPENSE")
        .reduce((sum, a) => sum + a.balanceUSD, 0)
    );
    const totalCredits = roundCurrency(
      accounts
        .filter(
          (a) =>
            a.type === "LIABILITY" ||
            a.type === "EQUITY" ||
            a.type === "REVENUE"
        )
        .reduce((sum, a) => sum + a.balanceUSD, 0)
    );
    return { totalDebits, totalCredits };
  };

  const getBalance = (code: string) =>
    accounts.find((a) => a.code === code)?.balanceUSD ?? 0;

  return { tx: tx as any, accounts, journalEntries, getTrialBalance, getBalance };
}

test("roundCurrency and extractAccountCode handle edge cases cleanly", () => {
  assert.equal(roundCurrency(0.1 + 0.2), 0.3);
  assert.equal(roundCurrency(19999.999), 20000);
  assert.equal(roundCurrency(Number.NaN), 0);
  assert.equal(
    extractAccountCode("1040 - Vehicle Inventory Asset (Lot & Port)"),
    "1040"
  );
});

test("double-entry lifecycle preserves Trial Balance across opening stock, sale, and void reversal", async () => {
  const { tx, getTrialBalance, getBalance } = createInMemoryLedgerTx();

  // 1. Add vehicle to lot ($42,000 landed cost)
  await createLedgerEntry(tx, {
    entryNumber: "JE-INV-INIT-101",
    description: "Opening stock ARI-HRT-101",
    reference: "ARI-HRT-101",
    debitAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
    creditAccount: "3010 - Owner Capital & Equity",
    amountUSD: 42000,
    amountAFN: 2961000,
  });

  assert.equal(getBalance("1040"), 42000);
  assert.equal(getBalance("3010"), 42000);
  assert.deepEqual(getTrialBalance(), { totalDebits: 42000, totalCredits: 42000 });

  // 2. Sell vehicle via Sarrafi for $50,000 (COGS $42,000 + Revenue $50,000)
  await createLedgerEntry(tx, {
    entryNumber: "JE-COGS-101",
    description: "COGS ARI-HRT-101",
    reference: "ARI-CNT-2026-001",
    debitAccount: "5010 - COGS - Vehicle Purchase Cost",
    creditAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
    amountUSD: 42000,
    amountAFN: 2961000,
  });
  await createLedgerEntry(tx, {
    entryNumber: "JE-SALE-101",
    description: "Sale ARI-CNT-2026-001",
    reference: "ARI-CNT-2026-001",
    debitAccount: "1020 - Sarrafi Khorasan Holding Account",
    creditAccount: "4010 - Vehicle Sales Revenue",
    amountUSD: 50000,
    amountAFN: 3525000,
  });

  assert.equal(getBalance("1040"), 0);
  assert.equal(getBalance("5010"), 42000);
  assert.equal(getBalance("1020"), 50000);
  assert.equal(getBalance("4010"), 50000);
  assert.deepEqual(getTrialBalance(), { totalDebits: 92000, totalCredits: 92000 });

  // 3. Void sale contract -> reverses COGS and Revenue idempotently
  const reversals = await reverseLedgerEntriesByReference(
    tx,
    "ARI-CNT-2026-001",
    "Sale contract voided"
  );
  assert.equal(reversals.length, 2);
  assert.equal(getBalance("1040"), 42000);
  assert.equal(getBalance("5010"), 0);
  assert.equal(getBalance("1020"), 0);
  assert.equal(getBalance("4010"), 0);
  assert.deepEqual(getTrialBalance(), { totalDebits: 42000, totalCredits: 42000 });

  // Calling reversal a second time for the same reason is a no-op
  const duplicateReversals = await reverseLedgerEntriesByReference(
    tx,
    "ARI-CNT-2026-001",
    "Sale contract voided"
  );
  assert.equal(duplicateReversals.length, 0);
  assert.equal(getBalance("1040"), 42000);
});

test("reverseAndDeleteJournalEntry restores account balances and removes entry", async () => {
  const { tx, journalEntries, getBalance, getTrialBalance } =
    createInMemoryLedgerTx();

  const created = await createLedgerEntry(tx, {
    entryNumber: "JE-MAN-001",
    description: "Manual capital injection",
    reference: "CAP-01",
    debitAccount: "1010 - Showroom Central Cash Safe",
    creditAccount: "3010 - Owner Capital & Equity",
    amountUSD: 15000,
    amountAFN: 1057500,
  });

  assert.equal(getBalance("1010"), 15000);
  assert.equal(getBalance("3010"), 15000);

  await reverseAndDeleteJournalEntry(tx, created.id);

  assert.equal(journalEntries.length, 0);
  assert.equal(getBalance("1010"), 0);
  assert.equal(getBalance("3010"), 0);
  assert.deepEqual(getTrialBalance(), { totalDebits: 0, totalCredits: 0 });
});

test("createLedgerEntry rejects invalid amounts and identical debit/credit accounts", async () => {
  const { tx } = createInMemoryLedgerTx();

  await assert.rejects(
    () =>
      createLedgerEntry(tx, {
        entryNumber: "JE-BAD-1",
        description: "Zero amount",
        debitAccount: "1010 - Showroom Central Cash Safe",
        creditAccount: "3010 - Owner Capital & Equity",
        amountUSD: 0,
        amountAFN: 0,
      }),
    /greater than zero/
  );

  await assert.rejects(
    () =>
      createLedgerEntry(tx, {
        entryNumber: "JE-BAD-2",
        description: "Same account",
        debitAccount: "1010 - Showroom Central Cash Safe",
        creditAccount: "1010 - Showroom Central Cash Safe",
        amountUSD: 500,
        amountAFN: 35250,
      }),
    /different debit and credit accounts/
  );
});
