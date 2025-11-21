import api from "../lib/api";

export const OCRAPI = {
  extract: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/ocr/extract", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};
