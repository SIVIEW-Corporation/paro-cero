// Helper to format date
export default function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
