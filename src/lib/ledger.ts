import { Prisma } from "@prisma/client";
import { INITIAL_ACCOUNTS } from "@/lib/mock-data";

type LedgerEntryInput = {
  entryNumber: string;
  date?: Date;
  description: string;
  reference?: string | null;
  debitAccount: string;
  creditAccount: string;
  amountUSD: number;
  amountAFN: number;
};

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
  if (!Number.isFinite(entry.amountUSD) || entry.amountUSD <= 0) {
    throw new Error("Journal entry amount must be greater than zero");
  }

  await ensureChartOfAccounts(tx);

  const debitCode = entry.debitAccount.split(" - ")[0].trim();
  const creditCode = entry.creditAccount.split(" - ")[0].trim();
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

  const journalEntry = await tx.journalEntry.create({ data: entry });
  const amount = entry.amountUSD;
  const debitDelta = debit.type === "ASSET" || debit.type === "EXPENSE" ? amount : -amount;
  const creditDelta = credit.type === "ASSET" || credit.type === "EXPENSE" ? -amount : amount;

  await tx.account.update({
    where: { id: debit.id },
    data: { balanceUSD: { increment: debitDelta } },
  });
  await tx.account.update({
    where: { id: credit.id },
    data: { balanceUSD: { increment: creditDelta } },
  });

  return journalEntry;
}