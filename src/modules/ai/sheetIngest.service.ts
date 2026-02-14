import { embedAndStore, type QueryableDb } from "./knowledge.service";

export async function ingestProductSheetText(db: QueryableDb, extractedText: string, sheetId: string) {
  await embedAndStore(db, extractedText, "sheet", sheetId);
}
