export interface ReportSaleMetric {
  salePrice: number;
  landedCost: number;
}

export interface ReportInstallmentMetric {
  amount: number;
}

export function calculateReportSummary(
  sales: ReportSaleMetric[],
  installments: ReportInstallmentMetric[],
  inventoryCreatedAt: Date[],
  expensesUSD: number,
  now: Date = new Date()
) {
  const agesInDays = inventoryCreatedAt.map((createdAt) =>
    Math.max(0, (now.getTime() - createdAt.getTime()) / 86400000)
  );

  return {
    salesRevenueUSD: sales.reduce((total, sale) => total + sale.salePrice, 0),
    grossProfitUSD: sales.reduce((total, sale) => total + sale.salePrice - sale.landedCost, 0),
    receivablesUSD: installments.reduce((total, installment) => total + installment.amount, 0),
    expensesUSD,
    activeInventoryCount: inventoryCreatedAt.length,
    averageInventoryAgeDays: agesInDays.length
      ? agesInDays.reduce((total, age) => total + age, 0) / agesInDays.length
      : 0,
  };
}
