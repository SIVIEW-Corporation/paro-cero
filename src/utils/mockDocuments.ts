export interface MockDocument {
  id: string;
  name: string;
  sizeInBytes: number;
  status: 'ready' | 'processing';
  uploadedAt: string;
}

export function generateMockDocuments(count: number): MockDocument[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    id: `DOC-${String(index + 1).padStart(3, '0')}`,
    name: `Documento demo ${index + 1}.pdf`,
    sizeInBytes: 120_000 + index * 4_000,
    status: index % 5 === 0 ? 'processing' : 'ready',
    uploadedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
  }));
}
