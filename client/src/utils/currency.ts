/**
 * Indian Rupee (INR) currency formatter with Indian numbering system.
 * Formats numbers as e.g. ₹1,50,000.00
 */
export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }
  const num = Number(amount);
  return (
    '₹' +
    num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Short formatting without decimals for pipeline summaries (e.g. ₹1,50,000)
 */
export function formatINRCompact(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  return (
    '₹' +
    num.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}
