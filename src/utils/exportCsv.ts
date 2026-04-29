export interface CsvColumn<TRecord> {
  header: string;
  value: (
    record: TRecord,
  ) => string | number | boolean | Date | null | undefined;
}

interface ExportToCsvParams<TRecord> {
  filename: string;
  columns: CsvColumn<TRecord>[];
  rows: TRecord[];
}

function escapeCsvValue(
  value: string | number | boolean | Date | null | undefined,
) {
  const normalizedValue = value instanceof Date ? value.toISOString() : value;
  const stringValue = String(normalizedValue ?? '');

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function exportToCsv<TRecord>({
  filename,
  columns,
  rows,
}: ExportToCsvParams<TRecord>) {
  const csvContent = [
    columns.map((column) => escapeCsvValue(column.header)).join(','),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvValue(column.value(row))).join(','),
    ),
  ].join('\r\n');

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
