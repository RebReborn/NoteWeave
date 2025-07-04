
'use server';
/**
 * @fileOverview A flow to export user notes to Google Sheets.
 *
 * - exportNotesToSheet - A function that takes notes and a Google OAuth access token to create a Google Sheet.
 * - ExportNotesInput - The input type for the exportNotesToSheet function.
 * - ExportNotesOutput - The return type for the exportNotesToSheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import type { Note } from '@/lib/types';

const ExportNotesInputSchema = z.object({
  notes: z.array(z.any()).describe('An array of note objects to be exported.'),
  accessToken: z
    .string()
    .describe('A Google OAuth2 access token with spreadsheet permissions.'),
});
export type ExportNotesInput = z.infer<typeof ExportNotesInputSchema>;

const ExportNotesOutputSchema = z.object({
  sheetUrl: z.string().url().describe('The URL of the newly created Google Sheet.'),
});
export type ExportNotesOutput = z.infer<typeof ExportNotesOutputSchema>;

export async function exportNotesToSheet(
  input: ExportNotesInput
): Promise<ExportNotesOutput> {
  return exportNotesToSheetFlow(input);
}

const exportNotesToSheetFlow = ai.defineFlow(
  {
    name: 'exportNotesToSheetFlow',
    inputSchema: ExportNotesInputSchema,
    outputSchema: ExportNotesOutputSchema,
  },
  async ({ notes, accessToken }) => {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `NoteWeave Export - ${new Date().toLocaleString()}`,
        },
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Failed to create spreadsheet.');
    }

    const sheetData = (notes as Note[]).map(note => [
      note.id,
      note.title,
      note.content,
      note.tags.join(', '),
      note.createdAt,
      note.updatedAt,
      note.pinned ? 'Yes' : 'No',
    ]);

    const header = [
      'ID',
      'Title',
      'Content',
      'Tags',
      'Created At',
      'Updated At',
      'Pinned',
    ];
    const values = [header, ...sheetData];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    if (!spreadsheet.data.spreadsheetUrl) {
      throw new Error('Could not get spreadsheet URL.');
    }
    
    return {
      sheetUrl: spreadsheet.data.spreadsheetUrl,
    };
  }
);
