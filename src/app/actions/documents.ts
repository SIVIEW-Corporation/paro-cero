'use server';

import { protectedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { generateMockDocuments } from '@/utils/mockDocuments';

// Schema for fetching documents (could include filters)
const GetDocumentsSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
});

// Implementation of the action
export const getDocumentsAction = protectedAction(
  GetDocumentsSchema,
  async (_input) => {
    // Simulated delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // simulating server filtering
    // Return full dataset for client-side filtering
    return generateMockDocuments(50);
  },
);

// Schema for uploading a document
const UploadDocumentSchema = z.object({
  name: z.string(),
  sizeInBytes: z.number(),
});

export const uploadDocumentAction = protectedAction(
  UploadDocumentSchema,
  async (input, session) => {
    // Simulated delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulated DB insert
    console.log(`Document ${input.name} uploaded by ${session.email}`);

    return {
      success: true,
      message: 'Documento subido correctamente (simulación servidor)',
    };
  },
  'admin',
);
