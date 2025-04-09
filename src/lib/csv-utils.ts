export function generateExportFilename(toolName: string, format: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${toolName.replace(/ /g, '-')}_${date}.${format.toLowerCase()}`;
}

export function parseCsvNumber(value: string): number {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

export function validateCsvHeaders(headers: string[], expected: string[]): boolean {
  return expected.every(h => headers.includes(h));
}