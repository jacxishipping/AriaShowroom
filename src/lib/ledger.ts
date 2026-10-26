import { Prisma } from "@prisma/client";
import { INITIAL_ACCOUNTS } from "@/lib/mock-data";

export type LedgerEntryInput = {
  entryNumber: string;
  date?: Date;
  description: string;
  reference?: string | null;
  debitAccount: string;
  creditAccount: string;
  amountUSD: number;
  amountAFN: number;
};

export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function extractAccountCode(accountLabel: string): string {
  return String(accountLabel || "").split(" - ")[0].trim();
}

export async function ensureChartOfAccounts(tx: Prisma.TransactionClient) {
  await tx.account.createMany({
    data: INITIAL_ACCOUNTS,
    skipDuplicates: true,
  });
}

export async function createLedgerEntry(
  tx: Prisma.TransactionClient,
  entry: LedgerEntryInput
) {
  const amount = roundCurrency(entry.amountUSD);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Journal entry amount must be greater than zero");
  }

  await ensureChartOfAccounts(tx);

  const debitCode = extractAccountCode(entry.debitAccount);
  const creditCode = extractAccountCode(entry.creditAccount);
  if (!debitCode || !creditCode) {
    throw new Error("Both debit and credit account codes are required");
  }
  if (debitCode === creditCode) {
    throw new Error("Journal entry must use different debit and credit accounts");
  }

  const [debit, credit] = await Promise.all([
    tx.account.findUnique({ where: { code: debitCode } }),
    tx.account.findUnique({ where: { code: creditCode } }),
  ]);

  if (!debit || !credit) {
    throw new Error("Journal entry references an account that is not in the chart of accounts");
  }

  const journalEntry = await tx.journalEntry.create({
    data: {
      ...entry,
      amountUSD: amount,
      amountAFN: Math.round(entry.amountAFN),
    },
  });

  const debitDelta = debit.type === "ASSET" || debit.type === "EXPENSE" ? amount : -amount;
  const creditDelta = credit.type === "ASSET" || credit.type === "EXPENSE" ? -amount : amount;

  const nextDebitBalance = roundCurrency(debit.balanceUSD + debitDelta);
  const nextCreditBalance = roundCurrency(credit.balanceUSD + creditDelta);

  await tx.account.update({
    where: { id: debit.id },
    data: { balanceUSD: nextDebitBalance },
  });
  await tx.account.update({
    where: { id: credit.id },
    data: { balanceUSD: nextCreditBalance },
  });

  return journalEntry;
}

/**
 * Posts offsetting reversal journal entries (swapping debit & credit accounts)
 * for all original journal entries matching `reference`. Preserves an immutable
 * General Journal audit trail while restoring Account.balanceUSD parity.
 */
export async function reverseLedgerEntriesByReference(
  tx: Prisma.TransactionClient,
  reference: string | null | undefined,
  reason: string
) {
  if (!reference) return [];

  await ensureChartOfAccounts(tx);

  const entries = await tx.journalEntry.findMany({
    where: {
      reference,
      NOT: { entryNumber: { startsWith: "JE-REV-" } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (entries.length === 0) return [];

  const existingReversals = await tx.journalEntry.findMany({
    where: {
      reference,
      entryNumber: { startsWith: "JE-REV-" },
    },
    select: { description: true },
  });
  const reversedMarkers = new Set(existingReversals.map((r) => r.description));

  const createdReversals = [];
  for (const original of entries) {
    const marker = `[REV:${original.entryNumber}] ${reason}`;
    if (reversedMarkers.has(marker)) continue;

    const reversal = await createLedgerEntry(tx, {
      entryNumber: `JE-REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      description: marker,
      reference,
      debitAccount: original.creditAccount,
      creditAccount: original.debitAccount,
      amountUSD: original.amountUSD,
      amountAFN: original.amountAFN,
    });
    createdReversals.push(reversal);
  }

  return createdReversals;
}

/**
 * Reverses the balance impact of a single JournalEntry on Account.balanceUSD
 * and deletes the JournalEntry record.
 */
export async function reverseAndDeleteJournalEntry(
  tx: Prisma.TransactionClient,
  entryId: string
) {
  await ensureChartOfAccounts(tx);

  const existing = await tx.journalEntry.findUnique({ where: { id: entryId } });
  if (!existing) {
    throw new Error("Journal entry not found");
  }

  const amount = roundCurrency(existing.amountUSD);
  const debitCode = extractAccountCode(existing.debitAccount);
  const creditCode = extractAccountCode(existing.creditAccount);

  const [debit, credit] = await Promise.all([
    debitCode ? tx.account.findUnique({ where: { code: debitCode } }) : null,
    creditCode ? tx.account.findUnique({ where: { code: creditCode } }) : null,
  ]);

  if (debit && amount > 0) {
    const originalDebitDelta =
      debit.type === "ASSET" || debit.type === "EXPENSE" ? amount : -amount;
    await tx.account.update({
      where: { id: debit.id },
      data: { balanceUSD: roundCurrency(debit.balanceUSD - originalDebitDelta) },
    });
  }

  if (credit && amount > 0) {
    const originalCreditDelta =
      credit.type === "ASSET" || credit.type === "EXPENSE" ? -amount : amount;
    await tx.account.update({
      where: { id: credit.id },
      data: { balanceUSD: roundCurrency(credit.balanceUSD - originalCreditDelta) },
    });
  }

  await tx.journalEntry.delete({ where: { id: entryId } });
  return existing;
}
