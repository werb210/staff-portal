// server/src/middleware/blobSafe.ts
import { Request, Response, NextFunction } from "express";

/**
 * Normalizes Azure blob errors to consistent API responses.
 * Protects all blob routes automatically.
 */
export function blobSafe(handler: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await handler(req, res, next);
    } catch (err: any) {
      console.error("❌ Blob error:", err);

      if (err.message?.includes("AZURE_UPLOAD_FAILED")) {
        return res.status(500).json({
          error: "Failed to upload file to Azure Blob Storage.",
        });
      }

      if (err.message?.includes("AZURE_SAS_FAILED")) {
        return res.status(500).json({
          error: "Failed to generate SAS URL.",
        });
      }

      if (err.message?.includes("AZURE_UPLOAD_SAS_FAILED")) {
        return res.status(500).json({
          error: "Failed to generate upload SAS URL.",
        });
      }

      if (err.message?.includes("AZURE_DELETE_FAILED")) {
        return res.status(500).json({
          error: "Failed to delete Azure blob.",
        });
      }

      return res.status(500).json({
        error: "Blob storage error.",
        detail: err.message,
      });
    }
  };
}
